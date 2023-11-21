#!/bin/bash
PLATFORM=Epic
source "${HOME}/homebrew/plugins/Junk-Store/scripts/settings.sh"
$EPICCONF --get-args "${1}"
echo $ARGS