

import os
import json
import sqlite3
import configparser
import urllib.request
import base64

import base64

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
        "ReleaseDate"]


def create_tables(db_file):
    conn = sqlite3.connect(db_file)
    c = conn.cursor()
    c.execute(
        'CREATE TABLE IF NOT EXISTS configs (id INTEGER PRIMARY KEY, section TEXT, key TEXT, value TEXT, config_set_id INTEGER, FOREIGN KEY(config_set_id) REFERENCES config_set(id))')
    c.execute(
        'CREATE TABLE IF NOT EXISTS config_set (id INTEGER PRIMARY KEY, ShortName TEXT, forkname TEXT, version TEXT, platform TEXT)')
    c.execute(
        f"CREATE TABLE IF NOT EXISTS Game (id INTEGER PRIMARY KEY, {', '.join([f'{col} TEXT' for col in cols])}, SteamClientID TEXT, ShortName TEXT UNIQUE)")
    c.execute(f"CREATE TABLE IF NOT EXISTS Images (id INTEGER PRIMARY KEY, GameID INTEGER, ImagePath TEXT UNIQUE, FileName TEXT, SortOrder INTEGER, FOREIGN KEY(GameID) REFERENCES Game(id))")
    c.execute(f"CREATE TABLE IF NOT EXISTS ZipFiles (id INTEGER PRIMARY KEY, GameID INTEGER, ZipFileName TEXT UNIQUE, FOREIGN KEY(GameID) REFERENCES Game(id))")
    c.execute(f"CREATE TABLE IF NOT EXISTS BatFiles (id INTEGER PRIMARY KEY, GameID INTEGER, Path TEXT, BatFileName TEXT,  Content TEXT, FOREIGN KEY(GameID) REFERENCES Game(id))")
    c.execute(
        'CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY, name TEXT UNIQUE, value TEXT)')

    conn.commit()
    conn.close()


def load_conf_data_from_json(json_file):
    with open(json_file, 'r') as f:
        data = json.load(f)
        for section in data['Sections']:
            section['Name'] = section['Name'].lower()
            for option in section['Options']:
                option['Key'] = option['Key'].lower()
        return data


def create_empty_config_set(shortname, forkname, version, platform, conn):
    c = conn.cursor()
    config_set_id = 0
    c.execute("select id from config_set where ShortName = ? AND forkname = ? AND version = ? AND platform = ?",
              (shortname, forkname, version, platform))
    row = c.fetchone()
    if row is None:
        c.execute("INSERT INTO config_set (ShortName, forkname, version, platform) VALUES (?, ?, ?, ?)",
                  (shortname, forkname, version, platform))
        conn.commit()


def add_missing_config_sets(name, db_file):
    conn = sqlite3.connect(db_file)
    c = conn.cursor()
    query = "insert into config_set (ShortName, forkname, version, platform) select Game.ShortName, '', '', 'dos' from Game LEFT JOIN config_set ON Game.ShortName = config_set.ShortName AND config_set.platform = 'dos' WHERE config_set.id IS NULL"
    c.execute(query)
    conn.commit()
    conn.close()


def get_config(shortnames, forkname, version, platform, db_file):
    conn = sqlite3.connect(db_file)
    c = conn.cursor()
    config = configparser.ConfigParser()
    autoexec_text = ""
    id = 0
    for shortname in shortnames:
        c.execute("""SELECT config_set.id from config_Set
                WHERE config_set.ShortName = ? AND (config_set.forkname = '' or config_set.forkname = ?) AND 
                (config_set.version = '' or config_set.version = ?) AND 
                (config_set.platform = '' or config_set.platform = ?)
                order by config_set.platform desc, config_set.forkname desc, config_set.version desc""", (shortname, forkname, version, platform))
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


def store_config_in_database(shortname, forkname, version, platform, sections, autoexec, db_file):
    conn = sqlite3.connect(db_file)
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


