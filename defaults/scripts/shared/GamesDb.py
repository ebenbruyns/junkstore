import json
import sqlite3
import sys
import urllib.request

import GameSet
import traceback
import concurrent.futures

class GamesDb(GameSet.GameSet):
    def __init__(self, db_file, storeName, setNameConfig=None):
        super().__init__(db_file, storeName,  setNameConfig)
    
    def create_tables(self):
        super().create_tables()
        conn = self.get_connection()
        c = conn.cursor()
        c.execute("PRAGMA table_info(Images)")
        columns = [column[1] for column in c.fetchall()]
        if "Type" not in columns:
            c.execute("drop table Images")
            c.execute(f"CREATE TABLE IF NOT EXISTS Images (id INTEGER PRIMARY KEY, GameID INTEGER, ImagePath TEXT, FileName TEXT, Type TEXT, SortOrder INTEGER, FOREIGN KEY(GameID) REFERENCES Game(id))")
        conn.commit()
        conn.close()
    
    def get_base64_images(self, game_id, image_prefix="", url_encode=False):
        conn = self.get_connection()
        c = conn.cursor()
        c.row_factory = sqlite3.Row
        c.execute("SELECT ImagePath, Images.Type FROM Images join Game on Game.ID = Images.GameID WHERE ShortName=? order by Images.SortOrder", (game_id,))
        
        grid = None
        gridH = None
        heroImage = None
        logo = None
       
        for row in c.fetchall():
            image = row['ImagePath']
            print(f"{row['Type']}: {image}", file=sys.stderr)
            if row['Type'] == 'vertical_cover':
                grid = self.download(image)
               
            elif row['Type'] == 'horizontal_artwork':
                heroImage = self.download(image)
                
            elif row['Type'] == 'logo':
                gridH = self.download(image)
            elif row['Type'] == 'square_icon':
                logo = self.download(image)    
                
        conn.close()
        return json.dumps({'Type': 'Images', 'Content': {'Grid': grid, 'GridH': gridH, 'Hero': heroImage, 'Logo': logo}})
        
    def get_game_info(self, store, id):
        
        url = f"https://gamesdb.gog.com/platforms/{self.storeName.lower()}/external_releases/{id}"
        headers = {'User-Agent': 'Mozilla/5.0'}
        print( url, file=sys.stderr)
        req = urllib.request.Request(url, headers=headers)
        response = urllib.request.urlopen(req, timeout=5)
        data = response.read()
        json_data = json.loads(data)
        
        if json_data.get('error'):
            print(f"Error getting game info for {id}: {json_data['error']}", file=sys.stderr)
            return None, []
        game = json_data['game']
        game_data = None
        images = []
        if game is not None:
            if game['type'] == "game":
                title = ""
                
                
                developer = ""
                publisher = ""
                genre = ""
                release_date = ""
                notes = ""
                shortname = ""
                sorting_title = ""
                if json_data['title']:
                    title = json_data['title']['*']
                if game['developers'] and len(game['developers']) > 0:
                    developer = ", ".join(game['developers'][0]['name'] for developer in game['developers'])
                if game['publishers'] and len(game['publishers']) > 0:
                    publisher = ", ".join(game['publishers'][0]['name'] for publisher in game['publishers'])   

                if game['genres'] and len(game['genres']) > 0:
                    genre = ", ".join(game['genres'][0]['name']['*'] for genre in game['genres']) 
                if game['first_release_date']:
                    release_date = game['first_release_date']
                if game['summary']:
                    notes = game['summary']['*']
                if json_data['external_id']:
                    shortname = json_data['external_id']
                if json_data['sorting_title']:
                    sorting_title = json_data['sorting_title']['*']
                def check_url(url):
                    for image in images:
                        if image['ImagePath'] == url:
                            return True
                    return False
                def add_image(base, type, sort_order):
                    if base.get(type) is not None:
                        url = base[type]['url_format'].replace("{formatter}", "").replace("{ext}", "jpg")
                        if check_url(url) == False:
                            images.append({
                                "ImagePath": url,
                                "FileName": "",
                                "SortOrder": sort_order,
                                "Type": type
                            })
                add_image(game, 'vertical_cover', 0)
                add_image(game, 'horizontal_artwork', 1)
                add_image(game, 'background', 1)
                add_image(game, 'cover', 1)
                add_image(game, 'logo', 1)
                add_image(game, 'square_icon', 1)
                
                if game['artworks']:
                    for artwork in game['artworks']:
                        url = artwork['url_format'].replace("{formatter}", "").replace("{ext}", "jpg")
                        if check_url(url) == False:
                            images.append({
                                "ImagePath": url,
                                "FileName": "",
                                "SortOrder": 2,
                                "Type": "artwork"
                            })         
               
                if game['screenshots']:
                    for screenshot in game['screenshots']:
                        url = screenshot['url_format'].replace("{formatter}", "").replace("{ext}", "jpg")
                        if check_url(url) == False:
                            images.append({
                                "ImagePath": url,
                                "FileName": "",
                                "SortOrder": 3,
                                "Type": "screenshot"
                            })
                game_data = {
                            "Title": title,
                            "Notes": notes,
                            "Publisher": publisher,
                            "Source": self.storeName,
                            "DatabaseID": shortname,
                            "Genre": genre,
                            "Developer": developer,
                            "ReleaseDate": release_date,
                            "ShortName": shortname,
                            "SortingTitle": sorting_title                           
                        }
        
            
        return game_data, images
    def insert_data(self, id_list):
        def process_game(id):
            conn = self.get_connection()
            c = conn.cursor()
            try:
                c.execute("SELECT id FROM Game WHERE ShortName=?", (id,))
                result = c.fetchone()
                # print(f"Result: {result}", file=sys.stderr)
                store = self.storeName
                # print(f"Processing game {id} from {store}", file=sys.stderr)
                try:
                    game_data,images = self.get_game_info(store.lower(), id)
                except Exception as e:
                    print(f"Error getting metadata for game: {id} {e}", file=sys.stderr)
                    traceback.print_exc()
                    return
                if game_data is None:
                    if result is not None:
                        c.execute("DELETE FROM Images WHERE GameID=?", (result[0],))
                        c.execute("DELETE FROM BatFiles WHERE GameID=?", (result[0],))
                        c.execute("DELETE FROM ZipFiles WHERE GameID=?", (result[0],))
                        c.execute("DELETE FROM Game WHERE id=?", (result[0],))
                        conn.commit()
                    return
                # print(f"Game data: {game_data}", file=sys.stderr)
                game_id = None
                key_count = len(game_data.keys())
                placeholders = ', '.join(['?' for _ in range(key_count)])
                if result is None:
                    
                    
                    # print(f"Inserting game {game_data["Title"]} into database: {game_data}", file=sys.stderr)
                    
                    query = f"INSERT INTO Game ({', '.join(list(game_data.keys()))}) VALUES ({placeholders})"
                    c.execute(query, list(game_data.values()))

                    game_id = c.lastrowid
                    conn.commit()
                else:
                    game_id = result[0]    
                    #update game
                    query = f"UPDATE Game SET {', '.join([f'{key}=?' for key in game_data.keys()])} WHERE id=?"
                    c.execute(query, list(game_data.values()) + [game_id])
                    conn.commit()

                # Insert images into the Images table
                c.execute("DELETE FROM Images WHERE Type is null")
                
                c.execute("select count(1) from Images where GameID=?", (game_id,))
                count = c.fetchone()[0]
                if count == 0:
                    if images:
                        for image in images:
                            try:
                                c.execute("INSERT INTO Images (GameID, ImagePath, FileName, SortOrder, Type) VALUES (?, ?, ?, ?, ?)", (game_id, image['ImagePath'], image['FileName'], image['SortOrder'], image['Type']))
                                conn.commit()
                            except Exception as e:
                                path = image["ImagePath"]
                                print(f"Error inserting image into database: {e}, {path}", file=sys.stderr)    
                conn.commit()

            except Exception as e:
                print(f"Error parsing metadata for game: {id} {e}", file=sys.stderr)
                traceback.print_exc()

            conn.close()
        with concurrent.futures.ThreadPoolExecutor(max_workers=40) as executor:
            executor.map(process_game, id_list)
