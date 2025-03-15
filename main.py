import asyncio
import os
import json
import sys

from aiohttp import web
import shlex
import decky_plugin
import zipfile
import shutil
import aiohttp
import os
import concurrent.futures


class Helper:
    websocket_port = 8765
    action_cache = {}
    working_directory = decky_plugin.DECKY_PLUGIN_RUNTIME_DIR
       
    ws_loop = None
    app = None
    site = None
    runner = None
    wsServerIsRunning = False

    verbose = False
    
    lock = asyncio.Lock()
    @staticmethod
    async def pyexec_subprocess(cmd: str, input: str = '', unprivilege: bool = False, env=None, websocket=None, stream_output: bool = False, app_id='', game_id=''):
        decky_plugin.logger.info(f"creating lock")
        async with Helper.lock:
            try:
                decky_plugin.logger.info(f"inside lock")
                if unprivilege:
                    cmd = f'sudo -u {decky_plugin.DECKY_USER} {cmd}'
                decky_plugin.logger.info(f"running cmd: {cmd}")
                if env is None:
                    env = Helper.get_environment()
                    env['APP_ID'] = app_id
                    env['SteamOverlayGameId'] = game_id
                    env['SteamGameId'] = game_id
                proc = await asyncio.create_subprocess_shell(cmd,
                                                            stdout=asyncio.subprocess.PIPE,
                                                            stderr=asyncio.subprocess.PIPE,
                                                            stdin=asyncio.subprocess.PIPE,
                                                            shell=True,
                                                            env=env,
                                                            cwd=Helper.working_directory,
                                                            start_new_session=True,
                                                            
                                                            )
                if stream_output:
                    while True:
                        stdout = await proc.stdout.readline()
                        stderr = await proc.stderr.readline()
                        if stdout:
                            stdout = stdout.decode()
                            if stream_output:
                                await websocket.send_str(json.dumps({'status': 'open', 'data': stdout}))
                        if stderr:
                            stderr = stderr.decode()
                            if stream_output:
                                await websocket.send_str(json.dumps({'status': 'open', 'data': stderr}))
                        if proc.stdout.at_eof() and proc.stderr.at_eof():
                            await websocket.send_str(json.dumps({'status': 'closed', 'data': ''}))
                            break
                    await proc.wait()
                    return {'returncode': proc.returncode}
                else:
                    # await proc.wait()
                    stdout, stderr = await proc.communicate(input.encode())
                    # await proc.wait()
                    stdout = stdout.decode()
                    stderr = stderr.decode()
                    if Helper.verbose:
                        decky_plugin.logger.info(
                            f'Returncode: {proc.returncode}\nSTDOUT: {stdout[:300]}\nSTDERR: {stderr[:300]}')
                    return {'returncode': proc.returncode, 'stdout': stdout, 'stderr': stderr}

            except Exception as e:
                decky_plugin.logger.error(f"Error in pyexec_subprocess: {e}")
                return None
            

    @staticmethod
    def get_environment(platform=""):
        env = {"DECKY_HOME": decky_plugin.DECKY_HOME,
               "DECKY_PLUGIN_DIR": decky_plugin.DECKY_PLUGIN_DIR,
               "DECKY_PLUGIN_LOG_DIR": decky_plugin.DECKY_PLUGIN_LOG_DIR,
               "DECKY_PLUGIN_NAME": "junk-store",
               "DECKY_PLUGIN_RUNTIME_DIR": decky_plugin.DECKY_PLUGIN_RUNTIME_DIR,
               "DECKY_PLUGIN_SETTINGS_DIR": decky_plugin.DECKY_PLUGIN_SETTINGS_DIR,
               "WORKING_DIR": Helper.working_directory,
               "CONTENT_SERVER": "http://localhost:1337/plugins",
               "DECKY_USER_HOME": decky_plugin.DECKY_USER_HOME,
               "HOME": os.path.abspath(decky_plugin.DECKY_USER_HOME),
               "PLATFORM": platform}
        return env

    @staticmethod
    async def call_script(cmd: str, *args, input_data='', app_id='', game_id=''):
        try:
            decky_plugin.logger.info(
                f"call_script: {cmd} {args} {input_data}")
            encoded_args = [shlex.quote(arg) for arg in args]
            decky_plugin.logger.info(
                f"call_script: {cmd} {' '.join(encoded_args)}")
            decky_plugin.logger.info(f"input_data: {input_data}")
            decky_plugin.logger.info(f"args: {args}")
            cmd = f"{cmd} {' '.join(encoded_args)}"

            res = await Helper.pyexec_subprocess(cmd, input_data, app_id=app_id, game_id=game_id)
            if Helper.verbose:
                decky_plugin.logger.info(
                    f"call_script result: {res['stdout'][:100]}")
            return res['stdout']
        except Exception as e:
            decky_plugin.logger.error(f"Error in call_script: {e}")
            return None

    @staticmethod
    def get_action(actionSet, actionName):
        result = None
        if set := Helper.action_cache.get(actionSet):
            for action in set:
                if action['Id'] == actionName:
                    result = action
        if not result:
            file_path = os.path.join(
                Helper.working_directory, f"{actionSet}.json")
            if not os.path.exists(file_path):
                file_path = os.path.join(
                    decky_plugin.DECKY_PLUGIN_RUNTIME_DIR, ".cache", f"{actionSet}.json")

            if os.path.exists(file_path):
                with open(file_path) as f:
                    data = json.load(f)
                    for action in data:
                        if action['Id'] == actionName:
                            result = action
        return result

    @staticmethod
    async def execute_action(actionSet, actionName, *args, input_data='', app_id='', game_id=''):
        try:
            result = ""
            json_result = {}
            action = Helper.get_action(actionSet, actionName)
            cmd = action['Command']
            if cmd:
                decky_plugin.logger.info(
                    f"execute_action cmd: {cmd}")
                decky_plugin.logger.info(
                    f"execute_action args: {args}")
                decky_plugin.logger.info(
                    f"execute_action app_id: {app_id}")
                decky_plugin.logger.info(
                    f"execute_action game_id: {game_id}")

                decky_plugin.logger.info(
                    f"execute_action input_data: {input_data}")
                result = await Helper.call_script(os.path.expanduser(cmd), *args, input_data=input_data, app_id=app_id, game_id=game_id)
                if Helper.verbose:
                    decky_plugin.logger.info(
                        f"execute_action result: {result}")
                try:
                    json_result = json.loads(result)
                    if json_result['Type'] == 'ActionSet':
                        decky_plugin.logger.info(
                            f"Init action set {json_result['Content']['SetName']}")
                        Helper.write_action_set_to_cache(
                            json_result['Content']['SetName'], json_result['Content']['Actions'])
                except Exception as e:
                    decky_plugin.logger.info(
                        "Error parsing json result", e)
                    json_result = {'Type': 'Error',
                                   'Content': {
                                       'Message': f"Error parsing json result {e}", 'Data': result, 'ActionName': actionName, 'ActionSet': actionSet}}
                return json_result
            return {'Type': 'Error', 'Content': {'Message': f"Action not found {actionSet}, {actionName}", 'Data': result[:300]}, 'ActionName': actionName, 'ActionSet': actionSet}

        except Exception as e:
            decky_plugin.logger.error(f"Error executing action: {e}")
            return {'Type': 'Error', 'Content': {'Message': 'Action not found', 'Data': str(e), 'ActionName': actionName, 'ActionSet': actionSet}}

    @staticmethod
    def write_action_set_to_cache(setName, actionSet, writeToDisk: bool = False):
        Helper.action_cache[setName] = actionSet
        if writeToDisk:
            cache_dir = os.path.join(
                decky_plugin.DECKY_PLUGIN_RUNTIME_DIR, ".cache")
            if not os.path.exists(cache_dir):
                os.makedirs(cache_dir)
            file_path = os.path.join(cache_dir, f"{setName}.json")

            # if not os.path.exists(file_path):
            with open(file_path, 'w') as f:
                json.dump(actionSet, f)

    @staticmethod
    async def ws_handler(request):
        websocket = web.WebSocketResponse()
        await websocket.prepare(request)

        try:
            async for message in websocket:
                decky_plugin.logger.info(f"ws_handler message: {message.data}")
                data = json.loads(message.data)
                if (data['action'] == 'install_dependencies'):
                    await Helper.pyexec_subprocess("./scripts/install_deps.sh", websocket=websocket, stream_output=True)
                if (data['action'] == 'uninstall_dependencies'):
                    await Helper.pyexec_subprocess("./scripts/install_deps.sh uninstall",  websocket=websocket, stream_output=True)
                    

        except Exception as e:
            decky_plugin.logger.error(f"Error in ws_handler: {e}")

    async def start_ws_server():
        Helper.ws_loop = asyncio.get_event_loop()
        with concurrent.futures.ThreadPoolExecutor() as pool:
            await Helper._start_ws_server_thread()

    @staticmethod
    async def _start_ws_server_thread():
        try:
            Helper.wsServerIsRunning = True
            port = 8765
            while Helper.wsServerIsRunning:
                try:
                    decky_plugin.logger.info(
                        f"Starting WebSocket server on port {port}")

                    # Helper.runner.setup()
                    Helper.app = web.Application()
                    Helper.app.router.add_get('/ws', Helper.ws_handler)
                    Helper.runner = web.AppRunner(Helper.app)
                    await Helper.runner.setup()
                    Helper.site = web.TCPSite(Helper.runner, 'localhost', port)

                    Helper.websocket_port = port
                    await Helper.site.start()
                    break
                except OSError:
                    port += 1

            decky_plugin.logger.info("WebSocket server started")

        except Exception as e:
            decky_plugin.logger.error(f"Error in start_ws_server: {e}")

    async def stop_ws_server():
        try:

            decky_plugin.logger.info("Stopping WebSocket server")
            if Helper.site:
                decky_plugin.logger.info("Stopping site")
                await Helper.site.stop()
                decky_plugin.logger.info("Site stopped")

            if Helper.runner:

                await Helper.runner.cleanup()
                decky_plugin.logger.info("Runner cleaned up")

            for ws in Helper.app['websockets']:
                decky_plugin.logger.info("Closing websocket")
                await ws.close()

        except Exception as e:
            decky_plugin.logger.error(f"Error in stop_ws_server: {e}")
        finally:
            Helper.ws_loop.stop()
            decky_plugin.logger.info("WebSocket server stopped")
            Helper.wsServerIsRunning = False


