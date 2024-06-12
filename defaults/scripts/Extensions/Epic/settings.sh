#!/bin/bash
EPICCONF="${DECKY_PLUGIN_DIR}/scripts/epic-config.py"
export LEGENDARY="/bin/flatpak run com.github.derrod.legendary"
PROTON_TRICKS="/bin/flatpak run com.github.Matoking.protontricks"
# the launcher script to use in steam
export PYTHONPATH="${DECKY_PLUGIN_DIR}/scripts/":"${DECKY_PLUGIN_DIR}/scripts/shared/":$PYTHONPATH

export LAUNCHER="${DECKY_PLUGIN_DIR}/scripts/${Extensions}/Epic/epic-launcher.sh"
export ARGS_SCRIPT="${DECKY_PLUGIN_DIR}/scripts/${Extensions}/Epic/get-epic-args.sh"
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
    NVME=$(lsblk --list | grep nvme0n1\ |awk '{ print $2}' |  awk '{split($0, a,":"); print a[1]}')
    LINK=$(find /run/media -maxdepth 1  -type l )
    LINK_TARGET=$(readlink -f "${LINK}")
    MOUNT_POINT=$(lsblk --list --exclude "${NVME}" | grep part | cut -d \  -f 11-)
    if [[ "${MOUNT_POINT}" == "${LINK_TARGET}" ]]; then
        INSTALL_DIR="${LINK}/Games/epic/"
    else    
        INSTALL_DIR="/run/media/mmcblk0p1/Games/epic/"
    fi
else
    INSTALL_DIR="${HOME}/Games/"
fi


if [[ -f "${DECKY_PLUGIN_RUNTIME_DIR}/epic_overrides.sh" ]]; then
   source "${DECKY_PLUGIN_RUNTIME_DIR}/epic_overrides.sh"
fi





