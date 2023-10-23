

import os
import json
import shlex
import subprocess

import decky_plugin
# sample scripts.json
# {
#   "init_script": "~/bin/plugin_init.sh",
#   "scripts": [
#     {
#       "TabName": "Dosbox",
#       "get_game_details": "~/bin/get_game_details.sh",
#       "save_config": "~/bin/save_config.sh",
#       "get_config": "~/bin/get_config.sh",
#       "install_game": "~/bin/install_game.sh",
#       "get_game_data": "~/bin/get_game_data.sh",
#       "plugin_init": "~/bin/plugin_init.sh"
#     }
#   ]
# }


class Helper:

    @staticmethod
    def get_scripts():
        scripts = {}
        with open(os.path.join(decky_plugin.DECKY_PLUGIN_RUNTIME_DIR, "scripts.json")) as f:
            scripts = json.load(f)
        return scripts

    @staticmethod
    def call_script(cmd):
        os.environ["DECKY_HOME"] = decky_plugin.DECKY_HOME
        os.environ["DECKY_PLUGIN_DIR"] = decky_plugin.DECKY_PLUGIN_DIR
        os.environ["DECKY_PLUGIN_LOG_DIR"] = decky_plugin.DECKY_PLUGIN_LOG_DIR
        os.environ["DECKY_PLUGIN_NAME"] = decky_plugin.DECKY_PLUGIN_NAME
        os.environ["DECKY_PLUGIN_RUNTIME_DIR"] = decky_plugin.DECKY_PLUGIN_RUNTIME_DIR
        os.environ["DECKY_PLUGIN_SETTINGS_DIR"] = decky_plugin.DECKY_PLUGIN_SETTINGS_DIR
        os.environ["CONTENT_SERVER"] = "http://localhost:1337/plugins"
        os.environ["DECKY_USER_HOME"] = decky_plugin.DECKY_USER_HOME
        os.environ["HOME"] = os.path.abspath(decky_plugin.DECKY_USER_HOME)
        os.environ["PATH"] = "$PATH:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin:/usr/local/sbin"

        return subprocess.Popen(cmd, stdout=subprocess.PIPE, stdin=subprocess.PIPE, shell=True, env=os.environ).communicate()[0].decode()

    @staticmethod
    def build_cmd(tabindex, script_name, *args, input_data=None):
        try:
            if isinstance(tabindex, str):
                tabindex = int(tabindex)
            decky_plugin.logger.info(
                f"build_cmd: tabindex: {tabindex} scriptname: {script_name} args: {args}")
            encoded_args = [shlex.quote(arg) for arg in args]
            os.environ["DECKY_HOME"] = decky_plugin.DECKY_HOME
            os.environ["DECKY_PLUGIN_DIR"] = decky_plugin.DECKY_PLUGIN_DIR
            os.environ["DECKY_PLUGIN_LOG_DIR"] = decky_plugin.DECKY_PLUGIN_LOG_DIR
            os.environ["DECKY_PLUGIN_NAME"] = "junk-store"
            os.environ["DECKY_PLUGIN_RUNTIME_DIR"] = decky_plugin.DECKY_PLUGIN_RUNTIME_DIR
            os.environ["DECKY_PLUGIN_SETTINGS_DIR"] = decky_plugin.DECKY_PLUGIN_SETTINGS_DIR
            os.environ["CONTENT_SERVER"] = "http://localhost:1337/plugins"
            os.environ["DECKY_USER_HOME"] = decky_plugin.DECKY_USER_HOME
            os.environ["HOME"] = os.path.abspath(decky_plugin.DECKY_USER_HOME)
            os.environ["PATH"] = "$PATH:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin:/usr/local/sbin"

            script = os.path.expanduser(
                Helper.get_scripts()['scripts'][tabindex][script_name])
            cmd = f"{script} {' '.join(encoded_args)}"
            decky_plugin.logger.info("command: " + cmd)
            if input_data:
                p = subprocess.Popen(cmd, stdin=subprocess.PIPE,
                                     stdout=subprocess.PIPE, shell=True)
                p.communicate(input=input_data.encode())
                return p.returncode
            else:
                return Helper.call_script(cmd)
        except Exception as e:
            decky_plugin.logger.error(f"Error in _build_cmd: {e}")
            return None

    @staticmethod
    def get_json_output(tabindex: int, script_name, *args, input_data=None):
        try:
            decky_plugin.logger.info(
                f"get_json_output: tabindex: {tabindex} scriptname: {script_name} args: {args}")
            cmd = Helper.build_cmd(
                tabindex, script_name, *args, input_data=input_data)
            return json.loads(cmd)
        except Exception as e:
            decky_plugin.logger.error(f"Error in _get_json_output: {e}")
            return None


class Plugin:

    async def _main(self):
        decky_plugin.logger.info(
            f"plugin: {decky_plugin.DECKY_PLUGIN_NAME} dir: {decky_plugin.DECKY_PLUGIN_RUNTIME_DIR}")

        decky_plugin.logger.info(Helper.get_scripts()['init_script'])
        cmd = os.path.expanduser(Helper.get_scripts()['init_script'])
        # pass cmd argument to _call_script method
        Helper.call_script(cmd)

    async def get_scripts(self):
        decky_plugin.logger.info(f"get_scripts: {self}")
        return Helper.get_scripts()

    async def get_game_data(self, tabindex, filter, installed, limited):
        decky_plugin.logger.info(
            f"get_game_data: {filter} tabindex: {tabindex} self: {self}")
        installed_only = "false"
        if installed:
            installed_only = "true"
        limited_only = "false"
        if limited:
            limited_only = "true"
        result = Helper.get_json_output(tabindex,
                                        "get_game_data", filter, installed_only, limited_only, input_data=None)
        return result

    async def get_game_details(self, tabindex: int, shortname):
        decky_plugin.logger.info(
            f"get_game_details: {shortname} tabindex: {tabindex} self: {self}")
        result = Helper.get_json_output(
            tabindex, "get_game_details", shortname)
        return result

    async def save_config(self, tabindex, shortname, platform, forkname, version, config_data):
        if forkname == '_':
            forkname = ''
        if version == '_':
            version = ''
        decky_plugin.logger.info(
            f"save_config: {shortname} {platform} {forkname} {version} {config_data} tabindex: {tabindex} self: {self}")
        cmd = Helper.build_cmd(tabindex, "save_config", shortname, platform,
                               forkname, version, input_data=json.dumps(config_data))
        return cmd

    async def get_config(self, tabindex, shortname, platform, forkname, version):
        if forkname == '_':
            forkname = ''
        if version == '_':
            version = ''
        result = Helper.get_json_output(tabindex,
                                        "get_config", shortname, platform, forkname, version)
        return result

    async def install_game(self, tabindex, shortname, id):
        decky_plugin.logger.info(
            f"install_game: {shortname} {id} tabindex: {tabindex} self: {self}")
        result = Helper.get_json_output(
            tabindex, "install_game", shortname,  str(id))
        decky_plugin.logger.info(f"install_game: {result}")
        return result

    async def uninstall_game(self, tabindex, shortname):
        decky_plugin.logger.info(
            f"uninstall_game: {shortname} tabindex: {tabindex} self: {self}")
        result = Helper.get_json_output(
            tabindex, "uninstall_game", shortname)
        decky_plugin.logger.info(f"install_game: {result}")
        return result

    async def _unload(self):
        decky_plugin.logger.info("Goodbye World!")
        pass

    # Migrations that should be performed before entering `_main()`.
    async def _migration(self):
        plugin_dir = "junk-store"
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
