
import argparse
import json
import sys
import sqlite3

import argparse
import os
import json
import sqlite3
import configparser
import urllib.request
import base64
import sys



class GameSet:
    db_file = ""
    setNameConfig = None
    storeURL = None
    storeName = None

    def __init__(self, db_file, storeName="", setNameConfig=None):
        parser = argparse.ArgumentParser()
        self.setNameConfig = setNameConfig
        self.db_file = db_file
        self.storeName = storeName

    cols = ["Title",
            "Notes",
            "ApplicationPath",
            "ManualPath",
            "Publisher",
            "RootFolder",
            "Source",
            "DatabaseID",
            "Genre",
            "ConfigurationPath",
            "Developer",
            "ReleaseDate",
            "Size",
            "InstallPath",
            "UmuId",
            "Arguments",
            "WorkingDir"]

    def convert_bytes(self , size):
        try:
            if size >= 1024**3:
                size = f"{size / 1024**3:.2f} GB"
            elif size >= 1024**2:
                size = f"{size / 1024**2:.2f} MB"
            elif size >= 1024:
                size = f"{size / 1024:.2f} KB"
            else:
                size = f"{size} bytes"
            return size
        except Exception as e:
            return ""
        
    def read_json_from_stdin(self):
        json_str = sys.stdin.read()
        return json.loads(json_str)

    def get_connection(self):
        conn = sqlite3.connect(self.db_file)
        c = conn.cursor()
        
        res = c.execute("PRAGMA journal_mode=WAL;")
        c.execute("PRAGMA synchronous=OFF;")
        conn.commit()

        return conn

    def create_tables(self):
        conn = self.get_connection()
        c = conn.cursor()
        c.execute(
            'CREATE TABLE IF NOT EXISTS configs (id INTEGER PRIMARY KEY, section TEXT, key TEXT, value TEXT, config_set_id INTEGER, FOREIGN KEY(config_set_id) REFERENCES config_set(id))')
        c.execute(
            'CREATE TABLE IF NOT EXISTS config_set (id INTEGER PRIMARY KEY, ShortName TEXT, forkname TEXT, version TEXT, platform TEXT)')
        c.execute(
            f"CREATE TABLE IF NOT EXISTS Game (id INTEGER PRIMARY KEY, {', '.join([f'{col} TEXT' for col in self.cols])}, SteamClientID TEXT, ShortName TEXT UNIQUE)")
        c.execute(f"CREATE TABLE IF NOT EXISTS Images (id INTEGER PRIMARY KEY, GameID INTEGER, ImagePath TEXT, FileName TEXT, SortOrder INTEGER, FOREIGN KEY(GameID) REFERENCES Game(id))")
        c.execute(f"CREATE TABLE IF NOT EXISTS ZipFiles (id INTEGER PRIMARY KEY, GameID INTEGER, ZipFileName TEXT UNIQUE, FOREIGN KEY(GameID) REFERENCES Game(id))")
        c.execute(f"CREATE TABLE IF NOT EXISTS BatFiles (id INTEGER PRIMARY KEY, GameID INTEGER, Path TEXT, BatFileName TEXT,  Content TEXT, FOREIGN KEY(GameID) REFERENCES Game(id))")
        c.execute(
            'CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY, name TEXT UNIQUE, value TEXT)')
        c.execute(f"CREATE TABLE IF NOT EXISTS Cache (id INTEGER PRIMARY KEY, Key TEXT UNIQUE, Value TEXT, ExpiryDate DateTime)")
        
         

        c.execute("PRAGMA table_info(Game)")
        columns = [column[1] for column in c.fetchall()]
        if "Size" not in columns:
            c.execute("ALTER TABLE Game ADD COLUMN Size TEXT")
        
        c.execute("PRAGMA table_info(Game)")
        columns = [column[1] for column in c.fetchall()]
        if "InstallPath" not in columns:
            c.execute("ALTER TABLE Game ADD COLUMN InstallPath TEXT")
        

        c.execute("PRAGMA table_info(Game)")
        columns = [column[1] for column in c.fetchall()]
        if "UmuId" not in columns:
            c.execute("ALTER TABLE Game ADD COLUMN UmuId TEXT")
        
        c.execute("PRAGMA table_info(Game)")
        columns = [column[1] for column in c.fetchall()]
        if "Arguments" not in columns:
            c.execute("ALTER TABLE Game ADD COLUMN Arguments TEXT")

        c.execute("PRAGMA table_info(Game)")
        columns = [column[1] for column in c.fetchall()]
        if "WorkingDir" not in columns:
            c.execute("ALTER TABLE Game ADD COLUMN WorkingDir TEXT")
        conn.commit()
       

        c.execute("PRAGMA table_info(Game)")
        columns = [column[1] for column in c.fetchall()]
        if "SortingTitle" not in columns:
            c.execute("ALTER TABLE Game ADD COLUMN SortingTitle TEXT")
        conn.commit()
   

   
        conn.close()




    def get_umu_id(self, shortname):
        conn = self.get_connection()
        c = conn.cursor()
        c.execute("SELECT UmuId FROM Game WHERE ShortName=?", (shortname,))
        result = c.fetchone()
        conn.close()
        if result:
            return result[0]
        else:
            return None
    
    def update_umu_id(self, shortname, store):
        url = "https://umu.openwinecomponents.org/umu_api.php?codename=" + shortname + "&store=" + store
        headers = {'User-Agent': 'Mozilla/5.0'}
        print( url, file=sys.stderr)
        req = urllib.request.Request(url, headers=headers)
        response = urllib.request.urlopen(req, timeout=5)
        data = response.read()
        json_data = json.loads(data)
        print(json_data, file=sys.stderr)
        
        if json_data.__len__() > 0:
            umu_id = json_data[0]['umu_id']
            conn = self.get_connection()
            c = conn.cursor()
            c.execute("UPDATE Game SET UmuId=? WHERE ShortName=?", (umu_id, shortname))
            conn.commit()
            conn.close()
    
    def flush_cache(self):
        conn = self.get_connection()
        c = conn.cursor()
        c.execute("DELETE FROM Cache where ExpiryDate < datetime('now')")
        conn.commit()
        conn.close()


    def get_cache(self, key):
        print(f"Getting cache {key}", file=sys.stderr)
        self.flush_cache()
        conn = self.get_connection()
        c = conn.cursor()

        c.execute("SELECT Value FROM Cache WHERE Key=?", (key,))
        result = c.fetchone()
        conn.close()
        if result:
            print(f"Found cache {key} {result[0]}", file=sys.stderr)
            return result[0]
        else:
            return None
    
    def add_cache(self, key, value, expiry_date):
        conn = self.get_connection()
        c = conn.cursor()
        c.execute("INSERT INTO Cache (Key, Value, ExpiryDate) VALUES (?, ?, ?)", (key, value, expiry_date))
        conn.commit()
        print(f"Added cache {key} {value} {expiry_date}", file=sys.stderr)
        conn.close()
        
    def clear_cache(self, key):
        conn = self.get_connection()
        c = conn.cursor()
        c.execute("DELETE FROM Cache WHERE Key=?", (key,))
        conn.commit()
        conn.close()

    def get_games_with_images(self,  image_prefix, filter_str, installed, isLimited, urlencode, needsLogin):
        conn = self.get_connection()
        c = conn.cursor()
        c.row_factory = sqlite3.Row
        limited_clause = ""
        if (isLimited.lower() == "true"):
            limited_clause = "LIMIT 100"
        if (installed.lower() == "true"):
            c.execute(
                f"SELECT Game.ID, ShortName, Title, SteamClientID FROM Game WHERE SteamClientID <> '' and LOWER(Title) LIKE ? ORDER BY Title {limited_clause}", ('%' + filter_str.lower().replace(" ", "%") + '%',))
        else:
            c.execute(
                f"SELECT Game.ID, ShortName, Title, SteamClientID FROM Game WHERE LOWER(Title) LIKE ? ORDER BY Title {limited_clause}", ('%' + filter_str.lower().replace(" ", "%") + '%',))
        games = c.fetchall()
        result = []
        for game in games:
            game_id = game['ID']
            shortname = game['ShortName']
            title = game['Title']
            steam_client_id = game['SteamClientID']
            c.execute(
                "SELECT ImagePath FROM Images WHERE GameID=? order by SortOrder", (game_id,))
            images = c.fetchall()
            image_files = []
            for image in images:
                image_path = image[0]
                if (image_path == None):
                    image_url = ""
                else:
                    if (urlencode):
                        image_path = urllib.parse.quote(image_path)

                    image_url = image_prefix + image_path
                image_files.append(image_url)
            result.append({'ID': game_id, 'Name': title,
                           'Images': image_files, 'ShortName': shortname, 'SteamClientID': steam_client_id})
        conn.close()
        content =  {'NeedsLogin': needsLogin, 'Games': result}
        if self.storeURL != None:
            print(f"Store URL: {self.storeURL}", file=sys.stderr)
            content['storeURL'] = self.storeURL
        return json.dumps({'Type': 'GameGrid', 'Content': content })

    def load_conf_data_from_json(self, json_file):
        with open(json_file, 'r') as f:
            data = json.load(f)
            for section in data['Sections']:
                section['Name'] = section['Name'].lower()
                for option in section['Options']:
                    option['Key'] = option['Key'].lower()
            return data

    def create_empty_config_set(self, shortname, forkname, version, platform):
        conn = self.get_connection()
        c = conn.cursor()
        config_set_id = 0
        c.execute("select id from config_set where ShortName = ? AND forkname = ? AND version = ? AND platform = ?",
                  (shortname, forkname, version, platform))
        row = c.fetchone()
        if row is None:
            c.execute("INSERT INTO config_set (ShortName, forkname, version, platform) VALUES (?, ?, ?, ?)",
                      (shortname, forkname, version, platform))
            conn.commit()
        conn.close()

    def add_missing_config_sets(self, name):
        conn = self.get_connection()
        c = conn.cursor()
        query = "insert into config_set (ShortName, forkname, version, platform) select Game.ShortName, '', '', 'dos' from Game LEFT JOIN config_set ON Game.ShortName = config_set.ShortName AND config_set.platform = 'dos' WHERE config_set.id IS NULL"
        c.execute(query)
        conn.commit()
        conn.close()

    def get_config(self, shortnames, forkname, version, platform):
        conn = self.get_connection()
        c = conn.cursor()
        config = configparser.ConfigParser()
        autoexec_text = ""
        id = 0
        for shortname in shortnames:
            select_config_query = """SELECT config_set.id from config_Set
                    WHERE config_set.ShortName = ? AND (config_set.forkname = '' or config_set.forkname = ?) AND 
                    (config_set.version = '' or config_set.version = ?) AND 
                    (config_set.platform = '' or config_set.platform = ?)
                    order by config_set.platform desc, config_set.forkname desc, config_set.version desc"""

            c.execute(select_config_query,
                      (shortname, forkname, version, platform))
            row = c.fetchone()
            id = row[0]
            c.execute(
                """SELECT config_set.ShortName, configs.section, configs.key, configs.value FROM configs 
                JOIN config_set ON configs.config_set_id = config_set.id 
                WHERE config_set.id = ? AND 
                configs.section != 'autoexec'""", (id,))
            for row in c.fetchall():
                _, section, key, value = row

                if not config.has_section(section):
                    config.add_section(section)
                config.set(section, key, value)
            c.execute(
                """SELECT value FROM configs JOIN config_set ON configs.config_set_id = config_set.id 
                WHERE config_set.id = ? AND 
                configs.section = 'autoexec' AND configs.key = 'text'""", (id,))
            row = c.fetchone()
            if row is not None:
                autoexec_text += row[0]
        conn.close()
        return config, autoexec_text

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

    def parse_json_store_in_database(self, shortname, forkname, version, platform, config_data):
        # filename = os.path.expanduser(f"~/{shortname}_{platform}_{forkname}.json")
        # with open(filename, 'w') as f:
        #     json.dump(config_data, f)
        # try:
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
        for section in config_data['Sections']:
            for option in section['Options']:
                value = option['Value']
                value = value.replace('$', '$$')
                shouldUpdate = True
                if (option['Value'] == option['DefaultValue']):
                    shouldUpdate = False
                try:
                    if (option['Parents'] and len(option['Parents']) > 0 and option['Parents'][0]['Value'] == option['Value']
                            and option['Parents'][0]['Parent'] != 'default'):
                        shouldUpdate = False
                except:
                    print(option)
                if (shouldUpdate):
                    query = "INSERT INTO configs (section, key, value, config_set_id) VALUES (?, ?, ?, ?)"
                    params = (section['Name'], option['Key'],
                              value, config_set_id)
                    c.execute(query, params)
                    conn.commit()
        autoexec = config_data['Autoexec']
        autoexec = autoexec.replace('$', '$$')
        query = "INSERT INTO configs (section, key, value, config_set_id) VALUES (?, ?, ?, ?)"
        params = ('autoexec', 'text', autoexec, config_set_id)
        c.execute(query, params)
        conn.commit()
        conn.close()
        return json.dumps({'Type': 'Success', 'Content': {'Message': "Config saved"}})
        # except Exception as e:
        #     return json.dumps({'Type': 'Error', 'Content': {'success': False, 'error': f'somethign went sideways {e}'}})

    def generate_env_settings_json(self, json_file):
        with open(json_file, 'r') as f:
            content = f.read()
            return self.generate_bash_env_settings(content)

    def generate_bash_env_settings(self, config_json):
        script = "#!/usr/bin/env bash\n"
        config = json.loads(config_json)
        sections = config['Sections']
        for section in sections:
            script += f"# {section['Name']}\n"
            for option in section['Options']:
                script += f"export {section['Name'].upper()}_{option['Key'].upper()}=\"{option['Value']}\"\n"
            script += "\n"
        return script

    def get_schema_file(self, dir, schema):
        return os.path.join(dir, f"conf_schemas/{schema}.json")

    def get_config_json(self, shortnames, forkname, version, platform):
        try:
            print(f"Getting config for {shortnames} {forkname} {version} {platform}", file=sys.stderr)
            config_schema = f"{platform}_{forkname}_{version}"
            runtime_dir = os.environ.get('DECKY_PLUGIN_RUNTIME_DIR', "")
            plugin_dir = os.environ.get('DECKY_PLUGIN_DIR', "")
            WorkingDir = os.environ.get('WORKING_DIR', "")
            filepath = ""
            if os.path.exists(self.get_schema_file(runtime_dir, config_schema)):
                filepath = self.get_schema_file(runtime_dir, config_schema)
            elif os.path.exists(self.get_schema_file(plugin_dir, config_schema)):
                filepath = self.get_schema_file(plugin_dir, config_schema)
            else:
                filepath = self.get_schema_file(WorkingDir, config_schema)
            config_data = self.load_conf_data_from_json(
                os.path.expanduser(
                    filepath))
            print(f"Loaded config data from {filepath}", file=sys.stderr)
            conn = self.get_connection()
            c = conn.cursor()

            autoexec_text = ""
            id = 0
            parent_name = "default"
            for shortname in shortnames:
                c.execute("""SELECT config_set.id from config_Set
                        WHERE config_set.ShortName = ? AND (config_set.forkname = '' or config_set.forkname = ?) AND 
                        (config_set.version = '' or config_set.version = ?) AND 
                        (config_set.platform = '' or config_set.platform = ?)
                        order by config_set.platform desc, config_set.forkname desc, config_set.version desc""", (shortname, forkname, version, platform))
                row = c.fetchone()
                print(f"Found config set {row}", file=sys.stderr)
                id = row[0]
                print(f"Found config set id {id}", file=sys.stderr)
                c.execute(
                    """SELECT config_set.ShortName, configs.section, configs.key, configs.value FROM configs 
                    JOIN config_set ON configs.config_set_id = config_set.id 
                    WHERE config_set.id = ? AND 
                    configs.section != 'autoexec'""", (id,))
                for row in c.fetchall():
                    _, section, key, value = row
                    print(f"Found config {section} {key} {value}", file=sys.stderr)
                    section = self.find_section(config_data, section)
                    if section is not None:
                        option = self.find_option(section, key)
                        if option is not None:
                            if parent_name != "default":
                                option['Parents'] = [
                                    {'Parent': parent_name, 'Value': value}] + option['Parents']
                            option['Value'] = value
                c.execute(
                    """SELECT value FROM configs JOIN config_set ON configs.config_set_id = config_set.id 
                    WHERE config_set.id = ? AND 
                    configs.section = 'autoexec' AND configs.key = 'text'""", (id,))
                c.row_factory = sqlite3.Row
                row = c.fetchone()
                print(f"Found autoexec {row}", file=sys.stderr)
                if row is not None:
                    print(f"Found autoexec {row[0]}", file=sys.stderr)
                    autoexec_text += row['value']

                parent_name = shortname
            print(f"Setting autoexec config data", file=sys.stderr)
            config_data['Autoexec'] = autoexec_text
            print(f"Returning config data: {config_data}", file=sys.stderr)
            conn.close()
            return json.dumps({'Type': 'IniContent', 'Content': config_data})
        except Exception as e:
            print(f"An error occurred: ", e, file=sys.stderr)
            # Handle the exception here

    def find_section(self, config_data, section_name):
        for section in config_data['Sections']:
            if section['Name'] == section_name:
                return section
        return None

    def find_option(self, section, key):
        for option in section['Options']:
            if option['Key'] == key:
                return option
        return None

    def get_base64_images(self, game_id, image_prefix="", url_encode=False):
        conn = self.get_connection()
        c = conn.cursor()
        c.row_factory = sqlite3.Row
        c.execute("SELECT ImagePath FROM Images join Game on Game.ID = Images.GameID WHERE ShortName=? order by Images.SortOrder", (game_id,))
        images = []

        for row in c.fetchall():
            url = f"{image_prefix}{row['ImagePath']}"
            if url_encode:
                url = f"{image_prefix}{urllib.parse.quote(row[0])}"

            images.append(self.download(url))

        conn.close()
        tallImage = images[0]
        wideImage = images[1]
        return json.dumps({'Type': 'Images', 'Content': {'Grid': tallImage, 'GridH': wideImage, 'Hero': wideImage, 'Logo': tallImage}})

    def download(self, url):
        response = urllib.request.urlopen(url).read()
        encoded_data = base64.b64encode(response).decode('utf-8')
        return encoded_data

    def get_game_data(self, shortname, image_prefix, urlencode, platform, forkname, version):
        conn = self.get_connection()

        c = conn.cursor()
        c.row_factory = sqlite3.Row
        query = f"SELECT {', '.join([f'{col}' for col in self.cols])} , SteamClientID FROM Game WHERE ShortName=? "
        print(query, file=sys.stderr)
        c.execute(query , (shortname,)
            )

        result = c.fetchone()

        if result:
            releaseDate = result['ReleaseDate']
            if releaseDate:
                releaseDate = releaseDate.split("-")[0]
            game_data = {
                'Name': result['Title'],
                'Description': result['Notes'],
                'ApplicationPath': result['ApplicationPath'],
                'ManualPath': result['ManualPath'],
                'Publisher': result['Publisher'],
                'RootFolder': result['RootFolder'],
                'Source': result['Source'],
                'DatabaseID': result['DatabaseID'],
                'Genre': result['Genre'],
                'ConfigurationPath': result['ConfigurationPath'],
                'Developer': result['Developer'],
                'ReleaseDate': releaseDate,
                'Size': result['Size'],
                'SteamClientID': result['SteamClientID'],
                'ShortName': shortname,
                'HasDosConfig': False,
                'HasBatFiles': False
            }

            c.execute("SELECT ID FROM Game WHERE ShortName=?", (shortname,))
            game_id = c.fetchone()

            image_files = []
            c.execute(
                "SELECT ImagePath FROM Images join Game on Game.ID = Images.GameID WHERE ShortName=? order by Images.SortOrder", (shortname,))
            images = c.fetchall()
            for image in images:
                image_path = image['ImagePath']
                if (image_path == None):
                    image_url = ""
                else:
                    if (urlencode):
                        image_path = urllib.parse.quote(image_path)
                    image_url = image_prefix + image_path
                image_files.append(image_url)

            conn.close()
            result = {
                'Name': result['Title'],
                'Description': self.display_game_details(game_data),
                'ApplicationPath': result['ApplicationPath'],
                'ManualPath': result['ManualPath'],
                'RootFolder': result['RootFolder'],
                'ConfigurationPath': result['ConfigurationPath'],
                'SteamClientID': result['SteamClientID'],
                'ShortName': shortname,
                'HasDosConfig': False,
                'HasBatFiles': False,
                'Editors': self.get_editors(shortname, platform, forkname, version)
            }
            result['Images'] = image_files
            return json.dumps({'Type': 'GameDetails', 'Content':  result}, indent=2)
        else:
            return None

    def display_game_details(self, game_data):
        html = f"<div style=' width: 100%;'>"
        html += f"<p style='width:100%; white-space: pre-wrap;'>{game_data['Description']}</p>"
        html += f"</div>"
        html += f"<div>"
        # if game_data['Size'] != None:
        #     html += f"<p>Size: {game_data['Size']}</p>"
        if game_data['Publisher'] != None and game_data['Publisher'] != "":
            html += f"<p>Publisher: {game_data['Publisher']}</p>"
        html += f"<p>Developer: {game_data['Developer']}</p>"
        if game_data['Genre'] != None and game_data['Genre'] != "":
            html += f"<p>Genre: {game_data['Genre']}</p>"
        if game_data['ReleaseDate'] != None and game_data['ReleaseDate'] != "":
            html += f"<p>Release Date: {game_data['ReleaseDate']}</p>"
        html += f"</div>"
        return html

    def get_editors(self, shortname, platform, forkname, version):
        conn = self.get_connection()
        c = conn.cursor()
        c.row_factory = sqlite3.Row
        c.execute("SELECT ID FROM Game WHERE ShortName=?", (shortname,))
        game_id = c.fetchone()[0]
        editors = []
        if self.setNameConfig != None:

            c.execute("select id, platform, forkname, version from config_set where shortname = ? AND platform = ? AND forkname = '' AND version = ''",
                      (shortname, self.setNameConfig))
            row = c.fetchone()
            if (not row):
                self.create_empty_config_set(
                    shortname, "", "", self.setNameConfig)

            editors.append({
                'Type': 'IniEditor',
                'InitActionId': 'GetPlatformConfigFileActions',
                'Description': 'Configures the dosbox.conf file for the game',
                'Title': f"{self.setNameConfig} config",
                'ContentId': shortname
            })

        if platform != self.setNameConfig:
            c.execute("""SELECT config_set.id, config_set.platform, config_set.forkname, config_set.version from config_Set
                    WHERE config_set.ShortName = ? AND (config_set.forkname = '' or config_set.forkname = ?) AND 
                    (config_set.version = '' or config_set.version = ?) AND 
                    (config_set.platform = '' or config_set.platform = ?)
                    order by config_set.platform desc, config_set.forkname desc, config_set.version desc
                    LIMIT 1""", (shortname, forkname, version, platform,))
            for row in c.fetchall():
                platform = row['platform']
                forkname = row['forkname']
                version = row['version']
                title = f"dosbox.config"

                editors.append({
                    'Type': 'IniEditor',
                    'InitActionId': 'GetDosboxConfigFileActions',
                    'Description': 'Configures the dosbox.conf file for the game',
                    'Title': title,
                    'ContentId': shortname
                })

        c.execute("SELECT ID FROM BatFiles WHERE GameID=?", (game_id,))
        bat_files = c.fetchone()
        if bat_files:
            editors = editors + [{'Type': 'FileEditor',
                                  'InitActionId': 'GetBatFileActions',
                                  'Description': 'Edit the bat files for the game',
                                  'Title': 'Bat Files',
                                  'ContentId': shortname}]
        conn.close()

        return editors

    def get_setting(self, name):
        conn = self.get_connection()
        c = conn.cursor()
        c.row_factory = sqlite3.Row
        c.execute("SELECT value FROM Settings WHERE name=?", (name,))
        result = c.fetchone()
        conn.close()
        if result:
            return json.dumps({'Type': 'Setting', 'Content': {'name': name, 'value': result[0]}})
        else:
            return json.dumps({'Type': 'Setting', 'Content': {'name': name, 'value': ''}})

    def save_setting(self, name, value):
        conn = self.get_connection()
        c = conn.cursor()
        c.execute("SELECT COUNT(*) FROM Settings WHERE name=?",
                  (name,))
        result = c.fetchone()
        if result[0] == 0:
            c.execute("INSERT INTO Settings (name, value) VALUES (?, ?)",
                      (name, value))
        else:
            c.execute("UPDATE Settings SET value=? WHERE name=?",
                      (value, name))
        conn.commit()
        conn.close()
        return json.dumps({'Type': 'Success', 'Content': {'Message': "Setting Saved: " + name }})

    def add_steam_client_id(self, shortname, steam_client_id):
        conn = self.get_connection()
        c = conn.cursor()
        c.execute("UPDATE Game SET SteamClientID=? WHERE ShortName=?",
                  (steam_client_id, shortname))
        conn.commit()
        conn.close()

    def clear_steam_client_id(self, shortname):
        conn = self.get_connection()
        c = conn.cursor()
        c.execute("UPDATE Game SET SteamClientID='' WHERE ShortName=?",
                  (shortname,))
        conn.commit()
        conn.close()



            
