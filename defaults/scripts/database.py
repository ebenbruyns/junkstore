

import sqlite3

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
