#!/usr/bin/env bash

if [[ -z "${DECKY_PLUGIN_DIR}" ]]; then
    export DECKY_PLUGIN_DIR="${HOME}/homebrew/plugins/Junk-Store"
fi
if [[ -z "${DECKY_PLUGIN_RUNTIME_DIR}" ]]; then
    export DECKY_PLUGIN_RUNTIME_DIR="${HOME}/homebrew/data/Junk-Store"
fi
if [[ -z "${DECKY_PLUGIN_LOG_DIR}" ]]; then
    export DECKY_PLUGIN_LOG_DIR="${HOME}/homebrew/logs/Junk-Store"
fi

Extensions="Extensions"







