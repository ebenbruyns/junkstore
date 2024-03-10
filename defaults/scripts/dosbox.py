import re
import time
import json
import argparse
import configparser
import os
import shutil
import sqlite3
import sys
import xml.etree.ElementTree as ET
import glob

from typing import List
import zipfile
import subprocess

import sharedgameset
import sqlite3
import json
import urllib.parse
import dosbox


class Dosbox (sharedgameset.GameSet):

    def parse_config_file(self, filepath):
        try:
            with open(filepath, 'r') as f:
                text = f.read()
                autoexec_start = text.find('[autoexec]')
                if autoexec_start != -1:
                    config_text = text[:autoexec_start]
                    autoexec_text = text[autoexec_start + len('[autoexec]'):]
                else:
                    config_text = text
                    autoexec_text = ''
                config = configparser.ConfigParser()
                config.read_string(config_text)
                sections = {}
                for section in config.sections():
                    settings = {}
                    for key, value in config.items(section):
                        settings[key] = value
                    sections[section] = settings
                return sections, autoexec_text
        except Exception as e:
            print(f"Error parsing config file: {filepath} {e}")
            return None, None

    def store_config_in_database(self, shortname, forkname, version, platform, sections, autoexec):
        conn = self.get_connection()
        c = conn.cursor()
        config_set_id = 0
        c.execute("select id from config_set where ShortName = ? AND forkname = ? AND version = ? AND platform = ?",
                  (shortname, forkname, version, platform))
        row = c.fetchone()
        if row is None:
            c.execute("INSERT INTO config_set (ShortName, forkname, version, platform) VALUES (?, ?, ?, ?)",
                      (shortname, forkname, version, platform))
            config_set_id = c.lastrowid
        else:
            config_set_id = row[0]
            c.execute("DELETE FROM configs WHERE config_set_id = ?",
                      (config_set_id,))
        for section, settings in sections.items():
            for key, value in settings.items():
                value = value.replace('$', '$$')
                query = "INSERT INTO configs (section, key, value, config_set_id) VALUES (?, ?, ?, ?)"
                params = (section, key, value, config_set_id)
                c.execute(query, params)
        autoexec = autoexec.replace('$', '$$')
        query = "INSERT INTO configs (section, key, value, config_set_id) VALUES (?, ?, ?, ?)"
        params = ('autoexec', 'text', autoexec, config_set_id)
        c.execute(query, params)
        conn.commit()
        conn.close()

    def write_config_file(self, shortnames, forkname, version, platform):
        config, autoexec_text = self.get_config(
            shortnames, forkname, version, platform)
        config.write(open('dosbox.conf', 'w'))
        with open('dosbox.conf', 'w') as f:
            config.write(f)
            f.write('[autoexec]')
            f.write(autoexec_text)

    def update_bat_files(self, shortname, batfiles):
        conn = self.get_connection()
        c = conn.cursor()
        for batfile in batfiles:
            c.execute("select id from Game where ShortName = ?", (shortname,))
            row = c.fetchone()
            if row is not None:
                game_id = row[0]
                c.execute("select id from BatFiles where GameID = ? AND Path = ?",
                          (game_id, batfile['Path']))
                row = c.fetchone()
                if row is None:
                    c.execute("INSERT INTO BatFiles (GameID, Path, BatFileName, Content) VALUES (?, ?, ?, ?)",
                              (game_id, batfile['Path'], batfile['BatFileName'], batfile['Content']))
                else:
                    c.execute("UPDATE BatFiles SET Content = ? WHERE id = ?",
                              (batfile['Content'], row[0]))
        conn.commit()
        conn.close()
        return json.dumps({'Type': 'Success', 'Content': {'success': True}})

    def lookup_title(self, shortname):
        conn = self.get_connection()
        c = conn.cursor()
        c.execute("SELECT Title FROM Game WHERE ShortName=?", (shortname,))
        result = c.fetchone()
        conn.close()
        if result:
            return result[0]
        else:
            return None

    def get_file_from_path(self, path: str):
        if (path != None):
            parts = path.split("\\")
            return parts[len(parts) - 1].replace(".bat", ".zip")
        return ""

    def write_bat_files(self,  shortname):
        conn = self.get_connection()
        c = conn.cursor()
        c.execute("""select id, GameId, Path, content from batfiles where GameId = (select id from game where shortname = ?)""", (shortname,))
        rows = c.fetchall()
        for row in rows:
            id = row[0]
            gameId = row[1]
            path = row[2]
            content = row[3]
            dir = os.path.dirname(path)
            print(f"Writing {dir}")
            print(f"Writing {path}")
            print(f"Content {content}")
            if not os.path.exists(dir):
                os.makedirs(dir)
            with open(path, 'w') as f:
                f.write(content)

    def get_json_bat_files(self, shortname):
        conn = self.get_connection()
        c = conn.cursor()
        c.execute("""select id, GameId, Path, content from batfiles where GameId = (select id from game where shortname = ?)""", (shortname,))
        rows = c.fetchall()
        result = []
        for row in rows:
            id = row[0]
            gameId = row[1]
            path = row[2]
            content = row[3]
            result.append({'Id': id, 'GameId': gameId,
                           'Path': path, 'Content': content})
        return json.dumps({'Type': 'FileContent', 'Content': {'Files': result}})

    def get_zip_for_shortname(self, shortname, urlencode):
        conn = self.get_connection()
        c = conn.cursor()
        c.execute(
            "SELECT ZipFileName FROM ZipFiles JOIN Game on Game.ID = ZipFiles.GameID WHERE ShortName=?", (shortname,))
        result = c.fetchone()
        conn.close()
        if result:
            if (urlencode):
                return urllib.parse.quote(result[0])
            return result[0]
        else:
            return None

    def get_lauch_options(self, options):
        return json.dumps(
            {
                'Type': 'LaunchOptions',
                'Content':
                {
                    'Exe': options[0],
                    'Options': options[1],
                    'WorkingDir': options[2],
                    'Name': options[3],
                    'Compatibility': False,
                    'Name': ""
                }
            })

    def get_last_progress_update(self, file_path):
        progress_re = re.compile(
            r"([\d\.]+)([M|K|G])[ \.]*(\d+)% *([\d\.]+)([M|K|G])[ =]")
        size_re = re.compile(r"Length.*\(([\d\.]+)([M|K|G])\)")
        # The file is already fully retrieved; nothing to do.
        completed_re = re.compile(
            r"The file is already fully retrieved; nothing to do.")

        last_progress_update = None
        total_size = None

        try:
            with open(file_path, "r") as f:
                lines = f.readlines()

                for line in lines:
                    completed_match = completed_re.search(line)
                    if completed_match:
                        last_progress_update = {
                            "Percentage": 100,
                            "Description": "Download Completed"
                        }
                        break

                    size_match = size_re.search(line)
                    if size_match:
                        total_size = float(
                            size_match.group(1))  # Convert to KB
                        if size_match.group(2) == "G":
                            total_size = float(total_size) * 1024
                        elif size_match.group(2) == "K":
                            total_size = float(total_size) / 1024

                        break
                for line in reversed(lines):
                    progress_match = progress_re.search(line)
                    if progress_match and total_size is not None:
                        progress_current = int(progress_match.group(1))
                        if progress_match.group(2) == "G":
                            progress_current = float(progress_current) * 1024
                        elif progress_match.group(2) == "K":
                            progress_current = float(progress_current) / 1024
                        progress_percentage = int(progress_match.group(3))
                        download_speed_mb_per_sec = float(
                            progress_match.group(4))

                        if progress_match.group(5) == "G":
                            download_speed_mb_per_sec = float(
                                download_speed_mb_per_sec) * 1024
                        elif progress_match.group(5) == "K":
                            download_speed_mb_per_sec = float(
                                download_speed_mb_per_sec) / 1024
                        else:
                            download_speed_mb_per_sec = float(
                                download_speed_mb_per_sec)
                        last_progress_update = {
                            "Percentage": progress_percentage,
                            "Description": "Downloaded " + str(round((progress_current), 2)) + " MB of " + str(round(total_size, 2)) + " MB (" + str(progress_percentage) + "%)\nSpeed: " + str(round(download_speed_mb_per_sec, 3)) + " MB/s"
                        }
                        break

        except Exception as e:
            print("Waiting for progress update", e, file=sys.stderr)
            time.sleep(1)

        return json.dumps({'Type': 'ProgressUpdate', 'Content': last_progress_update})
