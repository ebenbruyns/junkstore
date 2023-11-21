#!/usr/bin/env python3
import sys
import json


json_fragments = {
    "junk-store-actions": {
        "Type": "ActionSet",
        "Content": {
            "SetName": "JunkStoreActions",
            "Actions": [
                {
                    "Id": "GetEpicActions",
                    "Title": "Get Epic store actions",
                    "Type": "Init",
                    "Command": "./scripts/get-json.py epic-actions"
                },
                {
                    "Id": "GetContent",
                    "Title": "Get content",
                    "Type": "TabPage",
                    "Command": "./scripts/get-json.py junk-store-tabs"
                }

            ]
        }
    },
    "main-menu-actions": {
        "Type": "ActionSet",
        "Content": {
            "SetName": "MainMenu",
            "Actions": [
                {
                    "Id": "GetContent",
                    "Title": "Populate Store",
                    "Type": "GetContent",
                    "Command": "./scripts/get-json.py main-menu-content"
                },
                {
                    "Id": "JunkStoreInit",
                    "Title": "Content",
                    "Type": "Init",
                    "Command": "./scripts/get-json.py junk-store-actions"
                }
            ]
        }
    },
    "junk-store-tabs": {
        "Type": "StoreTabs",
        "Content": {
            "Tabs": [
                {"Title": "Epic", "Type": "GameGrid", "ActionId": "GetEpicActions"}
            ]
        }
    },
    "main-menu-content": {
        "Type": "MainMenu",
        "Content": {
            "Panels": [
                {
                    "Title": "Custom Stores",
                    "Type": "Section",
                    "Actions": [
                        {
                            "ActionId": "JunkStoreInit",
                            "Title": "Epic Games",
                            "Type": "Page"
                        }
                    ]
                }
            ]
        }
    },
    "epic-games-login-actions": {
        "Type": "ActionSet",
        "Content": {
                "SetName": "EpicGamesLoginActions",
                "Actions": [
                    {
                        "Id": "Login",
                        "Title": "Login",
                        "Type": "Login",
                        "Command": "./scripts/junk-store.sh login"
                    },
                    {
                        "Id": "Logout",
                        "Title": "Logout",
                        "Type": "Logout",
                        "Command": "./scripts/junk-store.sh logout"
                    },
                    {
                        "Id": "GetContent",
                        "Title": "Status",
                        "Type": "Status",
                        "Command": "./scripts/junk-store.sh loginstatus"
                    },
                    {
                        "Id": "GetSetting",
                        "Title": "Get settings",
                        "Type": "GetSettings",
                        "Command": "./scripts/junk-store.sh getsetting"
                    },
                    {
                        "Id": "SaveSetting",
                        "Title": "Set settings",
                        "Type": "SaveSettings",
                        "Command": "./scripts/junk-store.sh savesetting"
                    }
                ]
        }
    },
    "epic-actions": {
        "Type": "ActionSet",
        "Content": {
            "SetName": "EpicActions",
            "Actions": [
                {
                    "Id": "GetContent",
                    "Title": "Get Epic games list",
                    "Type": "GameGrid",
                    "Command": "./scripts/junk-store.sh getgames"
                },
                {
                    "Id": "GetDetails",
                    "Title": "Get game details",
                    "Type": "GameDetails",
                    "Command": "./scripts/junk-store.sh getgamedetails"
                },
                {
                    "Id": "Install",
                    "Title": "Install game",
                    "Type": "Install",
                    "Command": "./scripts/junk-store.sh install"
                },
                {
                    "Id": "Download",
                    "Title": "Download game",
                    "Type": "Download",
                    "Command": "./scripts/junk-store.sh download"
                },
                {
                    "Id": "Uninstall",
                    "Title": "Uninstall game",
                    "Type": "Uninstall",
                    "Command": "./scripts/junk-store.sh uninstall"
                },
                {
                    "Id": "GetProgress",
                    "Title": "Get install progress",
                    "Type": "GetProgress",
                    "Command": "./scripts/junk-store.sh getprogress"
                },
                {
                    "Id": "CancelInstall",
                    "Title": "Cancel install",
                    "Type": "CancelInstall",
                    "Command": "./scripts/junk-store.sh cancelinstall"
                },
                {
                    "Id": "GetLoginActions",
                    "Title": "Get login status",
                    "Type": "Init",
                    "Command": "./scripts/get-json.py epic-games-login-actions"
                }
            ]
        }
    }
}

# Check if an argument is provided
if len(sys.argv) < 2:
    error = {
        "Type": "Error",
        "Content": {
            "Title": "Error",
            "Message": "Please provide an argument."
        }
    }
    print(json.dumps(error))
    sys.exit(1)

# Get the argument from the command line
argument = sys.argv[1]

# Look up the JSON fragment based on the argument
if argument in json_fragments:
    json_fragment = json_fragments[argument]
    print(json.dumps(json_fragment))
else:
    error = {
        "Type": "Error",
        "Content": {
            "Title": "Error",
            "Message": "Invalid argument."
        }
    }
    print(json.dumps(error))
    sys.exit(1)
