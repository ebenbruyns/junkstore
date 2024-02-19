#!/usr/bin/env python
import epic
import json
import argparse

import database


cols = database.cols


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        '--list', help='Get list of epic games', action='store_true')
    parser.add_argument(
        '--dbfile', help='Path to the SQLite database file', default='configs.db')
    parser.add_argument(
        '--get-working-dir', help='Get working directory for game')
    parser.add_argument(
        '--get-game-dir', help='Get install directory for game')
    parser.add_argument(
        '--getprogress', help='Get installtion progress for game')
    parser.add_argument(
        '--get-proton', help='Get proton command')
    parser.add_argument(
        '--get-args', help='Get proton command')
    parser.add_argument(
        '--launchoptions', nargs=3, help='Get launch options')
    parser.add_argument(
        '--getloginstatus', help='Get login status', action='store_true')
    parser.add_argument(
        '--hasupdates', help='Get login status')
    parser.add_argument(
        '--get-env-settings', help='Get environment settings')
    parser.add_argument(
        '--generate-env-settings-json', help='Generate environment settings')
    parser.add_argument(
        '--get-base64-images', help='Get base64 images for short name'
    )
    parser.add_argument('--offline', help='Offline mode', action='store_true')

    database.create_tables(parser.parse_args().dbfile)
    args = parser.parse_args()
    if args.list:
        print(epic.get_list(args.dbfile, args.offline))
    if args.get_working_dir:
        epic.get_working_dir(args.get_working_dir, args.offline)
    if args.get_game_dir:
        epic.get_game_dir(args.get_game_dir, args.offline)
    if args.getprogress:
        print(epic.get_last_progress_update(args.getprogress))
    if args.get_proton:
        print(epic.get_proton_command(args.get_proton))
    if args.get_args:
        print(epic.get_parameters(args.get_args, args.offline))
    if args.launchoptions:
        print(epic.get_lauch_options(
            args.launchoptions[0], args.launchoptions[1], args.launchoptions[2], args.offline))
    if args.getloginstatus:
        print(epic.get_login_status(args.offline))
    if args.get_env_settings:
        result = json.loads(database.get_config_json(
            [args.get_env_settings], "", "", "Proton", args.dbfile))
        print(database.generate_bash_env_settings(
            json.dumps(result['Content'])))
    if args.generate_env_settings_json:
        print(database.generate_env_settings_json(
            args.generate_env_settings_json))
    if args.hasupdates:
        print(epic.has_updates(args.hasupdates, args.offline))
    if args.get_base64_images:
        print(database.get_base64_images(args.get_base64_images, args.dbfile))
    if not any(vars(args).values()):
        parser.print_help()


if __name__ == '__main__':
    main()
