#!/bin/bash

# Register actions with the junk-store.sh script
ACTIONS+=("install-overlay" "update-overlay" "remove-overlay" "registry-fix" "update-umu-id")

# Register Epic as a platform with the junk-store.sh script
PLATFORMS+=("Epic")


# only source the settings if the platform is Epic - this is to conflicts with other plugins
if [[ "${PLATFORM}" == "Epic" ]]; then
    source "${DECKY_PLUGIN_DIR}/scripts/${Extensions}/Epic/settings.sh"
fi

function Epic_init() {
    $EPICCONF --list --dbfile $DBFILE $OFFLINE_MODE  &> /dev/null
}

function Epic_refresh() {
    TEMP=$(Epic_init)
    echo "{\"Type\": \"RefreshContent\", \"Content\": {\"Message\": \"Refreshed\"}}"
}
function Epic_getgames(){
    if [ -z "${1}" ]; then
        FILTER=""
    else
        FILTER="${1}"
    fi
    if [ -z "${2}" ]; then
        INSTALLED="false"
    else
        INSTALLED="${2}"
    fi
     if [ -z "${3}" ]; then
        LIMIT="true"
    else
        LIMIT="${3}"
    fi
    IMAGE_PATH=""
    TEMP=$($EPICCONF --getgameswithimages "${IMAGE_PATH}" "${FILTER}" "${INSTALLED}" "${LIMIT}" "true" --dbfile $DBFILE)
    # This might be a bit fragile, but it should work for now.
    # checking if the Game's content is empty, if it is, then we need to refresh the list
    #{"Type": "GameGrid", "Content": {"NeedsLogin": "true", "Games": []}}
    if [[ $TEMP == "{\"Type\": \"GameGrid\", \"Content\": {\"NeedsLogin\": \"true\", \"Games\": []}}" ]]; then
        if [[ $FILETER == "" ]] && [[ $INSTALLED == "false" ]]; then
            TEMP=$(Epic_init)
            TEMP=$($EPICCONF --getgameswithimages "${IMAGE_PATH}" "${FILTER}" "${INSTALLED}" "${LIMIT}" "true" --dbfile $DBFILE)
        fi
        
    fi
    echo $TEMP
}
function Epic_saveplatformconfig(){
    cat | $EPICCONF --parsejson "${1}" --dbfile $DBFILE --platform Proton --fork "" --version "" --dbfile $DBFILE
}
function Epic_getplatformconfig(){
    TEMP=$($EPICCONF --confjson "${1}" --platform Proton --fork "" --version "" --dbfile $DBFILE)
    echo $TEMP
}

function Epic_cancelinstall(){
    PID=$(cat "${DECKY_PLUGIN_LOG_DIR}/${1}.pid")
    PROGRESS_LOG="${DECKY_PLUGIN_LOG_DIR}/${1}.progress"
    killall -w legendary
    grep -m 1 '^\[cli\] INFO: Download size:' $PROGRESS_LOG > "${DECKY_PLUGIN_LOG_DIR}/tmp" && mv "${DECKY_PLUGIN_LOG_DIR}/tmp" $PROGRESS_LOG
    rm "${DECKY_PLUGIN_LOG_DIR}/tmp.pid"
    rm "${DECKY_PLUGIN_LOG_DIR}/${1}.pid"
    echo "{\"Type\": \"Success\", \"Content\": {\"Message\": \"${1} installation Cancelled\"}}"
}

function Epic_download(){
    PROGRESS_LOG="${DECKY_PLUGIN_LOG_DIR}/${1}.progress"
    # attempting to fix path issues if an install failed.
    $LEGENDARY move "${1}" "${INSTALL_DIR}" --skip-move &>> ${DECKY_PLUGIN_LOG_DIR}/debug.log
    GAME_DIR=$($EPICCONF --get-game-dir "${1}" --dbfile $DBFILE)
     
    updategamedetailsaftercmd $1 $LEGENDARY install $1 --skip-sdl --enable-reordering --max-shared-memory 4096 --with-dlcs -y --platform Windows --base-path "${INSTALL_DIR}"  2> $PROGRESS_LOG > "${DECKY_PLUGIN_LOG_DIR}/${1}.output" &
    echo $! > "${DECKY_PLUGIN_LOG_DIR}/${1}.pid"
    echo "{\"Type\": \"Progress\", \"Content\": {\"Message\": \"Downloading\"}}"

}

