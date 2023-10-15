import os
import json
import shlex
import subprocess

from decky_plugin import logger, DECKY_PLUGIN_DIR
# The decky plugin module is located at decky-loader/plugin
# For easy intellisense checkout the decky-loader code one directory up
# or add the `decky-loader/plugin` path to `python.analysis.extraPaths` in `.vscode/settings.json`
import decky_plugin


class Plugin:

    async def run_script(self, cmd):
        return os.popen(cmd).read()

    async def get_game_details(self, shortname):
        encoded_shortname = shlex.quote(shortname)
        result = self.call_script(
            "~/bin/get_game_details.sh" + " " + encoded_shortname)
        return json.loads(result)

    async def save_config(self, shortname, platform, forkname, version, config_data):
        encoded_shortname = shlex.quote(shortname)
        encoded_platform = shlex.quote(platform)
        encoded_forkname = shlex.quote(forkname)
        encoded_version = shlex.quote(version)
        cmd = f"~/bin/save_config.sh {encoded_shortname} {encoded_platform} {encoded_forkname} {encoded_version}"
        p = subprocess.Popen(cmd, stdin=subprocess.PIPE,
                             stdout=subprocess.PIPE, shell=True)
        p.communicate(input=json.dumps(config_data).encode())
        return p.returncode
        # decky_plugin.logger.info("Saving config for " + shortname)
        # config_file_path = os.path.join(
        #     decky_plugin.DECKY_PLUGIN_RUNTIME_DIR, shortname + ".json")
        # with open(config_file_path, 'w') as f:
        #     json.dump(config_data, f)

    async def get_config(self, shortname, platform, forkname, version):
        encoded_shortname = shlex.quote(shortname)
        encoded_platform = shlex.quote(platform)
        if (forkname == '_'):
            encoded_forkname = ""
        else:
            encoded_forkname = shlex.quote(forkname)
        if (version == '_'):
            encoded_version = ""
        else:
            encoded_version = shlex.quote(version)
        cmd = f"~/bin/get_config.sh '{encoded_shortname}' '{encoded_platform}' '{encoded_forkname}' '{encoded_version}' "
        decky_plugin.logger.info(cmd)
        result = self.call_script(cmd)
        decky_plugin.logger.info(result)
        return json.loads(result)

    async def install_game(self, shortname):
        encoded_shortname = shlex.quote(shortname)
        result = self.call_script(
            "~/bin/install_game.sh" + " " + encoded_shortname)

        return json.loads(result)

    async def get_game_data(self, filter):
        encoded_filter = shlex.quote(filter)
        result = self.call_script(
            "~/bin/get_game_data.sh" + " " + encoded_filter)
        return json.loads(result)

    async def _main(self):
        self.call_script("~/bin/plugin_init.sh")

    def call_script(cmd):
        os.environ["PATH"] = "$PATH:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin:/usr/local/sbin"
        os.environ["PLUGIN_DIR"] = os.path.abspath(DECKY_PLUGIN_DIR)
        os.environ["HOME"] = os.path.abspath(decky_plugin.DECKY_USER_HOME)
        os.environ["DECKY_PLUGIN_NAME"] = decky_plugin.DECKY_PLUGIN_NAME
        return subprocess.Popen(cmd, stdout=subprocess.PIPE, shell=True, env=os.environ).communicate()[0].decode()

    async def _unload(self):
        decky_plugin.logger.info("Goodbye World!")
        pass

    # Migrations that should be performed before entering `_main()`.
    async def _migration(self):
        self.call_script("~/bin/plugin_init.sh")
        decky_plugin.logger.info("Migrating")
        # Here's a migration example for logs:
        # - `~/.config/decky-template/template.log` will be migrated to `decky_plugin.DECKY_PLUGIN_LOG_DIR/template.log`
        decky_plugin.migrate_logs(os.path.join(decky_plugin.DECKY_USER_HOME,
                                               ".config", "decky-template", "template.log"))
        # Here's a migration example for settings:
        # - `~/homebrew/settings/template.json` is migrated to `decky_plugin.DECKY_PLUGIN_SETTINGS_DIR/template.json`
        # - `~/.config/decky-template/` all files and directories under this root are migrated to `decky_plugin.DECKY_PLUGIN_SETTINGS_DIR/`
        decky_plugin.migrate_settings(
            os.path.join(decky_plugin.DECKY_HOME, "settings", "template.json"),
            os.path.join(decky_plugin.DECKY_USER_HOME, ".config", "decky-template"))
        # Here's a migration example for runtime data:
        # - `~/homebrew/template/` all files and directories under this root are migrated to `decky_plugin.DECKY_PLUGIN_RUNTIME_DIR/`
        # - `~/.local/share/decky-template/` all files and directories under this root are migrated to `decky_plugin.DECKY_PLUGIN_RUNTIME_DIR/`
        decky_plugin.migrate_runtime(
            os.path.join(decky_plugin.DECKY_HOME, "template"),
            os.path.join(decky_plugin.DECKY_USER_HOME, ".local", "share", "decky-template"))
