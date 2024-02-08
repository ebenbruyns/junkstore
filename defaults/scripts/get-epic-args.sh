#!/bin/bash
PLATFORM=Epic
source "${HOME}/homebrew/plugins/Junk-Store/scripts/settings.sh"

$EPICCONF --get-args "${1}" $OFFLINE_MODE --dbfile $DBFILE
echo $ARGS