function Epic_update(){
    PROGRESS_LOG="${DECKY_PLUGIN_LOG_DIR}/${1}.progress"
    updategamedetailsaftercmd $1 $LEGENDARY update  $1 --update -y  >> "${DECKY_PLUGIN_LOG_DIR}/${1}.log" 2>> $PROGRESS_LOG &
    echo $! > "${DECKY_PLUGIN_LOG_DIR}/${1}.pid"
    echo "{\"Type\": \"Progress\", \"Content\": {\"Message\": \"Updating\"}}"

}
function Epic_install-overlay(){
    $LEGENDARY eos-overlay install -y >> "${DECKY_PLUGIN_LOG_DIR}/eos_overlay.log" 
    echo "{\"Type\": \"Success\", \"Content\": {\"Message\": \"EOS Overlay installed\"}}"
}

function Epic_update-overlay(){
    $LEGENDARY eos-overlay udpate -y >> "${DECKY_PLUGIN_LOG_DIR}/eos_overlay.log" 
    echo "{\"Type\": \"Success\", \"Content\": {\"Message\": \"EOS Overlay updated\"}}"
}
function Epic_remove-overlay(){
    $LEGENDARY eos-overlay remove -y >> "${DECKY_PLUGIN_LOG_DIR}/eos_overlay.log" 
    echo "{\"Type\": \"Success\", \"Content\": {\"Message\": \"EOS Overlay installed\"}}"
}



function Epic_download-saves(){
    PROGRESS_LOG="${DECKY_PLUGIN_LOG_DIR}/${1}.progress"
    $LEGENDARY download-saves  $1 -y  >> "${DECKY_PLUGIN_LOG_DIR}/${1}.log" 2>> $PROGRESS_LOG &
    echo $! > "${DECKY_PLUGIN_LOG_DIR}/${1}.pid"
    echo "{\"Type\": \"Progress\", \"Content\": {\"Message\": \"Downloading Saves\"}}"

}
function Epic_verify(){
    PROGRESS_LOG="${DECKY_PLUGIN_LOG_DIR}/${1}.progress"
    $LEGENDARY verify  $1 >> "${DECKY_PLUGIN_LOG_DIR}/${1}.log" 2>> $PROGRESS_LOG &
    echo $! > "${DECKY_PLUGIN_LOG_DIR}/${1}.pid"
    echo "{\"Type\": \"Progress\", \"Content\": {\"Message\": \"Updating\"}}"

}
function Epic_repair(){
    PROGRESS_LOG="${DECKY_PLUGIN_LOG_DIR}/${1}.progress"
    updategamedetailsaftercmd $1 $LEGENDARY repair $1  --repair -y >> "${DECKY_PLUGIN_LOG_DIR}/${1}.log" 2>> $PROGRESS_LOG &
    echo $! > "${DECKY_PLUGIN_LOG_DIR}/${1}.pid"
    echo "{\"Type\": \"Progress\", \"Content\": {\"Message\": \"Updating\"}}"

}
function Epic_repair_and_update(){
    PROGRESS_LOG="${DECKY_PLUGIN_LOG_DIR}/${1}.progress"
    updategamedetailsaftercmd $1 $LEGENDARY repair $1  --repair-and-update -y >> "${DECKY_PLUGIN_LOG_DIR}/${1}.log" 2>> $PROGRESS_LOG &
    echo $! > "${DECKY_PLUGIN_LOG_DIR}/${1}.pid"
    echo "{\"Type\": \"Progress\", \"Content\": {\"Message\": \"Updating\"}}"

}
function Epic_protontricks(){
    get_steam_env
    unset STEAM_RUNTIME_LIBRARY_PATH
    export PROTONTRICKS_GUI=yad
    
    ARGS="--verbose $2 --gui &> \\\"${DECKY_PLUGIN_LOG_DIR}/${1}.log\\\""
    launchoptions "${PROTON_TRICKS}"  "${ARGS}" "${3}" "Protontricks" false ""
}

