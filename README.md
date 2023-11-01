# Junk Store plugin [![Chat](https://img.shields.io/badge/chat-on%20discord-7289da.svg)](https://deckbrew.xyz/discord)
[Just Store Discord server](https://discord.gg/Dy7JUNc44A)
[See it in action here!](https://www.youtube.com/watch?v=dzoQzM_xExU)

This is a very simple plugin that builds it's content from a set of scripts.

Place scripts.json in ~/homebrew/data/junk-store/

```js
{
  "init_script": "~/bin/junk-store.sh init",
  "content_dir": "~/Games/exo/",
  "scripts": [
    {
      "TabName": "Dos",
      "get_game_details": "~/bin/junk-store.sh getgamedetails",
      "save_config": "~/bin/junk-store.sh saveconfig",
      "get_config": "~/bin/junk-store.sh getconfig",
      "install_game": "~/bin/junk-store.sh install",
      "uninstall_game": "~/bin/junk-store.sh uninstall",
      "get_game_data": "~/bin/junk-store.sh getgames",
      "plugin_init": "~/bin/junk-store.sh init",
      "get_game_bats": "~/bin/junk-store.sh getbats",
      "save_game_bats": "~/bin/junk-store.sh savebats"
    },
    {
      "TabName": "Windows",
      "get_game_details": "~/bin/junk-store.sh getgamedetails",
      "save_config": "~/bin/junk-store.sh saveconfig",
      "get_config": "~/bin/junk-store.sh getconfig",
      "install_game": "~/bin/junk-store.sh install",
      "uninstall_game": "~/bin/junk-store.sh uninstall",
      "get_game_data": "~/bin/junk-store.sh getgames",
      "plugin_init": "~/bin/junk-store.sh init",
      "get_game_bats": "~/bin/junk-store.sh getbats",
      "save_game_bats": "~/bin/junk-store.sh savebats"
    }
  ]
}


```

The reference scripts uses a python application to do all the heavy lifting, it uses [minicoda]
(https://docs.conda.io/projects/miniconda/en/latest/) suffice to say that if you're going to follow
a similar path you need to install it

The scripts are rather simple in the reference inplementation their content follows. This is likely to change in the future, but if people want to do cool stuff with it now I don't want to stop them.

settings.sh

```bash
#!/bin/bash
# changes the source of the games [local, lan, other]
SOURCE=local
# changes the platform of the games [deck, pc]
HOSTTYPE=pc
# add miniconda to path
PATH=$HOME/miniconda3/bin:$PATH
# the path to the dosbox-conf.py script
DOSCONF="${HOME}/bin/dosbox-conf.py"
BASE_PATH="Games/"
ASSETS_PATH="assets/games"
case $PLATFORM in
    Dos)
        # the install location of the games
        INSTALL_DIR="$HOME/Games/sdos/"
        # the launcher script to use in steam
        LAUNCHER="${HOME}/bin/run_dosbox.sh"
        IMAGES="Images/Dos"
        ZIPS="Dos"
        SETNAME="junk"
        DBNAME="configs.db"
        ;;
    Windows)
        # the install location of the games
        INSTALL_DIR="$HOME/Games/swin/"
        # the launcher script to use in steam
        LAUNCHER="${HOME}/bin/run_win_dosbox.sh"
        ASSETS_PATH="assets/games"
        IMAGES="Images/Windows"
        ZIPS="Windows"
        SETNAME="windows"
        DBNAME="winconfigs.db"
        ;;
esac


case $HOSTTYPE in
    deck)
        DBPATH="$HOME"
        DOSCONF="${HOME}/bin/dosbox-conf.py"
        DOSBOX="/bin/flatpak run io.github.dosbox-staging"
        ;;
    *)
        DBPATH="${HOME}"
        DOSCONF="${HOME}/bin/dosbox-conf.py"
        DOSBOX="/usr/bin/dosbox-staging"
        ;;
esac

# database to use for configs and metadata
DBFILE="${DBPATH}/${DBNAME}"

case $SOURCE in
    local)
        # SERVER should be mostly ok unless you run your own server - there might be permissions issues though with decky loader
        # if that's the case you might have to change the permissions of the assets folder
        SERVER="${CONTENT_SERVER}/${DECKY_PLUGIN_NAME}/${ASSETS_PATH}"
        # Change this to the location of your games folder
        ZIP_DIR="${HOME}/${BASE_PATH}/${ZIPS}/"
        IMAGE_PATH="${SERVER}/${SETNAME}/${IMAGES}/"
        ;;
    lan)
        # Change this to the location of your server serving up eXoDOS
        SERVER="http://192.168.8.100:9000"
        # Change this to the location of the zipped games on the server
        ZIP_DIR="${SERVER}/${ZIPS}/"
        IMAGE_PATH="${SERVER}/${SETNAME}/${IMAGES}/"
        ;;
    other)
        case $PLATFORM in
            Dos)
                SERVER=""  
                ZIP_DIR=""
                ;;
            Windows)
                export SERVER=""  
                export ZIP_DIR=""
                ;;
        esac
        IMAGE_PATH="${SERVER}/${IMAGES}"
        ;;
    *)  echo "Unknown source: $SOURCE"
        exit 1
        ;;  
esac    


# this is used by the runner scripts, keeping is central so changes happen in one place
function run_dosbox(){
    $DOSCONF --conf "${1}" --dbfile $DBFILE
    $DOSCONF --writebatfiles "${1}" --dbfile $DBFILE

    extip=$(curl -sf ident.me || curl -sf tnedi.me)
    echo "$extip" >  "${INSTALL_DIR}/${1}/InternetIP.txt"
    ipaddress=`ip -4 -o addr show up primary scope global | sed -e "s|^.*inet \(.*\)/.*|\1\r|"`
    echo "$ipaddress" >  "${INSTALL_DIR}/${1}/LanIP.txt"

    $DOSBOX
}
```

junk-store.sh 

```bash
#!/bin/bash
source "${HOME}/bin/settings.sh"

function init() {
    chmod 755 -R "${DECKY_PLUGIN_DIR}/dist/"
    mkdir -p "${DECKY_PLUGIN_DIR}/dist/assets/"
    ln -s "${HOME}/$BASE_PATH" "${DECKY_PLUGIN_DIR}/dist/${ASSETS_PATH}" 
}
function getgames(){
    TEMP=$($DOSCONF --getgameswithimages "${IMAGE_PATH}" "${1}" "${2}" "${3}" --dbfile $DBFILE)
    echo $TEMP
}
function saveconfig(){
    cat | $DOSCONF --parsejson "${1}" --dbfile $DBFILE --platform "${2}" --forkname "${3}" --version "${4}"   
}
function getconfig(){
    TEMP=$($DOSCONF --confjson "${1}" --platform "${2}" --forkname "${3}" --version "${4}" --dbfile $DBFILE)
    echo $TEMP
}
function install(){
    $DOSCONF --addsteamclientid "${1}" "${2}" --dbfile $DBFILE

    ZIPFILE=$($DOSCONF --getzip "${1}" --dbfile $DBFILE)

    mkdir -p "${INSTALL_DIR}"
    cd "${INSTALL_DIR}"
    case $SOURCE in
        local)
            unzip -o "${ZIP_DIR}/${ZIPFILE}" > /dev/null
            ;;
        lan)
            URL="${ZIP_DIR}/${ZIPFILE}"
            wget "${URL}"
            unzip -o "${ZIPFILE}" > /dev/null   
            rm "${ZIPFILE}"
            ;;
        other)
            URL="${ZIP_DIR}/${ZIPFILE}"
            wget "${URL}"
            unzip -o "${ZIPFILE}" > /dev/null
            rm "${ZIPFILE}"
            ;;
        *)  echo "Unknown source: $SOURCE"
            exit 1
            ;;  
    esac 

    

    find "${INSTALL_DIR}" -name CHOICE.EXE -type f -delete

    TEMP=$($DOSCONF --launchoptions "${LAUNCHER}" "${1}" "${INSTALL_DIR}" --dbfile $DBFILE)
    echo $TEMP
    exit 0
}
function uninstall(){
    $DOSCONF --clearsteamclientid "${1}" --dbfile $DBFILE
}
function getgamedetails(){
    TEMP=$($DOSCONF --getgamedata "${1}" "${IMAGE_PATH}" --dbfile $DBFILE)
    echo $TEMP
    exit 0
}
function getbats(){
    TEMP=$($DOSCONF --getjsonbats "${1}" --dbfile $DBFILE)
    echo $TEMP
}
function savebats(){
    cat | $DOSCONF --updatebats "${1}" --dbfile $DBFILE
}

case $1 in
    init)
        init
        ;;
    getgames)
        getgames "${2}" "${3}" "${4}"
        ;;
    saveconfig)
        saveconfig "${2}" "${3}" "${4}" "${5}"
        ;;
    getconfig)
        getconfig "${2}" "${3}" "${4}" "${5}"
        ;;
    install)
        install "${2}" "${3}" 
        ;;
    uninstall)
        uninstall "${2}" 
        ;;
    getgamedetails)
        getgamedetails "${2}" 
        ;;
    getbats)
        getbats "${2}" 
        ;;
    savebats)
        savebats "${2}" "${3}" "${4}" "${5}"
        ;;
    *)
        echo "Unknown command: $1"
        exit 1
        ;;
esac

```
- init
  gets called when the plugin is loaded, it takes no arguments and returns no values

- getgames
  This is used to retrieve the list of games you wish to display, it takes 3 arguments
  - Filter: a search string to filter by
  - IsInstalled: [true, false] filer if the games are installed
  - LimitResults: [true, false] limits the number of results returned - too many can slow things down.

```js
 {
    'ID': "",
    'Name': "",
    'Images': ["",""],
    'ShortName': "",
    'SteamClientID': ""
  }
```
- getgamedetails
  This gets the game's meta data in json format from stdio. It takes one argument
  - shortname: this is a unique identifier for the game as a string.
 
```js
{
  'Name': "",
  'Description': "",
  'ApplicationPath': "",
  'ManualPath': "",
  'Publisher': "",
  'RootFolder': "",
  'Source': "",
  'DatabaseID': "",
  'Genre': "",
  'ConfigurationPath': "",
  'Developer': "",
  'ReleaseDate': "",
  'SteamClientID': "",
  'ShortName': "",
  'HasDosConfig': False,
  'HasBatFiles': False,
  'Images':["",""]
}
```    

- install
  this should install the game if needed it takes 2 arguments. This is to track if games are installed in your backend. This returns runer information in json on std in
  - shortname: unique string identifier
  - SteamClientID: the shortcut assigned to steam
  ```js
  {
    'exe': "",
    'options': "",
    'workingdir': ""
  }
  ```
    
- uninstall
   This should ininstall the game if needed, it takes 2 arguments. This is to clear the steam id
  - shortname: unique string identifier
  - SteamClientID: the shortcut assigned to steam
  
- getconfig
  This one is rather complex currenly it only uses some of the arguments but there are plans for the rest in the future. This gives a dosbox.conf (ini file) in json format on stdout.
  This should start with the json config for the specific version of Dosbox you're using: see staging_conf.json for an example. This will popluate the editor with all the options available to the user and help text.
  This takes 4 arguments
  - shortname: unique identifier string
  - platform: hardcoded to "linux" at the moment
  - forkname: hard coded to empty string at the moment
  - version: hard coded to empty string at the moment
    
-saveconfig
  This takes the same json on stdin and should be saved appropirately.
  This takes the same arugments as getconfig.
  
- getbats
  This is a list of bat files that should be written to the working dir before the game is launched. It only takes one agument, shortname. it returns json on stdin.
  ```js
  {
    'id': id,
    'gameId': gameId,
    'Path': path,
    'Content': content
  }
  ```
  
- savebats
  Same arguments as getbats, reads json from stdin. Same format as getbats

run_dosbox.sh shortname

This generates the dosbox.conf file from a database and runs dosbox staging, in the future it will be able to run any installed and configured version of dosbox that is associated with shortname

```bash
#!/bin/bash
PLATFORM=Dos
source "${HOME}/bin/settings.sh"
run_dosbox $@
```
## Developers

Eben Bruyns
Beebls
