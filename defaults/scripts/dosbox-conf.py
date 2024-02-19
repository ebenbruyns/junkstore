#!/usr/bin/env python
import json
import argparse


import database
import sqlite3
import json
import dosbox
cols = database.cols


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        '--parsejson', help='Configuration shortname, the json is read from stdin'
    )
    parser.add_argument(
        '--updatebats', help='Update bat files')
    parser.add_argument(
        '--conf', nargs='+', help='List of shortnames to reproduce configuration file from database')
    parser.add_argument(
        '--confjson', nargs='+', help='List of shortnames to reproduce configuration file from database'
    )
    parser.add_argument(
        '--dbfile', help='Path to the SQLite database file', default='configs.db')
    parser.add_argument(
        '--platform', help='Platform [windows,linux]', default='linux')
    parser.add_argument(
        '--forkname', help='dosbox fork name', default='staging')
    parser.add_argument(
        '--version', help='dosbox version', default='')
    parser.add_argument(
        '--getgameswithimages', nargs='+', help='Get games with images')
    parser.add_argument(
        '--getgamedata', nargs=2, help='Get game data')
    parser.add_argument(
        '--addsteamclientid', nargs=2, help='Add steam client id to game')
    parser.add_argument(
        '--clearsteamclientid', nargs=1, help='Clear steam client id to game'
    )
    parser.add_argument(
        '--getzip', help='Get zip file for shortname'
    )
    parser.add_argument(
        '--launchoptions', nargs=4, help='Launch options'
    )
    parser.add_argument(
        '--writebatfiles', help='Write bat files'
    )
    parser.add_argument(
        '--getjsonbats', help='Get bat files as json'
    )
    parser.add_argument(
        '--getprogress', help='Get installtion progress for game')
    parser.add_argument(
        '--urlencode', help='Url encode string', action='store_true')
    parser.add_argument(
        '--getsetting', help='Get setting'
    )
    parser.add_argument(
        '--savesetting', nargs=2, help='Save setting'
    )
    parser.add_argument(
        '--get-base64-images', nargs=2, help='Get base64 images for short name'
    )
    parser.add_argument(
        '--forkfilter', help='Filter by fork name', default=None
    )
    parser.add_argument(
        '--versionfilter', help='Filter by version', default=None
    )
    parser.add_argument(
        '--platformfilter', help='Filter by platform', default=None
    )

    args = parser.parse_args()
    database.create_tables(args.dbfile)
    # database.add_missing_config_sets("dos", args.dbfile)
    if args.parsejson:
        config_data = dosbox.read_json_from_stdin()
        print(database.parse_json_store_in_database(
            args.parsejson, args.forkname, args.version, args.platform, config_data, args.dbfile))

    if args.updatebats:
        batfiles = dosbox.read_json_from_stdin()
        print(dosbox.update_bat_files(args.dbfile, args.updatebats, batfiles))

    if args.conf:
        dosbox.write_config_file(
            args.conf, args.forkname, args.version, args.platform, args.dbfile)

    if args.confjson:
        print(database.get_config_json(
            args.confjson, args.forkname, args.version, args.platform, args.dbfile))

    if args.getgameswithimages:
        filter = ""
        urlencode = False
        if (args.urlencode):
            urlencode = True
        if (len(args.getgameswithimages) > 1):
            filter = args.getgameswithimages[1]
            installed = args.getgameswithimages[2]
            isLimited = args.getgameswithimages[3]
            needsLogin = args.getgameswithimages[4]
        print(dosbox.get_games_with_images(args.dbfile,
              args.getgameswithimages[0], filter, installed, isLimited, urlencode, needsLogin))

    if args.getgamedata:
        urlencode = False
        if (args.urlencode):
            urlencode = True
        print(dosbox.get_game_data(args.dbfile,
              args.getgamedata[0], args.getgamedata[1], urlencode, args.platform, args.forkname, args.version))

    if args.addsteamclientid:
        dosbox.add_steam_client_id(
            args.addsteamclientid[0], args.addsteamclientid[1], args.dbfile)
        print(json.dumps({'Type': 'Success', 'Content': {'success': True}}))

    if args.clearsteamclientid:
        dosbox.clear_steam_client_id(args.clearsteamclientid[0], args.dbfile)
        print(json.dumps({'Type': 'Success', 'Content': {'success': True}}))

    if args.getzip:
        urlencode = False
        if (args.urlencode):
            urlencode = True
        print(dosbox.get_zip_for_shortname(
            args.getzip, args.dbfile, urlencode))

    if args.launchoptions:
        print(dosbox.get_lauch_options(args.launchoptions, args.dbfile))

    if args.writebatfiles:
        dosbox.write_bat_files(args.dbfile, args.writebatfiles)

    if args.getjsonbats:
        print(dosbox.get_json_bat_files(args.dbfile, args.getjsonbats))

    if args.getprogress:
        print(dosbox.get_last_progress_update(args.getprogress))

    if args.getsetting:
        print(dosbox.get_setting(args.dbfile, args.getsetting))

    if args.savesetting:
        print(dosbox.save_setting(args.dbfile,
              args.savesetting[0], args.savesetting[1]))

    if args.get_base64_images:
        urlencode = True
        if (args.urlencode):
            urlencode = True
        else:
            urlencode = False
        print(database.get_base64_images(
            args.get_base64_images[0], args.dbfile, args.get_base64_images[1], urlencode))

    if not any(vars(args).values()):
        parser.print_help()


if __name__ == '__main__':
    main()
