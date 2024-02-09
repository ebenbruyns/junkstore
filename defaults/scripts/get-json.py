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
                },
                {
                    "Id": "GetLoginActions",
                    "Title": "Get login status",
                    "Type": "Init",
                    "Command": "./scripts/get-json.py epic-games-login-actions"
                }
            ]
        }
    },
    "junk-store-actions-no-tabs": {
        "Type": "ActionSet",
        "Content": {
            "SetName": "JunkStoreActionsNoTabs",
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
                    "Command": "./scripts/junk-store.sh getgames"
                },
                {
                    "Id": "GetLoginActions",
                    "Title": "Get login status",
                    "Type": "Init",
                    "Command": "./scripts/get-json.py epic-games-login-actions"
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
                },
                {
                    "Id": "JunkStoreInitNoTabs",
                    "Title": "Content",
                    "Type": "Init",
                    "Command": "./scripts/get-json.py junk-store-actions-no-tabs"
                },
                {
                    "Id": "GetEpicActions",
                    "Title": "Get Epic store actions",
                    "Type": "Init",
                    "Command": "./scripts/get-json.py epic-actions"
                },
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
                        }  # ,
                        # {
                        #     "ActionId": "JunkStoreInitNoTabs",
                        #     "Title": "Epic Games (no tabs)",
                        #     "Type": "Page"
                        # }
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
                        "Id": "LoginLaunchOptions",
                        "Title": "Login",
                        "Type": "Login",
                        "Command": "./scripts/junk-store.sh login-launch-options"
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
    "epic-game-script-actions": {
        "Type": "ScriptSet",
        "Content": {

            "Actions": [
                {
                    "ActionId": "Update",
                    "Title": "Update Game",
                    "Type": "ScriptAction",
                    "InstalledOnly": True
                },
                {
                    "ActionId": "Verify",
                    "Title": "Verify Game",
                    "Type": "ScriptAction",
                    "InstalledOnly": True
                },
                {
                    "ActionId": "Repair",
                    "Title": "Repair Game",
                    "Type": "ScriptAction",
                    "InstalledOnly": True
                },
                {
                    "ActionId": "EnableEOSoverlay",
                    "Title": "Enable EOS overlay",
                    "Type": "ScriptAction",
                    "InstalledOnly": True
                },
                {
                    "ActionId": "DisableEOSoverlay",
                    "Title": "Disable EOS overlay",
                    "Type": "ScriptAction",
                    "InstalledOnly": True
                },
                # {
                #     "ActionId": "Import",
                #     "Title": "Import Game",
                #     "Type": "ScriptAction",
                #     "InstalledOnly": False
                # },
                {
                    "ActionId": "ProtonTricks",
                    "Title": "Proton Tricks",
                    "Type": "ScriptAction",
                    "InstalledOnly": True
                }
            ]
        }
    },
    "epic-script-actions": {
        "Type": "ScriptSet",
        "Content": {

            "Actions": [
                {
                    "ActionId": "Refresh",
                    "Title": "Refresh Games List",
                    "Type": "ScriptAction",
                    "InstalledOnly": False
                }
            ]}
    },
    "epic-exe-actions": {
        "Type": "ActionSet",
        "Content": {
            "SetName": "EpicExeActions",
            "Actions": [
                {
                    "Id": "RunBinary",
                    "Title": "Run executable in game folder",
                    "Type": "ScriptAction",
                    "Command": "./scripts/junk-store.sh run-exe"
                },
                {
                    "Id": "GetContent",
                    "Title": "Get executable list",
                    "Type": "Content",
                    "Command": "./scripts/junk-store.sh get-exe-list"
                }
            ]
        }
    },
    "epic-config-actions": {
        "Type": "ActionSet",
        "Content": {
            "SetName": "DosboxConfigFileActions",
            "Actions": [
                {
                    "Id": "GetContent",
                    "Title": "Get the ini files as json",
                    "Type": "IniEditor",
                    "Command": "./scripts/junk-store.sh getconfig"
                },
                {
                    "Id": "SaveContent",
                    "Title": "Save the ini files as json",
                    "Type": "IniEditor",
                    "Command": "./scripts/junk-store.sh saveconfig"
                }
            ]
        }
    },
    "epic-tab-config-actions": {
        "Type": "ActionSet",
        "Content": {
            "SetName": "EpicTabConfigEditor",
            "Actions": [
                {
                    "Id": "GetContent",
                    "Title": "Get the ini files as json",
                    "Type": "IniEditor",
                    "Command": "./scripts/junk-store.sh gettabconfig"
                },
                {
                    "Id": "SaveContent",
                    "Title": "Save the ini files as json",
                    "Type": "IniEditor",
                    "Command": "./scripts/junk-store.sh savetabconfig"
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
                    "Id": "GetJsonImages",
                    "Title": "Get game images as json",
                    "Type": "GameImages",
                    "Command": "./scripts/junk-store.sh getjsonimages"
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
                    "Id": "Update",
                    "Title": "Update game",
                    "Type": "Update",
                    "Command": "./scripts/junk-store.sh update"
                },
                {
                    "Id": "Repair",
                    "Title": "Repair game",
                    "Type": "Update",
                    "Command": "./scripts/junk-store.sh repair"
                },
                {
                    "Id": "Verify",
                    "Title": "Veirfy game",
                    "Type": "Verify",
                    "Command": "./scripts/junk-store.sh verify"
                },
                {
                    "Id": "Import",
                    "Title": "Import game",
                    "Type": "Import",
                    "Command": "./scripts/junk-store.sh import"
                },
                {
                    "Id": "Uninstall",
                    "Title": "Uninstall game",
                    "Type": "Uninstall",
                    "Command": "./scripts/junk-store.sh uninstall"
                },
                {
                    "Id": "EnableEOSoverlay",
                    "Title": "Enable EOS overlay",
                    "Type": "Executable",
                    "Command": "./scripts/junk-store.sh  enable-eos-overlay"
                },
                {
                    "Id": "DisableEOSoverlay",
                    "Title": "Disable EOS overlay",
                    "Type": "Executable",
                    "Command": "./scripts/junk-store.sh disable-eos-overlay"
                },
                {
                    "Id": "ProtonTricks",
                    "Title": "Proton Tricks",
                    "Type": "Executable",
                    "Command": "./scripts/junk-store.sh protontricks"
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
                },
                {
                    "Id": "GetLaunchOptions",
                    "Title": "Get launch options",
                    "Type": "GetLaunchOptions",
                    "Command": "./scripts/junk-store.sh getlaunchoptions"
                },
                {
                    "Id": "GetExeActions",
                    "Title": "Get executable action set to run exe's in game dir",
                    "Type": "Init",
                    "Command": "./scripts/get-json.py epic-exe-actions"
                },
                {
                    "Id": "GetGameScriptActions",
                    "Title": "",
                    "Type": "ScriptActions",
                    "Command": "./scripts/get-json.py epic-game-script-actions"
                },
                {
                    "Id": "GetScriptActions",
                    "Title": "",
                    "Type": "ScriptActions",
                    "Command": "./scripts/get-json.py epic-script-actions"
                },
                {
                    "Id": "GetDosboxConfigFileActions",
                    "Title": "Get dosbox config file actions",
                    "Type": "Init",
                    "Command": "./scripts/get-json.py epic-config-actions"
                },
                {
                    "Id": "GetTabConfigActions",
                    "Title": "Get epic tab config file actions",
                    "Type": "Init",

                    "Command": "./scripts/get-json.py epic-tab-config-actions"
                },
                {
                    "Id": "Refresh",
                    "Title": "Refresh Games List",
                    "Type": "Refresh",
                    "Command": "./scripts/junk-store.sh init"
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
