#!/bin/bash

if [[ -z "${DECKY_PLUGIN_DIR}" ]]; then
    DECKY_PLUGIN_DIR="${HOME}/homebrew/plugins/Junk-Store"
fi
if [[ -z "${DECKY_PLUGIN_RUNTIME_DIR}" ]]; then
    DECKY_PLUGIN_RUNTIME_DIR="${HOME}/homebrew/data/Junk-Store"
fi
if [[ -z "${DECKY_PLUGIN_LOG_DIR}" ]]; then
    DECKY_PLUGIN_LOG_DIR="${HOME}/homebrew/logs/Junk-Store"
fi

DOSCONF="${DECKY_PLUGIN_DIR}/scripts/dosbox-conf.py"
EPICCONF="${DECKY_PLUGIN_DIR}/scripts/epic-config.py"
Extensions="Extensions"