# import requests


class Plugin:

    async def _main(self):
        decky_plugin.logger.info("Junk-Store starting up...")
        try:
            Helper.action_cache = {}
            if os.path.exists(os.path.join(decky_plugin.DECKY_PLUGIN_RUNTIME_DIR, "init.json")):
                Helper.working_directory = decky_plugin.DECKY_PLUGIN_RUNTIME_DIR
            else:
                Helper.working_directory = decky_plugin.DECKY_PLUGIN_DIR

            decky_plugin.logger.info(
                f"plugin: {decky_plugin.DECKY_PLUGIN_NAME} dir: {decky_plugin.DECKY_PLUGIN_RUNTIME_DIR}")
            # pass cmd argument to _call_script method
            decky_plugin.logger.info("Junk Store initializing")
            result = await Helper.execute_action("init", "init")
            decky_plugin.logger.info("Junk Store initialized")
            if Helper.verbose:
                decky_plugin.logger.info(f"init result: {result}")
            await Helper.start_ws_server()
            decky_plugin.logger.info("Junk-Store started")

        except Exception as e:
            decky_plugin.logger.error(f"Error in _main: {e}")

    async def reload(self):
        try:
            Helper.action_cache = {}
            if os.path.exists(os.path.join(decky_plugin.DECKY_PLUGIN_RUNTIME_DIR, "init.json")):
                Helper.working_directory = decky_plugin.DECKY_PLUGIN_RUNTIME_DIR
            else:
                Helper.working_directory = decky_plugin.DECKY_PLUGIN_DIR

            decky_plugin.logger.info(
                f"plugin: {decky_plugin.DECKY_PLUGIN_NAME} dir: {decky_plugin.DECKY_PLUGIN_RUNTIME_DIR}")
            # pass cmd argument to _call_script method
            result = await Helper.execute_action("init", "init")
            if Helper.verbose:
                decky_plugin.logger.info(f"init result: {result}")
        except Exception as e:
            decky_plugin.logger.error(f"Error in _main: {e}")

    async def get_websocket_port(self):
        return Helper.websocket_port    

    # ...

    async def execute_action(self, actionSet, actionName, inputData='', gameId='', appId='', *args, **kwargs):
        try:
            decky_plugin.logger.info(
                f"execute_action: {actionSet} {actionName} ")
            decky_plugin.logger.info(f"execute_action args: {args}")
            if Helper.verbose:
                decky_plugin.logger.info(f"execute_action kwargs: {kwargs}")

            if isinstance(inputData, (dict, list)):
                inputData = json.dumps(inputData)
            
            result = await Helper.execute_action(actionSet, actionName, *args, *kwargs.values(), input_data=inputData, game_id=gameId, app_id=appId)
            if Helper.verbose:
                decky_plugin.logger.info(f"execute_action result: {result}")
            return result
        except Exception as e:
            decky_plugin.logger.error(f"Error in execute_action: {e}")
            return None

    async def download_custom_backend(self, url, backup: bool = False):
        try:
            runtime_dir = decky_plugin.DECKY_PLUGIN_RUNTIME_DIR
            decky_plugin.logger.info(f"Downloading file from {url}")

            # Create a temporary file to save the downloaded zip file
            temp_file = "/tmp/custom_backend.zip"
            # disabling ssl verfication for testing, github doesn't seem to have a valid ssl cert, seems wrong
            async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=False)) as session:
                decky_plugin.logger.info(f"Downloading {url}")
                async with session.get(url, allow_redirects=True) as response:
                    decky_plugin.logger.debug(f"Response status: {response}")
                    # assert response.status == 200 
                    with open(temp_file, "wb") as f:
                        while True:
                            chunk = await response.content.readany()
                            if not chunk:
                                break
                            f.write(chunk)
            decky_plugin.logger.debug(f"Downloaded {temp_file} from {url}")
            # Extract the contents of the zip file to the runtime directory

            if backup:
                # Find the latest backup folder
                decky_plugin.logger.info("Creating backup")
                backup_dir = os.path.join(runtime_dir, "backup")
                backup_count = 1
                while os.path.exists(f"{backup_dir} {backup_count}"):
                    backup_count += 1
                latest_backup_dir = f"{backup_dir} {backup_count}"
                decky_plugin.logger.info(f"Creating backup at {latest_backup_dir}")

                # Create the latest backup folder
                os.makedirs(latest_backup_dir, exist_ok=True)

                # Move non-backup files to the latest backup folder
                for item in os.listdir(runtime_dir):
                    item_path = os.path.join(runtime_dir, item)
                    if (os.path.isfile(item_path) or os.path.isdir(item_path)) and not item.startswith("backup"):
                        if item.endswith(".db"):
                            shutil.copy(item_path, latest_backup_dir)
                        else:
                            shutil.move(item_path, latest_backup_dir)
                decky_plugin.logger.info(
                    "Backup completed successfully")
               

            with zipfile.ZipFile(temp_file, "r") as zip_ref:
                zip_ref.extractall(runtime_dir)
                scripts_dir = os.path.join(
                    decky_plugin.DECKY_PLUGIN_RUNTIME_DIR, "scripts")
                for root, dirs, files in os.walk(scripts_dir):
                    for file in files:
                        file_path = os.path.join(root, file)
                        os.chmod(file_path, 0o755)

            decky_plugin.logger.info(
                "Download and extraction completed successfully")

        except Exception as e:
            decky_plugin.logger.error(f"Error in download_custom_backend: {e}")

    async def get_logs(self):
        log_dir = decky_plugin.DECKY_PLUGIN_LOG_DIR
        log_files = []
        for file in os.listdir(log_dir):
            if file.endswith(".log"):
                file_path = os.path.join(log_dir, file)
                with open(file_path, "r") as f:
                    content = f.read()
                    log_files.append({"FileName": file, "Content": content})
        log_files.sort(key=lambda x: x['FileName'], reverse=True)
        with open(os.path.join(decky_plugin.DECKY_USER_HOME, ".local/share/Steam/logs/console_log.txt"), "r") as f:
            content = f.read()
            log_files.append(
                {"FileName": "console_log.txt", "Content": content})

        return log_files

    async def _unload(self):
        await Helper.stop_ws_server()
        decky_plugin.logger.info("Junk-Store out!")
        #sys.exit(0)

    async def _migration(self):
        plugin_dir = "Junk-Store"
        decky_plugin.logger.info("Migrating")
        # Here's a migration example for logs:
        # - `~/.config/decky-template/template.log` will be migrated to `decky_plugin.DECKY_PLUGIN_LOG_DIR/template.log`
        decky_plugin.migrate_logs(os.path.join(decky_plugin.DECKY_USER_HOME,
                                               ".config", plugin_dir, "template.log"))
        # Here's a migration example for settings:
        # - `~/homebrew/settings/template.json` is migrated to `decky_plugin.DECKY_PLUGIN_SETTINGS_DIR/template.json`
        # - `~/.config/decky-template/` all files and directories under this root are migrated to `decky_plugin.DECKY_PLUGIN_SETTINGS_DIR/`
        decky_plugin.migrate_settings(
            os.path.join(decky_plugin.DECKY_HOME, "settings", "template.json"),
            os.path.join(decky_plugin.DECKY_USER_HOME, ".config", plugin_dir))
        # Here's a migration example for runtime data:
        # - `~/homebrew/template/` all files and directories under this root are migrated to `decky_plugin.DECKY_PLUGIN_RUNTIME_DIR/`
        # - `~/.local/share/decky-template/` all files and directories under this root are migrated to `decky_plugin.DECKY_PLUGIN_RUNTIME_DIR/`
        decky_plugin.migrate_runtime(
            os.path.join(decky_plugin.DECKY_HOME, plugin_dir),
            os.path.join(decky_plugin.DECKY_USER_HOME, ".local", "share", plugin_dir))