class Achievements:
    def __init__(self):
        basepath = os.environ.get('DECKY_PLUGIN_RUNTIME_DIR', "")
        achievements_path = os.path.join(basepath, "achievements.txt")
        self.achievements_file = achievements_path

    def check_achievements(self):
        try:
            with open(self.achievements_file, 'r') as f:
                achievements = f.read()
                return int(base64.b64decode(achievements).decode('utf-8'), 2)
        except Exception as e:
            print(f"Error checking achievements: {e}")
            return 0

    def add_achievement(self, achievement_base64):
        achievement = int(base64.b64decode(achievement_base64).decode('utf-8'), 2)
        achievements = self.check_achievements()
        achievements |= 1 << achievement
        with open(self.achievements_file, 'w') as f:
            f.write(base64.b64encode(bin(achievements)[2:].encode('utf-8')).decode('utf-8'))

    def has_achievement(self, achievement_base64):
        achievement = int(base64.b64decode(achievement_base64).decode('utf-8'), 2)
        achievements = self.check_achievements()
        return (achievements & (1 << achievement)) != 0

    def get_achievements(self):
        achievements_bit_field = self.check_achievements()
        achievements = []
        achievement_number = 0
        while achievements_bit_field > 0:
            if (achievements_bit_field & 1) == 1:
                achievements.append(base64.b64encode(bin(achievement_number)[2:].encode('utf-8')).decode('utf-8'))
            achievements_bit_field >>= 1
            achievement_number += 1
        return achievements




