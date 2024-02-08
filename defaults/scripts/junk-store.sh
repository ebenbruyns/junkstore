#!/bin/bash
source "./scripts/settings.sh"


function init() {
    $EPICCONF --list --dbfile $DBFILE $OFFLINE_MODE > /dev/null
}
function getgames(){
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
    TEMP=$($DOSCONF --getgameswithimages "${IMAGE_PATH}" "${FILTER}" "${INSTALLED}" "${LIMIT}" "true" --dbfile $DBFILE)
   
    echo $TEMP
}
function saveconfig(){
    cat | $DOSCONF --parsejson "${1}" --dbfile $DBFILE --platform Windows --fork Proton --version null
}
function getconfig(){
    TEMP=$($DOSCONF --confjson "${1}" --platform Windows --fork Proton --version null --dbfile $DBFILE)
    echo $TEMP
}

function cancelinstall(){
    PID=$(cat "${DECKY_PLUGIN_LOG_DIR}/${1}.pid")
    killall -w legendary
    rm "${DECKY_PLUGIN_LOG_DIR}/tmp.pid"
    rm "${DECKY_PLUGIN_LOG_DIR}/${1}.pid"
    echo "{\"Type\": \"Success\", \"Content\": {\"Message\": \"Cancelled\"}}"
}

function download(){
    PROGRESS_LOG="${DECKY_PLUGIN_LOG_DIR}/${1}.progress"
    GAME_DIR=$($EPICCONF --get-game-dir "${1}" --dbfile $DBFILE)
   
    $LEGENDARY install $1 --with-dlcs -y --platform Windows --base-path "${INSTALL_DIR}" >> "${DECKY_PLUGIN_LOG_DIR}/${1}.log" 2>> $PROGRESS_LOG &

    echo $! > "${DECKY_PLUGIN_LOG_DIR}/${1}.pid"
    echo "{\"Type\": \"Progress\", \"Content\": {\"Message\": \"Downloading\"}}"

}
function update(){
    PROGRESS_LOG="${DECKY_PLUGIN_LOG_DIR}/${1}.progress"
    $LEGENDARY update  $1 --update -y  >> "${DECKY_PLUGIN_LOG_DIR}/${1}.log" 2>> $PROGRESS_LOG &
    echo $! > "${DECKY_PLUGIN_LOG_DIR}/${1}.pid"
    echo "{\"Type\": \"Progress\", \"Content\": {\"Message\": \"Updating\"}}"

}
function verify(){
    PROGRESS_LOG="${DECKY_PLUGIN_LOG_DIR}/${1}.progress"
    $LEGENDARY verify  $1 >> "${DECKY_PLUGIN_LOG_DIR}/${1}.log" 2>> $PROGRESS_LOG &
    echo $! > "${DECKY_PLUGIN_LOG_DIR}/${1}.pid"
    echo "{\"Type\": \"Progress\", \"Content\": {\"Message\": \"Updating\"}}"

}
function repair(){
    PROGRESS_LOG="${DECKY_PLUGIN_LOG_DIR}/${1}.progress"
    $LEGENDARY repair $1  --repair-and-update -y >> "${DECKY_PLUGIN_LOG_DIR}/${1}.log" 2>> $PROGRESS_LOG &
    echo $! > "${DECKY_PLUGIN_LOG_DIR}/${1}.pid"
    echo "{\"Type\": \"Progress\", \"Content\": {\"Message\": \"Updating\"}}"

}

function protontricks(){
    get_steam_env
    unset STEAM_RUNTIME_LIBRARY_PATH
    export PROTONTRICKS_GUI=yad
    
    ARGS="--verbose $2 --gui &> \\\"${DECKY_PLUGIN_LOG_DIR}/${1}.log\\\""
    launchoptions "${PROTON_TRICKS}"  "${ARGS}" "${3}" "Protontricks" false ""
    
  
   
    #echo "{\"Type\": \"Exe\", \"Content\": {\"Message\": \"running\"}}"

}

