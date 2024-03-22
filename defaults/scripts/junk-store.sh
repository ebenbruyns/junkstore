#!/bin/bash
mkdir ~/homebrew/data/Junk-Store/scripts/Extensions -p
source "./scripts/settings.sh"
source "${DECKY_PLUGIN_DIR}/scripts/shared.sh"

# plugins hook into the junk-store.sh script by defining a function with the same name as the plugin prefixed with the platform name
# e.g. for the Epic plugin, the function would be Epic_init

PLATFORMS=()
PLATFORM="${1}"

# List of actions that can be performed by the junk-store.sh script
ACTIONS=("init" "getgames" "getactions" "saveconfig" "getconfig" "download" \
"install" "update" "verify" "repair" "import" "getjsonimages" "cancelinstall" \
"uninstall" "protontricks" "enable-eos-overlay" "disable-eos-overlay" \
"getgamedetails" "getbats" "savebats" "getprogress" "login" \
"login-launch-options" "logout" "loginstatus" "getsetting" "savesetting" \
"getlaunchoptions" "run-exe" "get-exe-list" "gettabconfig" "savetabconfig" \
"saveplatformconfig" "getplatformconfig" "refresh" )


# Function to source scripts recursively from a directory
source_scripts() {
    local dir=$1
    if [[ -d "$dir" ]]; then
        local store_script="$dir/store.sh"
        if [[ -f "$store_script" ]]; then
            source "$store_script"
        fi
        for subdir in "$dir"/*; do
            if [[ -d "$subdir" ]]; then
                source_scripts "$subdir"
            fi
        done
    fi
}
    


# List of directories to search for scripts
directories=("${DECKY_PLUGIN_DIR}/scripts/${Extensions}" \
    "${DECKY_PLUGIN_RUNTIME_DIR}/scripts/${Extensions}")

# Source scripts recursively from each directory
for dir in "${directories[@]}"; do
    source_scripts "$dir"
done

# Check if the PLATFORM is in the list of strings
if [[ " ${PLATFORMS[@]} " =~ " ${1} " ]]; then
    export PLATFORM=$1
    shift  # Remove the first argument from the argument list
else
    export PLATFORM=""
fi



# Check if ACTION is one of the actions in the case statement
ACTION=$1
shift  # Remove the first argument from the argument list
FUNCTION="${PLATFORM}_${ACTION}"
if [[ " ${ACTIONS[@]} " =~ " $ACTION " ]]; then
    if [[ "$(type -t $FUNCTION)" == "function" ]]; then
            $FUNCTION "${@}"
        else
            $ACTION "${@}"
        fi
else
        echo "Invalid action: $ACTION"
        exit 1
fi