def parse_json_store_in_database(shortname, forkname, version, platform, config_data, db_file):
    # filename = os.path.expanduser(f"~/{shortname}_{platform}_{forkname}.json")
    # with open(filename, 'w') as f:
    #     json.dump(config_data, f)
    conn = sqlite3.connect(db_file)
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

            if (option['Parents'] and len(option['Parents']) > 0 and option['Parents'][0]['Value'] == option['Value']
                    and option['Parents'][0]['Parent'] != 'default'):
                shouldUpdate = False
            if (shouldUpdate):
                query = "INSERT INTO configs (section, key, value, config_set_id) VALUES (?, ?, ?, ?)"
                params = (section['Name'], option['Key'], value, config_set_id)
                c.execute(query, params)
                conn.commit()
    autoexec = config_data['Autoexec']
    autoexec = autoexec.replace('$', '$$')
    query = "INSERT INTO configs (section, key, value, config_set_id) VALUES (?, ?, ?, ?)"
    params = ('autoexec', 'text', autoexec, config_set_id)
    c.execute(query, params)
    conn.commit()
    conn.close()
    return json.dumps({'Type': 'Success', 'Content': {'success': True}})


def generate_env_settings_json(json_file):
    with open(json_file, 'r') as f:
        content = f.read()
        return generate_bash_env_settings(content)


def generate_bash_env_settings(config_json):
    script = "#!/bin/bash\n"
    config = json.loads(config_json)
    sections = config['Sections']
    for section in sections:
        script += f"# {section['Name']}\n"
        for option in section['Options']:
            script += f"export {section['Name'].upper()}_{option['Key'].upper()}={option['Value']}\n"
        script += "\n"
    return script


def get_schema_file(dir, schema):
    return os.path.join(dir, f"conf_schemas/{schema}.json")


def get_config_json(shortnames, forkname, version, platform, db_file):
    try:
        config_schema = f"{platform}_{forkname}_{version}"
        runtime_dir = os.environ.get('DECKY_PLUGIN_RUNTIME_DIR', "")
        plugin_dir = os.environ.get('DECKY_PLUGIN_DIR', "")
        WorkingDir = os.environ.get('WORKING_DIR', "")
        filepath = ""
        if os.path.exists(get_schema_file(runtime_dir, config_schema)):
            filepath = get_schema_file(runtime_dir, config_schema)
        elif os.path.exists(get_schema_file(plugin_dir, config_schema)):
            filepath = get_schema_file(plugin_dir, config_schema)
        else:
            filepath = get_schema_file(WorkingDir, config_schema)
       # print(f"filepath: {filepath}")
        config_data = load_conf_data_from_json(
            os.path.expanduser(
                filepath))
        conn = sqlite3.connect(db_file)
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
            id = row[0]
            c.execute(
                """SELECT config_set.ShortName, configs.section, configs.key, configs.value FROM configs 
                JOIN config_set ON configs.config_set_id = config_set.id 
                WHERE config_set.id = ? AND 
                configs.section != 'autoexec'""", (id,))
            for row in c.fetchall():
                _, section, key, value = row
                section = find_section(config_data, section)
                if section is not None:
                    option = find_option(section, key)
                    if option is not None:
                        if parent_name != "default":
                            option['Parents'] = [
                                {'Parent': parent_name, 'Value': value}] + option['Parents']
                        option['Value'] = value
            c.execute(
                """SELECT value FROM configs JOIN config_set ON configs.config_set_id = config_set.id 
                WHERE config_set.id = ? AND 
                configs.section = 'autoexec' AND configs.key = 'text'""", (id,))
            row = c.fetchone()
            if row is not None:
                autoexec_text += row[0]
            parent_name = shortname
        config_data['Autoexec'] = autoexec_text
        conn.close()
        return json.dumps({'Type': 'IniContent', 'Content': config_data})
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        # Handle the exception here


def find_section(config_data, section_name):
    for section in config_data['Sections']:
        if section['Name'] == section_name:
            return section
    return None


def find_option(section, key):
    for option in section['Options']:
        if option['Key'] == key:
            return option
    return None


def get_base64_images(game_id, db_file, image_prefix="", url_encode=True):
    conn = sqlite3.connect(db_file)
    c = conn.cursor()
    c.execute("SELECT ImagePath FROM Images join Game on Game.ID = Images.GameID WHERE ShortName=? order by Images.SortOrder", (game_id,))
    images = []

    for row in c.fetchall():
        url = f"{image_prefix}{row[0]}"
        if url_encode:
            url = f"{image_prefix}{urllib.parse.quote(row[0])}"

        images.append(download(url))

    conn.close()
    tallImage = images[0]
    wideImage = images[1]
    return json.dumps({'Type': 'Images', 'Content': {'Grid': tallImage, 'GridH': wideImage, 'Hero': wideImage, 'Logo': tallImage}})


def download(url):
    response = urllib.request.urlopen(url).read()
    encoded_data = base64.b64encode(response).decode('utf-8')
    return encoded_data
