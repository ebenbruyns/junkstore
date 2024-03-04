#!/usr/bin/env python
import epic
import json
import argparse

import sharedgameset


class EpicArgs(sharedgameset.GenericArgs):
    def __init__(self, setNameConfig):
        super().__init__()
        self.addArguments()
        self.setNameConfig = setNameConfig

    def addArguments(self):
        super().addArguments()
        self.parser.add_argument(
            '--list', help='Get list of epic games', action='store_true')
        self.parser.add_argument(
            '--get-working-dir', help='Get working directory for game')
        self.parser.add_argument(
            '--get-game-dir', help='Get install directory for game')
        self.parser.add_argument(
            '--getprogress', help='Get installtion progress for game')
        self.parser.add_argument(
            '--get-proton', help='Get proton command')
        self.parser.add_argument(
            '--get-args', help='Get proton command')
        self.parser.add_argument(
            '--launchoptions', nargs=3, help='Get launch options')
        self.parser.add_argument(
            '--getloginstatus', help='Get login status', action='store_true')
        self.parser.add_argument(
            '--hasupdates', help='Get login status')
        self.parser.add_argument(
            '--get-base64-images', help='Get base64 images for short name'
        )
        self.parser.add_argument(
            '--offline', help='Offline mode', action='store_true')

    def parseArgs(self):
        super().parseArgs()
        self.gameSet = epic.Epic(self.args.dbfile, self.setNameConfig)
        self.gameSet.create_tables()

    def processArgs(self):
        try:
            super().processArgs()

            if self.args.list:
                print(self.gameSet.get_list(self.args.offline))
            if self.args.get_working_dir:
                self.gameSet.get_working_dir(
                    self.args.get_working_dir, self.args.offline)
            if self.args.get_game_dir:
                self.gameSet.get_game_dir(
                    self.args.get_game_dir, self.args.offline)
            if self.args.getprogress:
                print(self.gameSet.get_last_progress_update(
                    self.args.getprogress))
            if self.args.get_proton:
                print(self.gameSet.get_proton_command(self.args.get_proton))
            if self.args.get_args:
                print(self.gameSet.get_parameters(
                    self.args.get_args, self.args.offline))
            if self.args.launchoptions:

                print(self.gameSet.get_lauch_options(
                    self.args.launchoptions[0], self.args.launchoptions[1], self.args.launchoptions[2], self.args.offline))

            if self.args.getloginstatus:
                print(self.gameSet.get_login_status(self.args.offline))

            if self.args.hasupdates:
                print(self.gameSet.has_updates(
                    self.args.hasupdates, self.args.offline))
            if self.args.get_base64_images:
                print(self.gameSet.get_base64_images(
                    self.args.get_base64_images))
            if not any(vars(self.args).values()):
                self.parser.print_help()
        except epic.CmdException as e:
            print(json.dumps(
                {'Type': 'Error', 'Content': {'Message': e.args[0]}}))


def main():
    epicArgs = EpicArgs("Proton")
    epicArgs.parseArgs()
    epicArgs.processArgs()


if __name__ == '__main__':
    main()