class GenericArgs:
    gameSet: GameSet = None
    parser = None
    args = None
    achievements: Achievements = None

    def __init__(self):
        self.parser = argparse.ArgumentParser()
        # self.addArguments()
        self.achievements = Achievements()

    def addArguments(self):
        self.parser.add_argument(
            '--dbfile', help='Path to the SQLite database file', default='configs.db')

        self.parser.add_argument(
            '--platform', help='Platform [windows,linux]', default='linux')

        self.parser.add_argument(
            '--forkname', help='dosbox fork name', default='staging')

        self.parser.add_argument(
            '--version', help='dosbox version', default='')

        self.parser.add_argument(
            '--urlencode', help='Url encode string', action='store_true')

        self.parser.add_argument(
            '--getgameswithimages', nargs='+', help='Get games with images')

        self.parser.add_argument(
            '--confjson', nargs='+', help='List of shortnames to reproduce configuration file from database'
        )

        self.parser.add_argument(
            '--parsejson', help='Configuration shortname, the json is read from stdin'
        )

        self.parser.add_argument(
            '--addsteamclientid', nargs=2, help='Add steam client id to game')

        self.parser.add_argument(
            '--getgamedata', nargs=2, help='Get game data')

        self.parser.add_argument(
            '--clearsteamclientid', nargs=1, help='Clear steam client id to game'
        )

        self.parser.add_argument(
            '--getsetting', help='Get setting'
        )

        self.parser.add_argument(
            '--savesetting', nargs=2, help='Save setting'
        )
        self.parser.add_argument(
            '--get-env-settings', help='Get environment settings')

        self.parser.add_argument(
            '--generate-env-settings-json', help='Generate environment settings')
        
        self.parser.add_argument(
            '--update-umu-id', nargs=2, help='Update UMU ID')
        self.parser.add_argument(
            '--get-umu-id', nargs=1, help='Get UMU ID')
        self.parser.add_argument(
            '--add-achievement', nargs=1, help='Add achievement')

    def parseArgs(self):
        self.args = self.parser.parse_args()

    def processArgs(self):
        if self.args.parsejson:
            config_data = self.gameSet.read_json_from_stdin()
            print(self.gameSet.parse_json_store_in_database(
                self.args.parsejson, self.args.forkname, self.args.version, self.args.platform, config_data))

        if self.args.confjson:
            print(self.gameSet.get_config_json(
                self.args.confjson, self.args.forkname, self.args.version, self.args.platform))

        if self.args.addsteamclientid:
            self.gameSet.add_steam_client_id(
                self.args.addsteamclientid[0], self.args.addsteamclientid[1])
            print(json.dumps(
                {'Type': 'Success', 'Content': {'Message': 'Steam Client ID added'}}))

        if self.args.clearsteamclientid:
            self.gameSet.clear_steam_client_id(self.args.clearsteamclientid[0])
            print(json.dumps(
                {'Type': 'Success', 'Content': {"Message": "Steam Client ID Cleared"}}))

        if self.args.getgamedata:
            urlencode = False
            if (self.args.urlencode):
                urlencode = True
            print(self.gameSet.get_game_data(
                self.args.getgamedata[0], self.args.getgamedata[1], urlencode, self.args.platform, self.args.forkname, self.args.version))

        if self.args.getsetting:
            print(self.gameSet.get_setting(self.args.getsetting))

        if self.args.savesetting:
            print(self.gameSet.save_setting(
                self.args.savesetting[0], self.args.savesetting[1]))

        if self.args.get_env_settings:
            result = json.loads(self.gameSet.get_config_json(
                [self.args.get_env_settings], self.args.forkname, self.args.version, self.args.platform))
            print(self.gameSet.generate_bash_env_settings(
                json.dumps(result['Content'])))

        if self.args.generate_env_settings_json:
            print(self.gameSet.generate_env_settings_json(
                self.args.generate_env_settings_json))

        if self.args.getgameswithimages:
            filter = ""
            urlencode = False
            if (self.args.urlencode):
                urlencode = True
            if (len(self.args.getgameswithimages) > 1):
                filter = self.args.getgameswithimages[1]
                installed = self.args.getgameswithimages[2]
                isLimited = self.args.getgameswithimages[3]
                needsLogin = self.args.getgameswithimages[4]
            print(self.gameSet.get_games_with_images(
                self.args.getgameswithimages[0], filter, installed, isLimited, urlencode, needsLogin))
        if self.args.update_umu_id:
            self.gameSet.update_umu_id(self.args.update_umu_id[0], self.args.update_umu_id[1])
        
        if self.args.add_achievement:
            self.achievements.add_achievement(self.args.add_achievement[0])
        if self.args.get_umu_id:
            print(self.gameSet.get_umu_id(self.args.get_umu_id[0]))