#this needs more thought
function Epic_import(){
    PROGRESS_LOG="${DECKY_PLUGIN_LOG_DIR}/${1}.progress"
     GAME_DIR=$($EPICCONF --get-game-dir "${1}" --dbfile $DBFILE $OFFLINE_MODE)
    if [ -d "${GAME_DIR}" ]; then
        updategamedetailsaftercmd $1 $LEGENDARY import $1 "${GAME_DIR}" $OFFLINE_MODE >> "${DECKY_PLUGIN_LOG_DIR}/${1}.log" 2>> $PROGRESS_LOG &
        echo $! > "${DECKY_PLUGIN_LOG_DIR}/${1}.pid"
        if [ $? -ne 0 ]; then
            move $1 > /dev/null
        fi
       
    fi  
    echo "{\"Type\": \"Progress\", \"Content\": {\"Message\": \"Updating\"}}"

}
function Epic_move(){
    PROGRESS_LOG="${DECKY_PLUGIN_LOG_DIR}/${1}.progress"
    $LEGENDARY move "${1}" "${INSTALL_DIR}" &>> ${DECKY_PLUGIN_LOG_DIR}/debug.log
    # GAME_DIR=$($EPICCONF --get-game-dir "${1}" --dbfile $DBFILE $OFFLINE_MODE)
    # SKIP_MOVE=""
    # if [ -d "${GAME_DIR}" ]; then
    #     SKIP_MOVE="--skip-move"
    # fi
    # updategamedetailsaftercmd $1 $LEGENDARY move $1 "${GAME_DIR}" $SKIP_MOVE $OFFLINE_MODE >> "${DECKY_PLUGIN_LOG_DIR}/${1}.log" 2>> $PROGRESS_LOG &
    echo $! > "${DECKY_PLUGIN_LOG_DIR}/${1}.pid"
    echo "{\"Type\": \"Success\", \"Content\": {\"Message\": \"${1} moved to ${INSTALL_DIR}\"}}"

}
function Epic_update-umu-id(){
    TEMP=$($EPICCONF --update-umu-id "${1}" egs --dbfile $DBFILE)
    echo "{\"Type\": \"Success\", \"Content\": {\"Message\": \"Umu Id updated\"}}"
}   
function Epic_install(){
    PROGRESS_LOG="${DECKY_PLUGIN_LOG_DIR}/${1}.progress"
    rm $PROGRESS_LOG &>> ${DECKY_PLUGIN_LOG_DIR}/${1}.log
    RESULT=$($EPICCONF --addsteamclientid "${1}" "${2}" --dbfile $DBFILE)
    TEMP=$($EPICCONF --update-umu-id "${1}" egs --dbfile $DBFILE)
    # mkdir -p "${HOME}/.compat/${1}"
    ARGS=$($ARGS_SCRIPT "${1}")
    TEMP=$($EPICCONF --launchoptions "${1}" "${ARGS}" "" --dbfile $DBFILE $OFFLINE_MODE)
    echo $TEMP
    exit 0
}

function Epic_getlaunchoptions(){
    ARGS=$($ARGS_SCRIPT "${1}")
    TEMP=$($EPICCONF --launchoptions "${1}" "${ARGS}" "" --dbfile $DBFILE $OFFLINE_MODE)
    echo $TEMP
    exit 0
}

