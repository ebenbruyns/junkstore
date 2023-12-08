#/bin/bash
# These need to be exported because it does not get executed in the context of the plugin.
export DECKY_PLUGIN_RUNTIME_DIR="${HOME}/homebrew/data/Junk-Store"
export DECKY_PLUGIN_DIR="${HOME}/homebrew/plugins/Junk-Store"
export DECKY_PLUGIN_LOG_DIR="${HOME}/homebrew/logs/Junk-Store"
ID=$1
echo $1
shift
CMD=$@
ARGS=$("${HOME}/homebrew/plugins/Junk-Store/scripts/get-epic-args.sh" $ID)
echo "#!/bin/bash" > run.sh
echo "${CMD} ${ARGS}" >> run.sh
chmod +x run.sh
./run.sh && rm run.sh
 