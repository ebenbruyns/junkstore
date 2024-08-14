#!/usr/bin/env bash
PLATFORM=Epic
export DECKY_PLUGIN_RUNTIME_DIR="${HOME}/homebrew/data/Junk-Store"
export DECKY_PLUGIN_DIR="${HOME}/homebrew/plugins/Junk-Store"
export DECKY_PLUGIN_LOG_DIR="${HOME}/homebrew/logs/Junk-Store"
export LEGENDARY="/bin/flatpak run com.github.derrod.legendary"

export PYTHONPATH="${DECKY_PLUGIN_DIR}/scripts/":"${DECKY_PLUGIN_DIR}/scripts/shared/":$PYTHONPATH

export WORKING_DIR=$DECKY_PLUGIN_DIR

source "${DECKY_PLUGIN_DIR}/scripts/Extensions/Epic/settings.sh"

ARGS=$($EPICCONF --get-args "${1}" $OFFLINE_MODE --dbfile $DBFILE)
echo $ARGS