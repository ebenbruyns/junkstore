#!/bin/bash
# These need to be exported because it does not get executed in the context of the plugin.
export DECKY_PLUGIN_RUNTIME_DIR="${HOME}/homebrew/data/Junk-Store"
export DECKY_PLUGIN_DIR="${HOME}/homebrew/plugins/Junk-Store"
export DECKY_PLUGIN_LOG_DIR="${HOME}/homebrew/logs/Junk-Store"
export WORKING_DIR=$DECKY_PLUGIN_DIR
export Extensions="Extensions"
echo -e $@
echo $#
ID=$1
echo $1
shift

source "${DECKY_PLUGIN_DIR}/scripts/Extensions/Epic/settings.sh"

echo "dbfile: ${DBFILE}"
SETTINGS=$($EPICCONF --get-env-settings $ID --dbfile $DBFILE --platform Proton --fork "" --version "" --dbfile $DBFILE)
echo "${SETTINGS}"
eval "${SETTINGS}"


if [[ "${RUNTIMES_ESYNC}" == "true" ]]; then
    export PROTON_NO_ESYNC=1
else
    export PROTON_NO_ESYNC=0
fi
if [[ "${RUNTIMES_FSYNC}" == "true" ]]; then
    export PROTON_NO_FSYNC=1
else
    export PROTON_NO_FSYNC=0
fi
if [[ "${RUNTIMES_VKD3D}" == "true" ]]; then
    export PROTON_USE_WINED3D=1
else
    export PROTON_USE_WINED3D=0
fi
if [[ "${RUNTIMES_VKD3D_PROTON}" == "true" ]]; then
    export PROTON_USE_WINED3D=0
    export PROTON_USE_WINED3D11=1
else
    export PROTON_USE_WINED3D11=0
fi
if [[ "RUNTIMES_FSR" == "true" ]]; then
    export WINE_FULLSCREEN_FSR=1
else
    export WINE_FULLSCREEN_FSR=0
fi
if [ -z "${RUNTIMES_FSR_STRENGTH}" ]; then
    unset WINE_FULLSCREEN_FSR_STRENGTH
else
    export WINE_FULLSCREEN_FSR_STRENGTH=${RUNTIMES_FSR_STRENGTH}
fi
if [ -z "${RUNTIMES_LIMIT_FRAMERATE}" ]; then
    unset DXVK_FRAME_RATE
else
    export DXVK_FRAME_RATE=${RUNTIMES_FRAME_RATE}
fi
if [[ "${RUNTIMES_EASYANTICHEAT}" == "true" ]]; then
    echo "enabling easy anti cheat"
    export PROTON_EAC_RUNTIME="${HOME}/.steam/root/steamapps/common/Proton EasyAntiCheat Runtime/"
fi
if [[ "${RUNTIMES_BATTLEYE}" == "true"  ]]; then
    export PROTON_BATTLEYE_RUNTIME="${HOME}/.steam/root/steamapps/common/Proton BattlEye Runtime/"
fi

if [ -z "${RUNTIMES_PULSE_LATENCY_MSEC}" ]; then
    export PULSE_LATENCY_MSEC=$RUNTIMES_PULSE_LATENCY_MSEC

fi
if [[ "${RUNTIMES_RADV_PERFTEST}" == "" ]]; then
    unset RADV_PERFTEST
else
    export RADV_PERFTEST=$RUNTIMES_RADV_PERFTEST
 fi


function sync-saves {
    if [[ "${OFFLINE_MODE}" == "" ]]; then
        $LEGENDARY sync-saves $ID -y
    fi
}

sync-saves

#re quote all arguments as they get stripped of quotes

QUOTED_ARGS=""
for arg in "$@"; do
    QUOTED_ARGS+=" \"${arg}\"" 
done

eval "`echo -e $QUOTED_ARGS`"  &> "${DECKY_PLUGIN_LOG_DIR}/${ID}.log"

sync-saves



 