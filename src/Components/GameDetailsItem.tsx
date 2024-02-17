import { Focusable, ServerAPI, ModalRoot, sleep, ScrollPanelGroup, Panel, ModalPosition, SimpleModal } from "decky-frontend-lib";
import { useState, useEffect, VFC, useRef } from "react";
import GameDisplay from "./GameDisplay";
import { ContentResult, GameDetails, GameImages, LaunchOptions, MenuAction, ProgressUpdate, ScriptActions } from "../Types/Types";
// import { Panel, ScrollPanelGroup } from "./Scrollable";
import { gameIDFromAppID } from "../Utils/gameIDFromAppID";
import Logger from "../Utils/logger";
import { Loading } from "./Loading";
import { executeAction } from "../Utils/executeAction";

interface GameDetailsItemProperties {
    serverAPI: ServerAPI;
    shortname: string;
    initActionSet: string;
    initAction: string;
    closeModal?: any;
}


export const GameDetailsItem: VFC<GameDetailsItemProperties> = ({
    serverAPI, shortname, closeModal, initActionSet,
    // @ts-ignore
    initAction
}) => {

    const logger = new Logger("GameDetailsItem");
    logger.log("GameDetailsItem startup");
    const [scriptActions, setScriptActions] = useState<MenuAction[]>([]);
    const [gameData, setGameData] = useState<ContentResult>({ Type: "Empty", Content: { Details: {} } } as ContentResult);
    logger.log("GameDetailsItem gameData", gameData);
    const [steamClientID, setSteamClientID] = useState("");
    logger.log("GameDetailsItem steamClientID", steamClientID);
    const [installing, setInstalling] = useState(false);
    logger.log("GameDetailsItem installing", installing);

    const [progress, setProgress] = useState<ProgressUpdate>({
        Percentage: 0,
        Description: ""
    } as ProgressUpdate);
    logger.log("GameDetailsItem progress", progress);

    const installingRef = useRef(installing);
    logger.log("GameDetailsItem installingRef", installingRef);
    useEffect(() => {
        logger.log("GameDetailsItem installingRef.current = installing");
        installingRef.current = installing;
    }, [installing]);


    useEffect(() => {
        if (installing) {
            logger.log("GameDetailsItem updateProgress");
            updateProgress();
        }
    }, [installing]);
    //const [] = useState("Play Game");
    useEffect(() => {
        logger.log("GameDetailsItem onInit");
        onInit();
    }, []);
    const onInit = async () => {
        try {
            logger.debug("onInit starting");
            const res = await executeAction(serverAPI, initActionSet,
                "GetDetails",
                {
                    shortname: shortname,
                    inputData: ""
                });
            logger.debug("onInit data", res);

            logger.debug("onInit res", res);
            setGameData(res);
            if (res.Type === "GameDetails")
                setSteamClientID((res.Content as GameDetails).SteamClientID);
            logger.debug("onInit finished");
            const actionRes = await executeAction(serverAPI, initActionSet,
                "GetGameScriptActions",
                {
                    shortname: shortname,
                    inputData: ""
                }) as ContentResult;
            logger.debug("onInit actionRes", actionRes);
            if (actionRes.Type === "ScriptSet") {
                const scriptActions = actionRes.Content as ScriptActions;
                logger.debug("onInit scriptActions", scriptActions);
                setScriptActions(scriptActions.Actions);
            }

        } catch (error) {
            logger.error(error);
        }
    };

    const updateProgress = async () => {
        while (installingRef.current) {
            logger.debug("updateProgress loop starting");
            try {
                logger.debug("updateProgress");

                executeAction(serverAPI, initActionSet,
                    "GetProgress",
                    {
                        shortname: shortname,
                        inputData: ""
                    }).then((res) => {
                        const progressUpdate = res.Content as ProgressUpdate;
                        if (progressUpdate != null) {
                            logger.debug(progressUpdate);
                            setProgress(progressUpdate);
                            logger.debug(progressUpdate.Percentage);
                            if (progressUpdate.Percentage >= 100) {
                                setInstalling(false);
                                logger.debug("setInstalling(false)");
                                install();
                                return;
                            }
                        }
                    }).catch((e) => {
                        logger.error('Error in progress updater', e);
                    });
            } catch (e) {
                logger.error('Error in progress updater', e);
            }

            logger.debug("sleeping");
            await sleep(1000);
            logger.debug("woke up");
        }
    };

    useEffect(() => {
        onInit();
    }, []);

    useEffect(() => {
        if (installing) {
            updateProgress(); // start the loop when installing is true
        }
    }, [installing]);
    const uninstall = async () => {
        try {
            await executeAction(serverAPI, initActionSet,
                "Uninstall",
                {
                    shortname: shortname,
                    inputData: ""
                });
            await SteamClient.Apps.RemoveShortcut(parseInt(steamClientID));
            setSteamClientID("");
        } catch (error) {
            logger.error(error);
        }
    };
    const download = async () => {
        try {

            const result = await executeAction(serverAPI, initActionSet,
                "Download",
                {
                    shortname: shortname,
                    inputData: ""
                });
            if (result.Type == "Progress")
                setInstalling(true);
        } catch (error) {
            logger.error(error);
        }
    };
    const update = async () => {
        try {

            const result = await executeAction(serverAPI, initActionSet,
                "Update",
                {
                    shortname: shortname,
                    inputData: ""
                });
            if (result.Type == "Progress")
                setInstalling(true);

        } catch (error) {
            logger.error(error);
        }
    };
    const runScript = async (actionSet: string, actionId: string, args: any) => {
        const result = await executeAction(serverAPI, actionSet, actionId, args)
        if (result.Type == "Progress")
            setInstalling(true);

    }
    const cancelInstall = async () => {
        try {
            setInstalling(false);
            await executeAction(serverAPI, initActionSet,
                "CancelInstall",
                {
                    shortname: shortname,
                    inputData: ""
                });

        } catch (error) {
            logger.error(error);
        }
    };
    const runner = async () => {

        setTimeout(async () => {
            let id = parseInt(steamClientID)
            let gid = gameIDFromAppID(id);

            await SteamClient.Apps.RunGame(gid, "", -1, 100);
            closeModal();
        }, 500);
    };
    const checkid = async () => {
        let id = parseInt(steamClientID)
        logger.debug("checkid", id)
        // @ts-ignore
        const apps = appStore.allApps.filter(app => app.appid == id)
        if (apps.length == 0)
            return await getSteamId()
        else
            return id;
    }

    const resetLaunchOptions = async () => {

        let id = await checkid()
        logger.debug("resetLaunchOptions id:", id)
        configureShortcut(id);

    }
    const configureShortcut = async (id: Number) => {
        setSteamClientID(id.toString());
        const result = await executeAction(serverAPI, initActionSet,
            "Install",
            {
                shortname: shortname,
                steamClientID: id.toString(),
                inputData: ""
            });
        const name = (gameData.Content as GameDetails).Name;
        // @ts-ignore
        const apps = appStore.allApps.filter(app => app.display_name == name && app.app_type == 1073741824 && app.appid != id)
        for (const app of apps) {
            logger.debug("removing shortcut", app.appid)
            await SteamClient.Apps.RemoveShortcut(app.appid);
        }
        await cleanupIds();

        if (result.Type === "LaunchOptions") {
            const launchOptions = result.Content as LaunchOptions;
            //await SteamClient.Apps.SetAppLaunchOptions(gid, "");
            await SteamClient.Apps.SetAppLaunchOptions(id, launchOptions.Options);
            await SteamClient.Apps.SetShortcutName(id, (gameData.Content as GameDetails).Name);
            await SteamClient.Apps.SetShortcutExe(id, launchOptions.Exe);
            await SteamClient.Apps.SetShortcutStartDir(id, launchOptions.WorkingDir);
            //@ts-ignore
            const defaultProton = settingsStore.settings.strCompatTool;

            if (defaultProton) {
                await SteamClient.Apps.SpecifyCompatTool(id, defaultProton);
            }
            setInstalling(false);
        }

        const imageResult = await executeAction(serverAPI, initActionSet,
            "GetJsonImages",
            {
                shortname: shortname,
                inputData: ""
            });

        if (imageResult.Type == "Images") {
            const images = imageResult.Content as GameImages
            logger.debug("images", images);
            if (images.Grid !== null) SteamClient.Apps.SetCustomArtworkForApp(id, images.Grid, 'png', 0);
            if (images.Hero !== null) SteamClient.Apps.SetCustomArtworkForApp(id, images.Hero, "png", 1);
            if (images.Logo !== null) SteamClient.Apps.SetCustomArtworkForApp(id, images.Logo, "png", 2);
            if (images.GridH !== null) SteamClient.Apps.SetCustomArtworkForApp(id, images.GridH, "png", 3);
        }

    }

    const cleanupIds = async () => {
        // @ts-ignore
        const apps = appStore.allApps.filter(app => (app.display_name == "bash" || app.display_name == "") && app.app_type == 1073741824)
        for (const app of apps) {
            await SteamClient.Apps.RemoveShortcut(app.appid);
        }
    }

    const getSteamId = async () => {

        const name = (gameData.Content as GameDetails).Name;
        // @ts-ignore
        const apps = appStore.allApps.filter(app => app.display_name == name && app.app_type == 1073741824)
        await cleanupIds();
        if (apps.length > 0) {
            const id = apps[0].appid;
            if (apps.length > 1) {
                for (let i = 1; i < apps.length; i++) {
                    await SteamClient.Apps.RemoveShortcut(apps[i].appid);
                }
            }
            return id;

        }
        else {
            const id = await SteamClient.Apps.AddShortcut("Name", "/bin/bash", "", "");
            await SteamClient.Apps.SetShortcutName(id, (gameData.Content as GameDetails).Name);
            return id;
        }
    }
    const install = async () => {
        //updateProgress();
        try {
            const id = await getSteamId();
            configureShortcut(id);

        } catch (error) {
            logger.error(error);
        }
    };
    return (

        <>
            <style>
                {`
                            .GenericConfirmDialog {
                                width: 100% !important;
                                height: 100% !important;
                                padding: 0px !important;
                                margin: 0px !important;
                            }
                            .ModalPosition {
                                scroll-padding: 0px !important;
                                padding: 0px !important;
                                margin: -10px !important;
                            }
                        `}
            </style>

            <ModalRoot
                // @ts-ignore
                style={{ width: 800, height: "100%", padding: "0px", margin: "0px", background: parent }}
                onCancel={closeModal}
                onEscKeypress={closeModal}
                closeModal={closeModal} bAllowFullSize={true}>
                <ModalPosition>
                    <Focusable>
                        {gameData.Type === "Empty" && <Loading />}
                        {gameData.Type === "GameDetails" &&


                            <ScrollPanelGroup
                                // @ts-ignore
                                focusable={false}
                                style={{
                                    background: parent, height: "100%",
                                    padding: "0px",
                                    margin: "0px"
                                }}>
                                {/* <Focusable style={{ margin: "0px", color: "white", height: "100%", padding: "0px" }} onOptionsButton={install}
                                // @ts-ignore
                                focusableIfNoChildren={true}

                            > */}

                                <GameDisplay
                                    serverApi={serverAPI}
                                    name={(gameData.Content as GameDetails).Name}
                                    shortName={(gameData.Content as GameDetails).ShortName}
                                    description={(gameData.Content as GameDetails).Description}
                                    images={(gameData.Content as GameDetails).Images}
                                    steamClientID={steamClientID}
                                    closeModal={closeModal}
                                    installing={installing}
                                    installer={download}
                                    progress={progress}
                                    cancelInstall={cancelInstall}
                                    uninstaller={uninstall}
                                    editors={(gameData.Content as GameDetails).Editors}
                                    initActionSet={initActionSet}
                                    runner={runner}
                                    actions={scriptActions}
                                    resetLaunchOptions={resetLaunchOptions}
                                    updater={update}
                                    scriptRunner={runScript}
                                />

                                {/* </Focusable> */}
                            </ScrollPanelGroup>
                        }
                    </Focusable>
                </ModalPosition>
            </ModalRoot >


        </>


    );


};
