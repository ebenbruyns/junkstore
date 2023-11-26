import decky_plugin


from aiohttp import web


import asyncio
import json
import os
import shlex


class Helper:

    action_cache = {}
    working_directory = decky_plugin.DECKY_PLUGIN_RUNTIME_DIR

    @staticmethod
    async def pyexec_subprocess(cmd: str, input: str = '', unprivilege: bool = False, env=None, websocket=None, stream_output: bool = False):
        try:
            if unprivilege:
                cmd = f'sudo -u {decky_plugin.DECKY_USER} {cmd}'
            decky_plugin.logger.info("running cmd: " + cmd)
            if env is None:
                env = Helper.get_environment()
            proc = await asyncio.create_subprocess_shell(cmd,
                                                         stdout=asyncio.subprocess.PIPE,
                                                         stderr=asyncio.subprocess.PIPE,
                                                         stdin=asyncio.subprocess.PIPE,
                                                         shell=True,
                                                         env=env,
                                                         cwd=Helper.working_directory
                                                         )
            if stream_output:
                while True:
                    stdout = await proc.stdout.readline()
                    stderr = await proc.stderr.readline()
                    if stdout:
                        stdout = stdout.decode()
                        if stream_output:
                            await websocket.send_str(stdout)
                    if stderr:
                        stderr = stderr.decode()
                        if stream_output:
                            await websocket.send_str(stderr)
                    if proc.stdout.at_eof() and proc.stderr.at_eof():
                        break
                await proc.wait()
                return {'returncode': proc.returncode}
            else:
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

        except Exception as e:
            decky_plugin.logger.error(f"Error in ws_handler: {e}")

    async def start_ws_server():
        try:
            app = web.Application()
            app.router.add_get('/ws', Helper.ws_handler)
            runner = web.AppRunner(app)
            await runner.setup()
            site = web.TCPSite(runner, 'localhost', 8765)
            await site.start()

            decky_plugin.logger.info("WebSocket server started")
            while True:
                await asyncio.sleep(10)
        except Exception as e:
            decky_plugin.logger.error(f"Error in start_ws_server: {e}")
