#!/usr/bin/env python
import json
import argparse


import sharedgameset
import sqlite3
import json
import dosbox
# cols = database.cols


class DosArgs(sharedgameset.GenericArgs):
    def __init__(self, setNameConfig):
        super().__init__()
        self.addArguments()
        self.setNameConfig = setNameConfig

    def addArguments(self):
        super().addArguments()

        self.parser.add_argument(
            '--updatebats', help='Update bat files')

        self.parser.add_argument(
            '--conf', nargs='+', help='List of shortnames to reproduce configuration file from database')

        self.parser.add_argument(
            '--getzip', help='Get zip file for shortname'
        )
        self.parser.add_argument(
            '--launchoptions', nargs=4, help='Launch options'
        )
        self.parser.add_argument(
            '--writebatfiles', help='Write bat files'
        )
        self.parser.add_argument(
            '--getjsonbats', help='Get bat files as json'
        )
        self.parser.add_argument(
            '--getprogress', help='Get installtion progress for game')

        self.parser.add_argument(
            '--get-base64-images', nargs=2, help='Get base64 images for short name'
        )

    def parseArgs(self):
        super().parseArgs()
        self.gameSet = dosbox.Dosbox(self.args.dbfile, self.setNameConfig)
        self.gameSet.create_tables()

    def processArgs(self):
        super().processArgs()

        # database.add_missing_config_sets("dos", args.dbfile)

        if self.args.updatebats:
            batfiles = self.gameSet.read_json_from_stdin()
            print(self.gameSet.update_bat_files(
                self.args.updatebats, batfiles))

        if self.args.conf:
            self.gameSet.write_config_file(
                self.args.conf, self.args.forkname, self.args.version, self.args.platform)

        if self.args.getzip:
            urlencode = False
            if (self.args.urlencode):
                urlencode = True
            print(self.gameSet.get_zip_for_shortname(
                self.args.getzip,  urlencode))

        if self.args.launchoptions:
            print(self.gameSet.get_lauch_options(self.args.launchoptions))

        if self.args.writebatfiles:
            self.gameSet.write_bat_files(self.args.writebatfiles)

        if self.args.getjsonbats:
            print(self.gameSet.get_json_bat_files(self.args.getjsonbats))

        if self.args.getprogress:
            print(self.gameSet.get_last_progress_update(self.args.getprogress))

        if self.args.get_base64_images:
            urlencode = True
            if (self.args.urlencode):
                urlencode = True
            else:
                urlencode = False
            print(self.gameSet.get_base64_images(
                self.args.get_base64_images[0], self.args.get_base64_images[1], urlencode))

        if not any(vars(self.args).values()):
            self.parser.print_help()


def main():

    dosProcessor = DosArgs("dos")
    dosProcessor.parseArgs()
    dosProcessor.processArgs()


if __name__ == '__main__':
    main()
