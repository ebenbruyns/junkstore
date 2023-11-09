import asyncio
import os
import json
import shlex
import decky_plugin
import json


class Helper:
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
                                                         )
            # await proc.wait()
            stdout, stderr = await proc.communicate(input.encode())
            # await proc.wait()
            stdout = stdout.decode()
            stderr = stderr.decode()
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
               "CONTENT_SERVER": "http://localhost:1337/plugins",
               "DECKY_USER_HOME": decky_plugin.DECKY_USER_HOME,
               "HOME": os.path.abspath(decky_plugin.DECKY_USER_HOME),
               "PLATFORM": platform}
        return env

# {
#   "Id": "init",
#   "Title": "Store",
#   "Type": "SideBar",
#   "Command": "~/bin/junk-store.sh init",
#   "Actions": [
#     {
#       "Id": "Init",
#       "Command": "~/bin/junk-store.sh init",
#       "Title": "Init Store",
#       "Type": "Init"
#     },
#     {
#       "Id": "Content",
#       "Command": "~/bin/junk-store.sh content",
#       "Title": "Content",
#       "Type": "PageList"
#     }
#   ]
# }
    @staticmethod
    async def call_script(cmd: str, *args, input_data=''):
        try:
            decky_plugin.logger.info(
                f"call_script: {cmd} {args} {input_data}")
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
    async def execute_action(actionSet, actionName, *args, input_data=''):
        try:
            decky_plugin.logger.info(
                f"execute_action: {actionSet} {actionName} {args} {input_data}")
            file_path = os.path.join(
                decky_plugin.DECKY_PLUGIN_RUNTIME_DIR, f"{actionSet}.json")
            decky_plugin.logger.info(
                f"Helper.execute_action file path: {file_path}")
            if not os.path.exists(file_path):
                file_path = os.path.join(
                    decky_plugin.DECKY_PLUGIN_RUNTIME_DIR, ".cache", f"{actionSet}.json")
            result = ""
            if os.path.exists(file_path):
                with open(file_path) as f:
                    data = json.load(f)
                    for action in data:
                        if action['Id'] == actionName:
                            cmd = action['Command']
                            decky_plugin.logger.info(
                                f"execute_action cmd: {cmd}")
                            decky_plugin.logger.info(
                                f"execute_action args: {args}")
                            decky_plugin.logger.info(
                                f"execute_action input_data: {input_data}")
                            result = await Helper.call_script(os.path.expanduser(cmd), *args, input_data=input_data)
                            # decky_plugin.logger.info(
                            #    f"execute_action result: {result}")
                            try:
                                json_result = json.loads(result)
                                if action['Type'] == 'Init':
                                    Helper.write_action_set_to_cache(
                                        json_result['SetName'], json_result['Actions'])
                            except Exception as e:
                                decky_plugin.logger.info(
                                    "Error parsing json result", e)
                                json_result = {'Type': 'Error',
                                               'Message': f"Error parsing json result {e}", 'Data': result}
                            return json_result
            return json.dumps({'Type': 'Error', 'Message': f"Action not found {actionSet}, {actionName}", 'Data': result[:300]})
        except Exception as e:
            decky_plugin.logger.error(f"Error executing action: {e}")
            return json.dumps({'Type': 'Error', 'Message': 'Action not found', 'Data': str(e)})

    @staticmethod
    def write_action_set_to_cache(setName, actionSet):

        cache_dir = os.path.join(
            decky_plugin.DECKY_PLUGIN_RUNTIME_DIR, ".cache")
        if not os.path.exists(cache_dir):
            os.makedirs(cache_dir)
        file_path = os.path.join(cache_dir, f"{setName}.json")

        # if not os.path.exists(file_path):
        with open(file_path, 'w') as f:
            json.dump(actionSet, f)

    @staticmethod
    def get_action_script(setName, actionName):
        file_path = os.path.join(
            decky_plugin.DECKY_PLUGIN_RUNTIME_DIR, f"{setName}.json")

        if not os.path.exists(file_path):
            file_path = os.path.join(
                decky_plugin.DECKY_PLUGIN_RUNTIME_DIR, ".cache", f"{setName}.json")
        if os.path.exists(file_path):
            with open(file_path) as f:
                data = json.load(f)
                for action in data['Actions']:
                    if action['Title'] == actionName:
                        return action['Command']
        else:
            return None

    @staticmethod
    def get_set_props(setName):
        file_path = os.path.join(
            decky_plugin.DECKY_PLUGIN_RUNTIME_DIR, f"{setName}.json")

        if not os.path.exists(file_path):
            file_path = os.path.join(
                decky_plugin.DECKY_PLUGIN_RUNTIME_DIR, "cache", f"{setName}.json")
        if os.path.exists(file_path):
            with open(file_path) as f:
                data = json.load(f)
                del data['Actions']
                return data
        else:
            return None

    @staticmethod
    def get_scripts():
        scripts = {}

        try:
            with open(os.path.join(decky_plugin.DECKY_PLUGIN_RUNTIME_DIR, "scripts.json")) as f:
                scripts = json.load(f)
            single_script_files = []
            tabs_dir = os.path.join(
                decky_plugin.DECKY_PLUGIN_RUNTIME_DIR, "tabs")
            for filename in sorted(os.listdir(tabs_dir)):
                filepath = os.path.join(tabs_dir, filename)
                if os.path.isfile(filepath) and filename.endswith('.json'):
                    # decky_plugin.logger.info(f"Loading script: {filepath}")
                    with open(filepath) as f:
                        data = json.load(f)
                        single_script_files.append(data)
            scripts['Scripts'] = scripts['Scripts'] + single_script_files
            # decky_plugin.logger.info(f"scripts: {scripts}")
        except Exception as e:
            decky_plugin.logger.error(f"Error in get_scripts: {e}")
        return scripts

    @staticmethod
    async def build_cmd(tabindex, script_name, *args, input_data=''):
        try:
            if isinstance(tabindex, str):
                tabindex = int(tabindex)
            decky_plugin.logger.info(
                f"build_cmd: tabindex: {tabindex} scriptname: {script_name} args: {args}")
            encoded_args = [shlex.quote(arg) for arg in args]

            # os.environ["PATH"] = "$PATH:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin:/usr/local/sbin"

            script = os.path.expanduser(
                Helper.get_scripts()['Scripts'][tabindex][script_name])
            decky_plugin.logger.info(f"script: {script}")
            cmd = f"{script} {' '.join(encoded_args)}"
            platform = Helper.get_scripts()[
                'Scripts'][tabindex]['TabName']
            # decky_plugin.logger.info("command: " + cmd)
            # print(f"input_data: {input_data}")
            result = await Helper.pyexec_subprocess(cmd, input_data,
                                                    env=Helper.get_environment())
            return result['stdout']
        except Exception as e:
            decky_plugin.logger.error(f"Error in _build_cmd: {e}")
            return None

    @staticmethod
    async def get_json_output(tabindex: int, script_name, *args, input_data=''):
        try:
            decky_plugin.logger.info(
                f"get_json_output: tabindex: {tabindex} scriptname: {script_name} args: {args}")
            result = await Helper.build_cmd(
                tabindex, script_name, *args, input_data=input_data)
            # decky_plugin.logger.info(f"result: {result[:100]}")
            return json.loads(result)
        except Exception as e:
            decky_plugin.logger.error(f"Error in _get_json_output: {result}")
            return json.dumps({'Type': 'Error', 'Message': 'Error in _get_json_output', 'Data': result})


