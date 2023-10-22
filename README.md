# Junk Store plugin [![Chat](https://img.shields.io/badge/chat-on%20discord-7289da.svg)](https://deckbrew.xyz/discord)


[See it in action here!](https://www.youtube.com/watch?v=muzlQCEjuYo)

This is a very simple plugin that builds it's content from a set of scripts.

Place scripts.json in ~/homebrew/data/junk-store/

```js
{
  "init_script": "~/bin/plugin_init.sh",
  "content_dir": "~/Games/DOS-Games/",
  "scripts": [
    {
      "TabName": "Dosbox",
      "get_game_details": "~/bin/get_game_details.sh",
      "save_config": "~/bin/save_config.sh",
      "get_config": "~/bin/get_config.sh",
      "install_game": "~/bin/install_game.sh",
      "get_game_data": "~/bin/get_game_data.sh",
      "plugin_init": "~/bin/plugin_init.sh"
    }
  ]
}

```

The reference scripts uses a python application to do all the heavy lifting, it uses [minicoda]
(https://docs.conda.io/projects/miniconda/en/latest/) suffice to say that if you're going to follow
a similar path you need to install it

The scripts are rather simple in the reference inplementation their content follows.

script_settings.sh

```bash
#!/bin/bash
$HOME/miniconda3/bin/conda init bash > /dev/null
export SERVER=http://192.168.8.100:9000
export DOSCONF=$HOME/bin/dosbox-conf.py
export DBFILE=$HOME/configs.db
```

get_game_data.sh filter="search string" only-installed="true" showall="true" (used to limit results for efficiency)

```bash
#/bin/bash
source $HOME/bin/script_settings.sh
TEMP=$($DOSCONF --getgameswithimages "${SERVER}/Images/MS-DOS/" "${1}" "${2}" "${3}" --dbfile $DBFILE)

echo $TEMP
```

get_game_details.sh "shortname"

```bash
#/bin/bash
source $HOME/bin/script_settings.sh
TEMP=$($DOSCONF --getgamedata "${1}" "${SERVER}/Images/MS-DOS/" --dbfile $DBFILE)

echo $TEMP
```

install_game.sh shortname steamclientid

This installs the game, in this example the zipfile is downloaded from a local web server that contains all the content. You could easily change it to a local path and skip the wget if you have the content.

```bash
#!/bin/bash
source $HOME/bin/script_settings.sh

$DOSCONF --addsteamclientid "${1}" "${2}" --dbfile $DBFILE

ZIPFILE=$($DOSCONF --getzip "${1}" --dbfile $DBFILE)

mkdir -p $HOME/Games/sdos/
cd $HOME/Games/sdos/
URL="${SERVER}/eXo/eXoDOS/${ZIPFILE}"
wget "${URL}"
unzip -o "${ZIPFILE}" > /dev/null

TEMP=$($DOSCONF --launchoptions "/home/deck/bin/run_dosbox.sh" "${1}" "${HOME}/Games/sdos" --dbfile $DBFILE)
echo $TEMP
```

plugin_init.sh

Not used in the reference implemenation, but if the files are local you could serve them up using the built in web server by symlinking like this.

```bash
#!/bin/bash
chmod 755 "${DECKY_PLUGIN_DIR}/dist/assets"
ln -s "${HOME}/Games/DOS-games" "${DECKY_PLUGIN_DIR}/dist/assets/dos"
```

run_dosbox.sh shortname

This generates the dosbox.conf file from a database and runs dosbox staging, in the future it will be able to run any installed and configured version of dosbox that is associated with shortname

```bash
#!/bin/bash
source $HOME/bin/script_settings.sh

$DOSCONF --conf $1 --dbfile $DBFILE
/bin/flatpak run io.github.dosbox-staging
```

save_config.sh shortname platform forkname version

This saves the configuration from the config editor for a shortname, platform, fork and version

```bash
#!/bin/bash
# Save the current configuration to a file
source $HOME/bin/script_settings.sh

cat | $DOSCONF --parsejson "${1}" --dbfile $DBFILE --platform "${2}" --forkname "${3}" --version "${4}"
```

get_config.sh shortname platform forkname version

gets the json for a given fork/version of dosbox and poluates the games configs into it for the editor.

```bash
#!/bin/bash
# Save the current configuration to a file
source $HOME/bin/script_settings.sh

cat | $DOSCONF --parsejson "${1}" --dbfile $DBFILE --platform "${2}" --forkname "${3}" --version "${4}"

```

## Developers

Eben Bruyns
Beebls