function Epic_uninstall(){
    updategamedetailsaftercmd $1 $LEGENDARY uninstall $1  -y $OFFLINE_MODE>> "${DECKY_PLUGIN_LOG_DIR}/${1}.log"

    # this should be fixed before used, it might kill the entire machine
    # WORKING_DIR=$($EPICCONF --get-working-dir "${1}")
    # rm -rf "${WORKING_DIR}"
    TEMP=$($EPICCONF --clearsteamclientid "${1}" --dbfile $DBFILE)
    echo $TEMP
    
}
function Epic_getgamedetails(){
    IMAGE_PATH=""
    TEMP=$($EPICCONF --getgamedata "${1}" "${IMAGE_PATH}" --dbfile $DBFILE --forkname "Proton" --version "null" --platform "Windows")
    echo $TEMP
    exit 0
}

function Epic_getgamesize(){
    TEMP=$($EPICCONF --get-game-size "${1}" "${2}"  --dbfile $DBFILE)
    echo $TEMP
}

function Epic_getprogress()
{
    TEMP=$($EPICCONF --getprogress "${DECKY_PLUGIN_LOG_DIR}/${1}.progress" --dbfile $DBFILE)
    echo $TEMP
}
function Epic_loginstatus(){
    if [[ -z $1 ]]; then
        FLUSH_CACHE=""
    else 
        FLUSH_CACHE="--flush-cache"
    fi
    TEMP=$($EPICCONF --getloginstatus --dbfile $DBFILE --dbfile $DBFILE $OFFLINE_MODE  $FLUSH_CACHE)
    echo $TEMP

}

function Epic_enable-eos-overlay(){
    APP_ID=$2
    $LEGENDARY eos-overlay enable --prefix "~/.local/share/Steam/steamapps/compatdata/${APP_ID}/pfx"
    echo "{\"Type\": \"Overlay\", \"Content\": {\"Message\": \"Enabled\"}}"
}

function Epic_disable-eos-overlay(){
    APP_ID=$2
    $LEGENDARY eos-overlay disable --prefix "~/.local/share/Steam/steamapps/compatdata/${APP_ID}/pfx"
    echo "{\"Type\": \"Overlay\", \"Content\": {\"Message\": \"Enabled\"}}"
}

