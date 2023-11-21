#!/bin/bash
source "./scripts/settings.sh"


function init() {
    $EPICCONF --list --dbfile $EPICDB > /dev/null
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
    TEMP=$($DOSCONF --getgameswithimages "${IMAGE_PATH}" "${FILTER}" "${INSTALLED}" "${LIMIT}" --dbfile $DBFILE)
   
    echo $TEMP
}
function saveconfig(){
    cat | $DOSCONF --parsejson "${1}" --dbfile $DBFILE 
}
function getconfig(){
    TEMP=$($DOSCONF --confjson "${1}"  --dbfile $DBFILE)
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
    $LEGENDARY install $1 --force --with-dlcs -y --platform Windows >> "${DECKY_PLUGIN_LOG_DIR}/${1}.log" 2>> $PROGRESS_LOG &
    echo $! > "${DECKY_PLUGIN_LOG_DIR}/${1}.pid"
    echo "{\"Type\": \"Success\", \"Content\": {\"Message\": \"Downloading\"}}"

}

function install(){
    PROGRESS_LOG="${DECKY_PLUGIN_LOG_DIR}/${1}.progress"
    rm $PROGRESS_LOG

    RESULT=$($DOSCONF --addsteamclientid "${1}" "${2}" --dbfile $DBFILE)
    #WORKING_DIR=$($EPICCONF --get-working-dir "${1}")
    mkdir -p "${HOME}/.compat/${1}"
    TEMP=$($EPICCONF --launchoptions "${1}" "${ARGS_SCRIPT}" "" --dbfile $DBFILE)
    echo $TEMP
    exit 0
}

function uninstall(){
    $LEGENDARY uninstall $1 >> "${DECKY_PLUGIN_LOG_DIR}/${1}.log"
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
    TEMP=$($DOSCONF --getjsonbats "${1}" --dbfile $DBFILE)
    echo $TEMP
}
function savebats(){
    cat | $DOSCONF --updatebats "${1}" --dbfile $DBFILE
}
function getprogress()
{
    TEMP=$($EPICCONF --getprogress "${DECKY_PLUGIN_LOG_DIR}/${1}.progress")
    echo $TEMP
}
function loginstatus(){
    TEMP=$($EPICCONF --getloginstatus --dbfile $DBFILE)
    echo $TEMP

}
function login(){
    #TEMP=$($LEGENDARY auth)
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
    cancelinstall)
        cancelinstall "${@}"
        ;;
    uninstall)
        uninstall "${@}"
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
     *)
        echo "Unknown command: ${ACTION}"
        exit 1
        ;;
esac