class Plugin:

    async def _main(self):
        try:
            decky_plugin.logger.info(
                f"plugin: {decky_plugin.DECKY_PLUGIN_NAME} dir: {decky_plugin.DECKY_PLUGIN_RUNTIME_DIR}")
            # pass cmd argument to _call_script method
            result = await Helper.execute_action("init", "init")
           # decky_plugin.logger.info(f"init result: {result}")
        except Exception as e:
            decky_plugin.logger.error(f"Error in _main: {e}")

    # , *args, input_data):
    async def execute_action(self, actionSet, actionName, inputData='', *args, **kwargs):
        try:
            decky_plugin.logger.info(
                f"execute_action: {actionSet} {actionName} ")
            decky_plugin.logger.info(f"execute_action args: {args}")
            decky_plugin.logger.info(f"execute_action kwargs: {kwargs}")

            result = await Helper.execute_action(actionSet, actionName, *args, *kwargs.values(), input_data=inputData)
           # decky_plugin.logger.info(f"execute_action result: {result}")
            return result
        except Exception as e:
            decky_plugin.logger.error(f"Error in execute_action: {e}")
            return None

    async def get_scripts(self):
        try:
            decky_plugin.logger.info(f"get_scripts: {self}")
            return Helper.get_scripts()

        except Exception as e:
            decky_plugin.logger.error(f"Error in get_scripts: {e}")
            return None

    async def get_init_data(self):
        try:
            decky_plugin.logger.info(f"get_init_data...")
            result = await Helper.get_json_output(0, "get_init_data")
            decky_plugin.logger.info(f"get_init_data: {result}")
            return result
        except Exception as e:
            decky_plugin.logger.error(f"Error in get_init_data: {e}")
            return None

    async def get_game_data(self, tabindex, filter, installed, limited):
        decky_plugin.logger.info(
            f"get_game_data: {filter} tabindex: {tabindex} self: {self}")
        installed_only = "false"
        if installed:
            installed_only = "true"
        limited_only = "false"
        if limited:
            limited_only = "true"
        result = await Helper.get_json_output(tabindex,
                                              "get_game_data", filter, installed_only, limited_only, input_data='')
        decky_plugin.logger.info(result)
        return result

    async def get_game_details(self, tabindex: int, shortname):
        decky_plugin.logger.info(
            f"get_game_details: {shortname} tabindex: {tabindex} self: {self}")
        result = await Helper.get_json_output(
            tabindex, "get_game_details", shortname)
        decky_plugin.logger.info(result)
        return result

    async def save_config(self, tabindex, shortname, platform, forkname, version, config_data):
        if forkname == '_':
            forkname = ''
        if version == '_':
            version = ''
        decky_plugin.logger.info(
            f"save_config: {shortname} {platform} {forkname} {version} {config_data} tabindex: {tabindex} self: {self}")
        cmd = await Helper.build_cmd(tabindex, "save_config", shortname, platform,
                                     forkname, version, input_data=json.dumps(config_data))
        return cmd

    async def get_config(self, tabindex, shortname, platform, forkname, version):
        if forkname == '_':
            forkname = ''
        if version == '_':
            version = ''
        result = await Helper.get_json_output(tabindex,
                                              "get_config", shortname, platform, forkname, version)
        return result

    async def get_install_progress(self, tabindex, shortname):
        try:
            decky_plugin.logger.info(
                f"get_install_progress: {shortname} tabindex: {tabindex} self: {self}")
            result = await Helper.get_json_output(
                tabindex, "get_install_progress", shortname)
            decky_plugin.logger.info(f"get_install_progress: {result}")
            return result
        except Exception as e:
            decky_plugin.logger.exception(
                f"Error getting install progress: {e}")
            raise

    async def download_game(self, tabindex, shortname):
        try:
            decky_plugin.logger.info(
                f"download_game: {shortname} {id} tabindex: {tabindex} self: {self}")
            result = await Helper.build_cmd(
                tabindex, "download_game", shortname)
            decky_plugin.logger.info(f"download_game: {result}")
            return result
        except Exception as e:
            decky_plugin.logger.exception(f"Error downloading game: {e}")
            raise

    async def cancel_install(self, tabindex, shortname):
        try:
            decky_plugin.logger.info(
                f"cancel_install: {shortname} {id} tabindex: {tabindex} self: {self}")
            result = await Helper.get_json_output(
                tabindex, "cancel_install", shortname)
            decky_plugin.logger.info(f"cancel_install: {result}")
            return result
        except Exception as e:
            decky_plugin.logger.exception(f"Error cancelling install: {e}")
            raise

    async def install_game(self, tabindex, shortname, id):
        try:
            decky_plugin.logger.info(
                f"install_game: {shortname} {id} tabindex: {tabindex} self: {self}")
            result = await Helper.get_json_output(
                tabindex, "install_game", shortname,  str(id))
            decky_plugin.logger.info(f"install_game: {result}")
            return result
        except Exception as e:
            decky_plugin.logger.exception(f"Error installing game: {e}")
            raise

    async def uninstall_game(self, tabindex, shortname):
        decky_plugin.logger.info(
            f"uninstall_game: {shortname} tabindex: {tabindex} self: {self}")
        result = await Helper.get_json_output(
            tabindex, "uninstall_game", shortname)
        decky_plugin.logger.info(f"install_game: {result}")
        return result

    async def get_game_bats(self, tabindex, shortname):
        decky_plugin.logger.info(
            f"get_game_bats: {shortname} tabindex: {tabindex} self: {self}")
        result = await Helper.get_json_output(
            tabindex, "get_game_bats", shortname)
        return result

    async def save_game_bats(self, tabindex, shortname, bats):
        decky_plugin.logger.info(
            f"save_game_bats: {shortname} {bats} tabindex: {tabindex} self: {self}")
        decky_plugin.logger.info(f"save_game_bats: {bats}")
        cmd = await Helper.build_cmd(tabindex, "save_game_bats",
                                     shortname, input_data=json.dumps(bats))
        return cmd

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