function Epic_run-exe(){
    get_steam_env  
    SETTINGS=$($EPICCONF --get-env-settings $ID --dbfile $DBFILE)
    eval "${SETTINGS}"
    STEAM_ID="${1}"
    GAME_SHORTNAME="${2}"
    GAME_EXE="${3}"
    ARGS="${4}"
    if [[ $4 == true ]]; then
        ARGS="some value"
    else
        ARGS=""
    fi
    COMPAT_TOOL="${5}"
    GAME_PATH=$($EPICCONF --get-game-dir $GAME_SHORTNAME --dbfile $DBFILE --offline)
    launchoptions "\\\"${GAME_PATH}/${GAME_EXE}\\\""  "${ARGS}  &> ${DECKY_PLUGIN_LOG_DIR}/run-exe.log" "${GAME_PATH}" "Run exe" true "${COMPAT_TOOL}"
}
function Epic_get-exe-list(){
    get_steam_env
    STEAM_ID="${1}"
    GAME_SHORTNAME="${2}"
    GAME_PATH=$($EPICCONF --get-game-dir $GAME_SHORTNAME --dbfile $DBFILE --offline)
    export STEAM_COMPAT_DATA_PATH="${HOME}/.local/share/Steam/steamapps/compatdata/${STEAM_ID}"
    export STEAM_COMPAT_CLIENT_INSTALL_PATH="${GAME_PATH}"
    cd "${STEAM_COMPAT_CLIENT_INSTALL_PATH}"
    IFS=$'\n' 
    LIST=$(find . \( -name "*.exe" -o -iname "*.bat" -o -iname "*.msi" \))
    JSON="{\"Type\": \"FileContent\", \"Content\": {\"Files\": ["
   
    for FILE in $LIST; do
       JSON="${JSON}{\"Path\": \"${FILE}\"},"
    done
    JSON=$(echo "$JSON" | sed 's/,$//')
    JSON="${JSON}]}}"
    echo $JSON
}
function Epic_registry-fix(){
    # reg add HKEY_CLASSES_ROOT\\com.epicgames.launcher /f
      STEAM_ID="${2}"
    GAME_SHORTNAME="${1}"
    GAME_PATH="${3}"
    COMPAT_TOOL="${4}"
    launchoptions "reg"  "add HKEY_CLASSES_ROOT\\\\\\\\com.epicgames.launcher /f" "${GAME_PATH}" "Registry Fix" true "${COMPAT_TOOL}"

}
function launchoptions () {
    Exe=$1 
    Options=$2 
    WorkingDir=$3 
    Name=$4 
    Compatibility=$5
    CompatTooName=$6
    JSON="{\"Type\": \"RunExe\", \"Content\": {
        \"Exe\": \"${Exe}\",
        \"Options\": \"${Options}\",
        \"WorkingDir\": \"${WorkingDir}\",
        \"Name\": \"${Name}\",
        \"Compatibility\": \"${Compatibility}\",
        \"CompatToolName\": \"${CompatTooName}\"
    }}"
    echo $JSON
}
function Epic_login(){
    get_steam_env
    launchoptions "${DECKY_PLUGIN_DIR}/scripts/Extensions/Epic/login.sh" "" "${DECKY_PLUGIN_LOG_DIR}" "Epic Games Login" 
}
function loginlaunchoptions () {
    Exe=$1 
    Options=$2 
    WorkingDir=$3 
    Name=$4 
    Compatibility=$5
    CompatTooName=$6
    JSON="{\"Type\": \"LaunchOptions\", \"Content\": {
        \"Exe\": \"${Exe}\",
        \"Options\": \"${Options}\",
        \"WorkingDir\": \"${WorkingDir}\",
        \"Name\": \"${Name}\",
        \"Compatibility\": \"${Compatibility}\",
        \"CompatToolName\": \"${CompatTooName}\"
    }}"
    echo $JSON
}
function Epic_login-launch-options(){
    get_steam_env
    loginlaunchoptions  "${DECKY_PLUGIN_DIR}/scripts/Extensions/Epic/login.sh" "" "${DECKY_PLUGIN_LOG_DIR}" "Epic Games Login" 
}


function Epic_logout(){
    TEMP=$($LEGENDARY auth --delete)
    Epic_loginstatus --flush-cache
}

function Epic_getsetting(){
    TEMP=$($EPICCONF --getsetting $1 --dbfile $DBFILE)
    echo $TEMP
}
function Epic_savesetting(){
    $EPICCONF --savesetting $1 $2 --dbfile $DBFILE
}   
function Epic_getjsonimages(){
    
    TEMP=$($EPICCONF --get-base64-images "${1}" --dbfile $DBFILE --offline)
    echo $TEMP
}
function Epic_gettabconfig(){
# Check if conf_schemas directory exists, create it if not
    if [[ ! -d "${DECKY_PLUGIN_RUNTIME_DIR}/conf_schemas" ]]; then
        mkdir -p "${DECKY_PLUGIN_RUNTIME_DIR}/conf_schemas"
    fi
    if [[ -f "${DECKY_PLUGIN_RUNTIME_DIR}/conf_schemas/epictabconfig.json" ]]; then
        TEMP=$(cat "${DECKY_PLUGIN_RUNTIME_DIR}/conf_schemas/epictabconfig.json")
    else
        TEMP=$(cat "${DECKY_PLUGIN_DIR}/conf_schemas/epictabconfig.json")
    fi
    echo "{\"Type\":\"IniContent\", \"Content\": ${TEMP}}"
}
function Epic_savetabconfig(){
    
    cat > "${DECKY_PLUGIN_RUNTIME_DIR}/conf_schemas/epictabconfig.json"
    echo "{\"Type\": \"Success\", \"Content\": {\"Message\": \"Epic tab config saved\"}}"
    
}

function updategamedetailsaftercmd() {
    game=$1
    shift
    "$@"
    $EPICCONF --update-game-details $game --dbfile $DBFILE &> /dev/null
}