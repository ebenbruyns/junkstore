import asyncio
import os
import json
import shlex
import decky_plugin
# import requests
import zipfile
import shutil
import aiohttp


class Helper:

    action_cache = {}
    working_directory = decky_plugin.DECKY_PLUGIN_RUNTIME_DIR

    @staticmethod
    async def pyexec_subprocess(cmd: str, input: str = '', unprivilege: bool = False, env=None):
        try:
            if unprivilege:
                cmd = f'sudo -u {decky_plugin.DECKY_USER} {cmd}'
            decky_plugin.logger.info("running cmd: " + cmd)
            # decky_plugin.logger.info(f'[{moduleName}.pyexec_subprocess]: "{cmd}"')
            if env == None:
                env = Helper.get_environment()
            # decky_plugin.logger.info(f"env: {env}")
            proc = await asyncio.create_subprocess_shell(cmd,
                                                         stdout=asyncio.subprocess.PIPE,
                                                         stderr=asyncio.subprocess.PIPE,
                                                         stdin=asyncio.subprocess.PIPE,
                                                         shell=True,
                                                         env=env,
                                                         cwd=Helper.working_directory
                                                         )
            # await proc.wait()
            stdout, stderr = await proc.communicate(input.encode())
            # await proc.wait()
            stdout = stdout.decode()
            stderr = stderr.decode()
            # decky_plugin.logger.info(
            #    f'Returncode: {proc.returncode}\nSTDOUT: {stdout[:300]}\nSTDERR: {stderr[:300]}')
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
               "CONTENT_SERVER": "http://localhost:1337/plugins",
               "DECKY_USER_HOME": decky_plugin.DECKY_USER_HOME,
               "HOME": os.path.abspath(decky_plugin.DECKY_USER_HOME),
               "PLATFORM": platform}
        return env

    @staticmethod
    async def call_script(cmd: str, *args, input_data=''):
        try:
          #  decky_plugin.logger.info(
          #      f"call_script: {cmd} {args} {input_data}")
            encoded_args = [shlex.quote(arg) for arg in args]
            decky_plugin.logger.info(
                f"call_script: {cmd} {' '.join(encoded_args)}")
            # decky_plugin.logger.info(f"input_data: {input_data}")
            decky_plugin.logger.info(f"args: {args}")
            cmd = f"{cmd} {' '.join(encoded_args)}"

            res = await Helper.pyexec_subprocess(cmd, input_data)
            # decky_plugin.logger.info(
            #    f"call_script result: {res['stdout'][:100]}")
            return res['stdout']
        except Exception as e:
            decky_plugin.logger.error(f"Error in call_script: {e}")
            return None

    @staticmethod
    def get_action(actionSet, actionName):
        result = None
        set = Helper.action_cache.get(actionSet)
        if set:
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
    async def execute_action(actionSet, actionName, *args, input_data=''):
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
                # decky_plugin.logger.info(
                #    f"execute_action input_data: {input_data}")
                result = await Helper.call_script(os.path.expanduser(cmd), *args, input_data=input_data)
                # decky_plugin.logger.info(
                #    f"execute_action result: {result}")
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
            return json.dumps({'Type': 'Error', 'Content': {'Message': f"Action not found {actionSet}, {actionName}", 'Data': result[:300]}, 'ActionName': actionName, 'ActionSet': actionSet})

        except Exception as e:
            decky_plugin.logger.error(f"Error executing action: {e}")
            return json.dumps({'Type': 'Error', 'Content': {'Message': 'Action not found', 'Data': str(e), 'ActionName': actionName, 'ActionSet': actionSet}})

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


class Plugin:

    async def _main(self):
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
           # decky_plugin.logger.info(f"init result: {result}")
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
           # decky_plugin.logger.info(f"init result: {result}")
        except Exception as e:
            decky_plugin.logger.error(f"Error in _main: {e}")

    async def execute_action(self, actionSet, actionName, inputData='', *args, **kwargs):
        try:
            decky_plugin.logger.info(
                f"execute_action: {actionSet} {actionName} ")
            decky_plugin.logger.info(f"execute_action args: {args}")
            decky_plugin.logger.info(f"execute_action kwargs: {kwargs}")

            if isinstance(inputData, dict) or isinstance(inputData, list):
                inputData = json.dumps(inputData)

            result = await Helper.execute_action(actionSet, actionName, *args, *kwargs.values(), input_data=inputData)
            # decky_plugin.logger.info(f"execute_action result: {result}")
            return result
        except Exception as e:
            decky_plugin.logger.error(f"Error in execute_action: {e}")
            return None

    async def download_custom_backend(self, url, backup: bool = False):
        try:
            runtime_dir = decky_plugin.DECKY_PLUGIN_RUNTIME_DIR
            if backup:
                # Find the latest backup folder
                backup_dir = os.path.join(runtime_dir, "backup")
                backup_count = 1
                while os.path.exists(f"{backup_dir} {backup_count}"):
                    backup_count += 1
                latest_backup_dir = f"{backup_dir} {backup_count}"

                # Create the latest backup folder
                os.makedirs(latest_backup_dir, exist_ok=True)

                # Move non-backup files to the latest backup folder
                for item in os.listdir(runtime_dir):
                    item_path = os.path.join(runtime_dir, item)
                    if os.path.isfile(item_path) or os.path.isdir(item_path):
                        if not item.startswith("backup"):
                            shutil.move(item_path, latest_backup_dir)
                            decky_plugin.logger.info(
                                "Backup completed successfully")

            decky_plugin.logger.info(f"Downloading file from {url}")
            self.reload()

            # Create a temporary file to save the downloaded zip file
            temp_file = "/tmp/custom_backend.zip"
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    assert response.status == 200
                    with open(temp_file, "wb") as f:
                        while True:
                            chunk = await response.content.readany()
                            if not chunk:
                                break
                            f.write(chunk)
            print(f"Downloaded {temp_file} from {url}")
            # Extract the contents of the zip file to the runtime directory

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

    async def _unload(self):
        decky_plugin.logger.info("Goodbye World!")
        pass

    # Migrations that should be performed before entering `_main()`.

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