#this needs more thought
function import(){
    PROGRESS_LOG="${DECKY_PLUGIN_LOG_DIR}/${1}.progress"
     GAME_DIR=$($EPICCONF --get-game-dir "${1}" --dbfile $DBFILE $OFFLINE_MODE)
    if [ -d "${GAME_DIR}" ]; then
        $LEGENDARY import $1 "${GAME_DIR}" $OFFLINE_MODE >> "${DECKY_PLUGIN_LOG_DIR}/${1}.log" 2>> $PROGRESS_LOG &
        echo $! > "${DECKY_PLUGIN_LOG_DIR}/${1}.pid"
        if [ $? -ne 0 ]; then
            move $1 > /dev/null
        fi
       
    fi  
    echo "{\"Type\": \"Progress\", \"Content\": {\"Message\": \"Updating\"}}"

}
function move(){
    PROGRESS_LOG="${DECKY_PLUGIN_LOG_DIR}/${1}.progress"
    GAME_DIR=$($EPICCONF --get-game-dir "${1}" --dbfile $DBFILE $OFFLINE_MODE)
    SKIP_MOVE=""
    if [ -d "${GAME_DIR}" ]; then
        SKIP_MOVE="--skip-move"
    fi
    $LEGENDARY move $1 "${GAME_DIR}" $SKIP_MOVE $OFFLINE_MODE >> "${DECKY_PLUGIN_LOG_DIR}/${1}.log" 2>> $PROGRESS_LOG &
    echo $! > "${DECKY_PLUGIN_LOG_DIR}/${1}.pid"
    echo "{\"Type\": \"Progress\", \"Content\": {\"Message\": \"Updating\"}}"

}

function install(){
    PROGRESS_LOG="${DECKY_PLUGIN_LOG_DIR}/${1}.progress"
    rm $PROGRESS_LOG

    RESULT=$($DOSCONF --addsteamclientid "${1}" "${2}" --dbfile $DBFILE)
    #WORKING_DIR=$($EPICCONF --get-working-dir "${1}")
    mkdir -p "${HOME}/.compat/${1}"
    ARGS=$($ARGS_SCRIPT "${1}")
    TEMP=$($EPICCONF --launchoptions "${1}" "${ARGS}" "" --dbfile $DBFILE $OFFLINE_MODE)
    echo $TEMP
    exit 0
}

function getlaunchoptions(){
    ARGS=$($ARGS_SCRIPT "${1}")
    TEMP=$($EPICCONF --launchoptions "${1}" "${ARGS}" "" --dbfile $DBFILE $OFFLINE_MODE)
    echo $TEMP
    exit 0
}

function uninstall(){
    $LEGENDARY uninstall $1  -y $OFFLINE_MODE>> "${DECKY_PLUGIN_LOG_DIR}/${1}.log"

    # this should be fixed before used, it might kill the entire machine
    # WORKING_DIR=$($EPICCONF --get-working-dir "${1}")
    # rm -rf "${WORKING_DIR}"
    TEMP=$($DOSCONF --clearsteamclientid "${1}" --dbfile $DBFILE)
    echo $TEMP
    
}
function getgamedetails(){
    IMAGE_PATH=""
    TEMP=$($DOSCONF --getgamedata "${1}" "${IMAGE_PATH}" --dbfile $DBFILE)
    echo $TEMP
    exit 0
}
function getbats(){
    TEMP=$($DOSCONF --getjsonbats "${1}" --dbfile $DBFILE --dbfile $DBFILE)
    echo $TEMP
}
function savebats(){
    cat | $DOSCONF --updatebats "${1}" --dbfile $DBFILE
}
function getprogress()
{
    TEMP=$($EPICCONF --getprogress "${DECKY_PLUGIN_LOG_DIR}/${1}.progress" --dbfile $DBFILE)
    echo $TEMP
}
function loginstatus(){
    TEMP=$($EPICCONF --getloginstatus --dbfile $DBFILE --dbfile $DBFILE $OFFLINE_MODE)
    echo $TEMP

}
# function get_steam_env(){

