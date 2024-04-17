import datetime
import re
import json
import argparse
import os
import sqlite3
import sys
import xml.etree.ElementTree as ET

from typing import List
import subprocess
import time
import GameSet
import re
from datetime import datetime, timedelta

class CmdException(Exception):
    pass

class Epic(GameSet.GameSet):
    def __init__(self, db_file, setNameConfig=None):
        super().__init__(db_file, setNameConfig)

    legendary_cmd = os.path.expanduser( os.environ['LEGENDARY'])

    def execute_shell(self, cmd):
       
        result = subprocess.Popen(cmd, stdout=subprocess.PIPE, stdin=subprocess.PIPE,
                                  stderr=subprocess.PIPE,
                                  shell=True).communicate()[0].decode()

        if "[cli] ERROR:" in result:
            raise CmdException(result)
        print(f" result: {result}", file=sys.stderr)
        if result.strip() == "":
            raise CmdException("Command produced no output")
        return json.loads(result)

    # sample json for game returned from legendary list --json

    def get_list(self,  offline):
        offline_switch = "--offline" if offline else ""
        games_list = self.execute_shell(os.path.expanduser(
            f"{self.legendary_cmd} list --json {offline_switch}"))
        self.insert_data(games_list)

    def get_working_dir(self, game_id, offline):
        self.get_directory(offline, game_id, 'working_directory')

    def get_game_dir(self, game_id, offline):
        self.get_directory(offline, game_id, 'game_directory')

    def get_directory(self, offline, game_id, type):
        offline_switch = "--offline" if offline else ""
        result = self.execute_shell(
            os.path.expanduser(
                f"{self.legendary_cmd} launch {game_id} --json --skip-version-check {offline_switch}"
            )
        )
        print(result[type])

    def get_login_status(self, offline, flush_cache=False):
        offline_switch = "--offline" if offline else ""
        cache_key = "egs-login"
        if offline:
            cache_key = "egs-login-offline"
        if(flush_cache):
            self.clear_cache(cache_key)
            
        cache = self.get_cache(cache_key)
        if cache is not None:
            return cache
        
        result = self.execute_shell(os.path.expanduser(
            f"{self.legendary_cmd} status --json {offline_switch}"))
        
        account = result['account']
        if offline:
            account += " (offline)"
        logged_in = account != '<not logged in>'
        value = json.dumps({'Type': 'LoginStatus', 'Content': {'Username': account, 'LoggedIn': logged_in}})
        
        timeout = datetime.now() + timedelta(hours=1)
        self.add_cache(cache_key, value, timeout)
        return value
        
    
    def get_parameters(self, game_id, offline):
        offline_switch = "--offline" if offline else ""
        try:
            result = self.execute_shell(
            f"{self.legendary_cmd} launch {game_id} --json --skip-version-check {offline_switch} ")
            return " ".join(result['egl_parameters'])
        except CmdException as e:
            raise e
    
    def get_game_size(self, game_id, installed):
        if installed == 'true':
            conn = self.get_connection()
            c = conn.cursor()
            c.row_factory = sqlite3.Row
            c.execute("SELECT Size FROM Game WHERE ShortName=?", (game_id,))
            result = c.fetchone()
            conn.close()
            if result and bool(result['Size']):
                disk_size = result['Size']
                size = f"Size on Disk: {disk_size}"
            else:
                size = ""
        else:
            result = self.execute_shell(f"{self.legendary_cmd} info {game_id} --json")
            manifest = result.get('manifest')
            if manifest != None:
                disk_size_str = f"Install Size: {self.convert_bytes(manifest['disk_size'])}" if bool(manifest.get('disk_size')) else ""
                download_size_str = f"Download Size: {self.convert_bytes(manifest['download_size'])}" if bool(manifest.get('download_size')) else ""
                size = disk_size_str + (f" ({download_size_str})" if download_size_str != "" else "") if disk_size_str != "" else download_size_str
            else:
                size = ""
        return json.dumps({'Type': 'GameSize', 'Content': {'Size': size }})

    def has_updates(self, game_id, offline):
        offline_switch = "--offline" if offline else ""
        result = self.execute_shell(os.path.expanduser(
            f"{self.legendary_cmd} info {game_id} --json {offline_switch}"))
        json_result = json.loads(result)
        if json_result['game']['version'] != json_result['install']['version']:
            return json.dumps({'Type': 'UpdateAvailable', 'Content': True})
        return json.dumps({'Type': 'UpdateAvailable', 'Content': False})

    def get_lauch_options(self, game_id, steam_command, name, offline):
        offline_switch = "--offline" if offline else ""
        launcher = os.environ['LAUNCHER']
        result = self.execute_shell(
            f"{self.legendary_cmd} launch {game_id} --json  --skip-version-check {offline_switch}")
       
        script_path = os.path.expanduser(launcher)
        return json.dumps(
            {
                'Type': 'LaunchOptions',
                'Content':
                {
                    'Exe': f"\\\"{os.path.join(result['game_directory'], result['game_executable'])}\\\"",
                    'Options': f"{script_path} {game_id}%command%",
                    'WorkingDir': result['working_directory'],
                    'Compatibility': True,
                    'Name': name
                }
            })

    def insert_data(self, games_list):
        conn = self.get_connection()
        c = conn.cursor()

        for game in games_list:

            try:
                title = game['app_title'].replace("''", "'")
                shortname = game['asset_infos']['Windows']['asset_id']

                c.execute("SELECT * FROM Game WHERE ShortName=?", (shortname,))
                result = c.fetchone()
                if result is None:
                    notes = game['metadata']['description']
                    application_path = ""
                    manual_path = ""
                    root_folder = ""
                    source = "Epic"
                    database_id = game['app_name']
                    genre = ""
                    configuration_path = ""
                    publisher = game['metadata']['developer']
                    developer = game['metadata']['developer']
                    release_date = game['metadata']['creationDate']
                    vals = [
                        title,
                        notes,
                        application_path,
                        manual_path,
                        publisher,
                        root_folder,
                        source,
                        database_id,
                        genre,
                        configuration_path,
                        developer,
                        release_date,
                        "",
                        "",
                        "",
                        "",
                        shortname,
                        
                    ]

                    # print(f"Inserting game {title} into database: {vals}")

                    placeholders = ', '.join(
                        ['?' for _ in range(len(self.cols))])
                    cols_with_pk = self.cols + ["SteamClientID", "ShortName"]
                    placeholders = ', '.join(
                        ['?' for _ in range(len(cols_with_pk))])
                    tmp = f"INSERT INTO Game ({', '.join(cols_with_pk)}) VALUES ({placeholders})"
                    # print(tmp)
                    c.execute(tmp, vals)

                    game_id = c.lastrowid
                    # Insert images into the Images table
                    for image in game['metadata']['keyImages']:
                        c.execute(
                            "INSERT INTO Images (GameID, ImagePath, FileName, SortOrder) VALUES (?, ?, ?, ?)", (game_id, image['url'], '', image['width']))
                    conn.commit()

            except Exception as e:
                print(f"Error parsing metadata for game: {title} {e}")

        conn.close()
       
    def update_game_details(self, game_id):
        conn = self.get_connection()
        c = conn.cursor()
        c.execute("SELECT * FROM Game WHERE ShortName=?", (game_id,))
        result = c.fetchone()
        if result is not None:
            result = self.execute_shell(f"{self.legendary_cmd} info {game_id} --json --offline")
            game = result['game']
            title = game['title']
            install = result['install']
            print(f"install info: {install}", file=sys.stderr)
            if install != None and bool(install['disk_size']):
                disk_size = install['disk_size']
                print(f"disk_size: {disk_size}", file=sys.stderr)

                size = f"{self.convert_bytes(disk_size)}"
                print(f"size: {size}", file=sys.stderr)

            else:
                size = None

            c.execute(
                "UPDATE Game SET Title=?, Size=? WHERE ShortName=?", 
                (title, size, game_id))
            conn.commit()
            conn.close()

    def insert_game(self, game):
        conn = self.get_connection()
        c = conn.cursor()

    

    # [DLManager] INFO: = Progress: 0.51% (368/72002), Running for 00:01:58, ETA: 06:23:02
    # [DLManager] INFO:  - Downloaded: 316.12 MiB, Written: 361.03 MiB
    # [DLManager] INFO:  - Cache usage: 35.00 MiB, active tasks: 32
    # [DLManager] INFO:  + Download	- 4.00 MiB/s (raw) / 4.00 MiB/s (decompressed)
    # [DLManager] INFO:  + Disk	- 2.00 MiB/s (write) / 0.00 MiB/s (read)

    def calculate_total_size(self, progress_percentage, written_size):
        return round(written_size * (progress_percentage / 100), 2)

    def get_last_progress_update(self, file_path):
        progress_re = re.compile(
            r"\[DLManager\] INFO: = Progress: (\d+\.\d+)% \((\d+)/(\d+)\), Running for (\d+:\d+:\d+), ETA: (\d+:\d+:\d+)\n\[DLManager\] INFO:  - Downloaded: (\d+\.\d+) MiB, Written: (\d+\.\d+) MiB\n\[DLManager\] INFO:  - Cache usage: (\d+\.\d+) MiB, active tasks: (\d+)\n\[DLManager\] INFO:  \+ Download\t- (\d+\.\d+) MiB/s \(raw\) / (\d+\.\d+) MiB/s \(decompressed\)\n\[DLManager\] INFO:  \+ Disk\t- (\d+\.\d+) MiB/s \(write\) / (\d+\.\d+) MiB/s \(read\)")
        download_size_re = re.compile(r"\[cli\] INFO: Download size: (\d+\.\d+) MiB")
        last_progress_update = None
        total_dl_size = None
        remaining_dl_size = None

        try:
            with open(file_path, "r") as f:
                lines = f.readlines()

                for line in lines:
                    if match := download_size_re.search(line):
                        total_dl_size = float(match.group(1))
                        break
                for line in reversed(lines):
                    if match := download_size_re.search(line):
                        remaining_dl_size = float(match.group(1))
                        break
                
                previously_dl_size = total_dl_size - remaining_dl_size if total_dl_size != None else 0

                for i in range(len(lines) - 5):
                    if match := progress_re.search(''.join(lines[i: i + 6])):
                        downloaded = round(float(match.group(6)), 2)
                        percent = round(100 * (downloaded + previously_dl_size) / total_dl_size if previously_dl_size else float(match.group(1)))
                        last_progress_update = {
                            "Percentage": percent,
                            "Description": (f"Downloaded {round(downloaded + previously_dl_size, 2)} MB/{total_dl_size} MB" if previously_dl_size else f"Downloaded {downloaded} MB/{total_dl_size} MB" if total_dl_size != None else f"Downloaded {downloaded} MB") + f" ({percent}%)\nSpeed: {match.group(11)} MB/s"
                        }

                if lines[-1].strip() == "[cli] INFO: Download size is 0, the game is either already up to date or has not changed. Exiting...":
                    last_progress_update = {
                        "Percentage": 100,
                        "Description": "Download size is 0, the game is either already up to date or has not changed. Exiting..."
                    }
                if lines[-2].strip() == "[cli] INFO: Download size is 0, the game is either already up to date or has not changed. Exiting...":
                    last_progress_update = {
                        "Percentage": 100,
                        "Description": "Download size is 0, the game is either already up to date or has not changed. Exiting..."
                    }
                if lines[-1].strip() == "[cli] INFO: Verification finished successfully.":
                    last_progress_update = {
                        "Percentage": 100,
                        "Description": "Verification finished successfully."
                    }
                if last_progress_update is None:
                    last_progress_update = {
                        "Percentage": 0,
                        "Description": lines[-1].strip()
                    }
        except Exception as e:
            print("Waiting for progress update", e, file=sys.stderr)
            time.sleep(1)

        return json.dumps({'Type': 'ProgressUpdate', 'Content': last_progress_update})

    def get_proton_command(self, cmd):
        match = re.search(r'waitforexitandrun -- (.*?) waitforexitandrun', cmd)
        if match:
            proton_cmd = match.group(1)
            sanitized_path = proton_cmd.replace('"', '').replace('\'', '')
            return sanitized_path
        else:
            return ""
