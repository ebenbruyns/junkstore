#!/bin/bash
DOSCONF="${DECKY_PLUGIN_DIR}/scripts/dosbox-conf.py"
EPICCONF="${DECKY_PLUGIN_DIR}/scripts/epic-config.py"
export LEGENDARY="/bin/flatpak run com.github.derrod.legendary"
PROTON_TRICKS="/bin/flatpak run com.github.Matoking.protontricks"
# the launcher script to use in steam
export LAUNCHER="${DECKY_PLUGIN_DIR}/scripts/${Extensions}/Epic/epic-launcher.sh"
ARGS_SCRIPT="${DECKY_PLUGIN_DIR}/scripts/${Extensions}/Epic/get-epic-args.sh"
DBNAME="epic.db"
# database to use for configs and metadata
DBFILE="${DECKY_PLUGIN_RUNTIME_DIR}/epic.db"

if [[ -f "${DECKY_PLUGIN_RUNTIME_DIR}/conf_schemas/epictabconfig.json" ]]; then
    TEMP="${DECKY_PLUGIN_RUNTIME_DIR}/conf_schemas/epictabconfig.json"
else
    TEMP="${DECKY_PLUGIN_DIR}/conf_schemas/epictabconfig.json"
fi
SETTINGS=$($EPICCONF --generate-env-settings-json $TEMP --dbfile $DBFILE)
eval "${SETTINGS}"


if [[ "${EPIC_OFFLINEMODE}" == "true" ]]; then
    OFFLINE_MODE="--offline"
else
    OFFLINE_MODE=""
fi
if [[ "${EPIC_INSTALLLOCATION}" == "SSD" ]]; then
    INSTALL_DIR="${HOME}/Games/epic/"
elif [[ "${EPIC_INSTALLLOCATION}" == "MicroSD" ]]; then
    INSTALL_DIR="/run/media/mmcblk0p1/Games/epic/"
else
    INSTALL_DIR="${HOME}/Games/"
fi