#     ENV_LIST=("STEAM_COMPAT_CLIENT_INSTALL_PATH" "STEAM_COMPAT_DATA_PATH" "WAYLAND_DISPLAY" "XDG_CONFIG_DIRS" "XDG_SESSION_PATH" "KDE_FULL_SESSION" "WAYLAND_DISPLAY" "XDG_SESSION_TYPE" "XDG_RUNTIME_DIR" "XAUTHORITY" "DISPLAY" )
#     PID=$(cat ~/.steampid)
#     E="/proc/${PID}/environ"
#     STEAM_ENV=$(cat $E | tr '\0' '\n')
#     echo $STEAM_ENV
#     echo $ENV_LIST
#     for ENV in "${ENV_LIST[@]}";
#     do
#         echo $ENV

function export_env_variables() {
    for LINE in $STEAM_ENV; do
        export $LINE
    done

    
    # for ENV in "${ENV_LIST[@]}"; do
    #     export $(echo "$STEAM_ENV" | grep -m1 "^${ENV}.*")
    # done
}

function get_steam_env() {
    # limiting the list at the moment, but it might be required to use all the env vars in steam, TBD
    ENV_LIST=(
    "XDG_RUNTIME_DIR" 
    "XAUTHORITY" 
    "WAYLAND_DISPLAY"
    "DISPLAY"
    "XDG_SESSION_ID"
    "PATH"
    "DBUS_SESSION_BUS_ADDRESS"
    )
    PID=$(cat ~/.steampid)
    E="/proc/${PID}/environ"
    STEAM_ENV=$(cat $E | tr '\0' '\n')
    export_env_variables
    #export PATH=$SYSTEM_PATH:$PATH
    #export LD_LIBRARY_PATH=/lib64:/lib:/usr/lib64:/usr/lib:$LD_LIBRARY_PATH

 #export PATH=$SYSTEM_PATH:$PATH
    #export PATH=/usr/local/bin:/usr/bin
    #export SteamClientLaunch=1
    #export SRT_LAUNCHER_SERVICE_ALONGSIDE_STEAM=com.steampowered.PressureVessel.LaunchAlongsideSteam
    #export STEAM_ALLOW_DRIVE_UNMOUNT=1
    #export SteamEnv=1
    #export SteamOS=1
    #export SteamOverlayGameId=18358359509421785088
    #export ENABLE_VK_LAYER_VALVE_steam_overlay_1=1
    #export Steam3Master=127.0.0.1:57343
  # export STEAM_MANGOAPP_HORIZONTAL_SUPPORTED=1
   #export SteamVirtualGamepadInfo=/home/deck/.local/share/Steam/config/virtualgamepadinfo.txt
   #export DISABLE_LAYER_AMD_SWITCHABLE_GRAPHICS_1=1
   #export SteamGameId=18358359509421785088
   #export FOSSILIZE_APPLICATION_INFO_FILTER_PATH=/home/deck/.local/share/Steam/fossilize_engine_filters.json
   #export SDL_GAMECONTROLLER_ALLOW_STEAM_VIRTUAL_GAMEPAD=1
   #export EnableConfiguratorSupport=15
   #export SHLVL=3
   #export SteamGamepadUI=1
   #export SDL_JOYSTICK_HIDAPI_STEAMXBOX=0
   #export LC_ALL=C

#    export SteamUser=ebenbruyns
#    export SteamAppUser=ebenbruyns
   #export SteamAppId=0
#    export ENABLE_VK_LAYER_VALVE_steam_fossilize_1=1
#    export SDL_GAMECONTROLLER_USE_BUTTON_LABELS=1
#    export SteamTenfoot=1
#    export BREAKPAD_DUMP_LOCATION=/tmp/dumps
   #   export LD_PRELOAD=:/home/deck/.local/share/Steam/ubuntu12_32/gameoverlayrenderer.so:/home/deck/.local/share/Steam/ubuntu12_64/gameoverlayrenderer.so
    
    if [[ "${XDG_CURRENT_DESKTOP}" == "gamescope" ]]; then
        export DISPLAY=:1
        export LD_LIBRARY_PATH=/lib64:/lib:/usr/lib64:/usr/lib:$LD_LIBRARY_PATH
        export LD_PRELOAD=
    else
        export LD_LIBRARY_PATH=/lib64:/lib:/usr/lib64:/usr/lib:$LD_LIBRARY_PATH
        export LD_PRELOAD=
        export DISPlAY=:0
    fi
    

}

function run-exe(){
    get_steam_env  
    SETTINGS=$($EPICCONF --get-env-settings $ID --dbfile $DBFILE)
    echo "${SETTINGS}"
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
    #GAME_PATH=$($EPICCONF --get-working-dir $GAME_SHORTNAME --dbfile $DBFILE --offline)
    GAME_PATH=$($EPICCONF --get-game-dir $GAME_SHORTNAME --dbfile $DBFILE --offline)
    # export STEAM_COMPAT_DATA_PATH="${HOME}/.local/share/Steam/steamapps/compatdata/${STEAM_ID}"
    # export STEAM_COMPAT_CLIENT_INSTALL_PATH="${GAME_PATH}"
    # #cd $STEAM_COMPAT_CLIENT_INSTALL_PATH
    # CMD="${HOME}/.local/share/Steam/ubuntu12_32/reaper SteamLaunch AppId=${STEAM_ID} -- ${HOME}/.local/share/Steam/ubuntu12_32/steam-launch-wrapper -- '${HOME}/.local/share/Steam/steamapps/common/SteamLinuxRuntime_sniper'/_v2-entry-point --verb=waitforexitandrun -- '${HOME}/.local/share/Steam/compatibilitytools.d/${COMPAT_TOOL}'/proton waitforexitandrun  \"${GAME_PATH}/${GAME_EXE}\"" 
    # eval "${CMD} ${ARGS}" &> ${DECKY_PLUGIN_LOG_DIR}/run-exe.log
    # echo "{\"Type\": \"Success\", \"Content\": {\"Message\": \"Ran ${GAME_EXE}\"}}"
    launchoptions "\\\"${GAME_PATH}/${GAME_EXE}\\\""  "${ARGS}  &> ${DECKY_PLUGIN_LOG_DIR}/run-exe.log" "${3}" "Protontricks" true "${COMPAT_TOOL}"
}
function get-exe-list(){
    get_steam_env
    STEAM_ID="${1}"
    GAME_SHORTNAME="${2}"
    GAME_PATH=$($EPICCONF --get-game-dir $GAME_SHORTNAME --dbfile $DBFILE --offline)
    export STEAM_COMPAT_DATA_PATH="${HOME}/.local/share/Steam/steamapps/compatdata/${STEAM_ID}"
    export STEAM_COMPAT_CLIENT_INSTALL_PATH="${GAME_PATH}"
    cd $STEAM_COMPAT_CLIENT_INSTALL_PATH
    LIST=$(find . -name "*.exe")
    #result.append({'Id': id, 'GameId': gameId,
    #                   'Path': path, 'Content': content})
    # return json.dumps({'Type': 'FileContent', 'Content': {'Files': result}})
    JSON="{\"Type\": \"FileContent\", \"Content\": {\"Files\": ["
    for FILE in $LIST; do
        
        JSON="${JSON}{\"Path\": \"${FILE}\"},"
    done
    JSON=$(echo "$JSON" | sed 's/,$//')
    JSON="${JSON}]}}"
    echo $JSON
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
function login(){
    get_steam_env
    #$HOME/.local/share/Steam/ubuntu12_32/reaper SteamLaunch AppId=$APP_ID -- $HOME/.local/share/Steam/ubuntu12_32/steam-launch-wrapper -- /usr/bin/flatpak run com.github.derrod.legendary auth  &> "${DECKY_PLUGIN_LOG_DIR}/login.log"
    #$LEGENDARY auth >> "${DECKY_PLUGIN_LOG_DIR}/login.log" 2>&1

    #TEMP=$($LEGENDARY auth)
    # TEMP=$($DOSCONF --launchoptions "/bin/flatpak" "run com.github.derrod.legendary auth" "" "Epic Games Login" --dbfile $DBFILE)
    # echo $TEMP
    launchoptions "/bin/flatpak" "run com.github.derrod.legendary auth" "" "Epic Games Login" "Epic"
    
    
        #echo "{\"Type\": \"Success\", \"Content\": {\"Message\": \"Logged in\"}}"
   


}
function login_launch_options(){
    TEMP=$($DOSCONF --launchoptions "/bin/flatpak" "run com.github.derrod.legendary auth" "" "Epic Games Login" --dbfile $DBFILE)
    echo $TEMP
}

function logout(){
    TEMP=$($LEGENDARY auth --delete)
    loginstatus
}

function getsetting(){
    TEMP=$($DOSCONF --getsetting $1 --dbfile $DBFILE)
    echo $TEMP
}
function savesetting(){
    $DOSCONF --savesetting $1 $2 --dbfile $DBFILE
}   
function getjsonimages(){
    
    TEMP=$($EPICCONF --get-base64-images "${1}" --dbfile $DBFILE --offline)
    echo $TEMP
}
function gettabconfig(){
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
function savetabconfig(){
    
    cat > "${DECKY_PLUGIN_RUNTIME_DIR}/conf_schemas/epictabconfig.json"
    echo "{\"Type\": \"Success\", \"Content\": {\"success\": \"True\"}}"
    
}

ACTION=$1
shift


case $ACTION in
    init)
        init "${@}"
        ;;
    getgames)
        getgames "${@}"
        ;;
    getactions)
        getactions "${@}"
        ;;
    saveconfig)
        saveconfig "${@}"
        ;;
    getconfig)
        getconfig "${@}"
        ;;
    download)
        download "${@}"
        ;;
    install)
        install "${@}"
        ;;
    update)
        update "${@}"
        ;;
    verify)
        verify "${@}"
        ;;  
    repair)
        repair "${@}"
        ;;
    import)
        import "${@}"
        ;;
    getjsonimages)
        getjsonimages "${@}"
        ;;    
    cancelinstall)
        cancelinstall "${@}"
        ;;
    uninstall)
        uninstall "${@}"
        ;;
    protontricks)
        protontricks "${@}"
        ;;
    getgamedetails)
        getgamedetails "${@}"
        ;;
    getbats)
        getbats "${@}"
        ;;
    savebats)
        savebats "${@}"
        ;;
    getprogress)
        getprogress "${@}"
        ;;
    login)
        login "${@}"
        ;;
    login-launch-options)
        login_launch_options "${@}"
        ;;
    logout)
        logout "${@}"
        ;;
    loginstatus)
        loginstatus "${@}"
        ;;
    getsetting)
        getsetting "${@}"
        ;;
    savesetting)
        savesetting "${@}"
        ;; 
    getlaunchoptions)
        getlaunchoptions "${@}"
        ;;
    install-eac)
        install-eac "${@}"
        ;;
    run-exe)
        run-exe "${@}"
        ;;
    get-exe-list)
        get-exe-list "${@}"
        ;;  
    gettabconfig)
        gettabconfig "${@}"
        ;;
    savetabconfig)
        savetabconfig "${@}"
        ;;  
     *)
        echo "Unknown command: ${ACTION}"
        exit 1
        ;;
esac
