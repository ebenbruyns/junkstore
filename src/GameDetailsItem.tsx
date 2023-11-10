import { Focusable, ServerAPI, ModalRoot, showModal, sleep } from "decky-frontend-lib";
import { useState, useEffect, VFC, useRef } from "react";
import GameDisplay from "./GameDisplay";
import { ContentResult, GameDetailsContent, LaunchOptions, LaunchOptionsContent, ProgressUpdate } from "./Types";
import { Panel, ScrollPanelGroup } from "./Scrollable";
import { ConfEditor } from "./ConfEditor";
import { BatEditor } from "./BatEditor";
import { gameIDFromAppID } from "./gameIDFromAppID";
import Logger from "./logger";
import { Loading } from "./Loading";

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
            const data = await serverAPI.callPluginMethod<{}, ContentResult>("execute_action", {
                actionSet: initActionSet,
                actionName: "GetDetails",
                shortname: shortname,
                inputData: ""
            });
            logger.debug("onInit data", data);
            const res = (data.result as ContentResult);
            logger.debug("onInit res", res);
            setGameData(res);
            if (res.Type === "GameDetails")
                setSteamClientID((res.Content as GameDetailsContent).Details.SteamClientID);
            logger.debug("onInit finished");
        } catch (error) {
            logger.error(error);
        }
    };

    const updateProgress = async () => {
        while (installingRef.current) {
            logger.debug("updateProgress loop starting");
            try {
                logger.debug("updateProgress");

                serverAPI.callPluginMethod<{}, ProgressUpdate>("execute_action", {
                    actionSet: initActionSet,
                    actionName: "GetProgress",
                    shortname: shortname,
                    inputData: ""
                }).then((res) => {
                    const progressUpdate = res.result as ProgressUpdate;
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
            await serverAPI.callPluginMethod<{}, {}
            >("execute_action", {
                actionSet: initActionSet,
                actionName: "Uninstall",
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
            setInstalling(true);
            await serverAPI.callPluginMethod<{}, {}>("execute_action", {
                actionSet: initActionSet,
                actionName: "Download",
                shortname: shortname,
                inputData: ""
            });

        } catch (error) {
            logger.error(error);
        }
    };
    const cancelInstall = async () => {
        try {
            setInstalling(false);
            await serverAPI.callPluginMethod<{}, {}>("execute_action", {
                actionSet: initActionSet,
                actionName: "CancelInstall",
                shortname: shortname,
                inputData: ""
            });

        } catch (error) {
            logger.error(error);
        }
    };
    const install = async () => {

        //updateProgress();
        try {
            const id = await SteamClient.Apps.AddShortcut("Name", "/bin/bash", "target", "options");
            const data = await serverAPI.callPluginMethod<{}, ContentResult>("execute_action", {
                actionSet: initActionSet,
                actionName: "Install",
                shortname: shortname,
                inputData: ""
            });
            if (data.success) {
                if (data.result.Type === "LaunchOptions") {

                    const lauchOptions = ((data.result as ContentResult).Content as LaunchOptionsContent).LaunchOptions as LaunchOptions;
                    await SteamClient.Apps.SetAppLaunchOptions(id, lauchOptions.Options);
                    await SteamClient.Apps.SetShortcutName(id, (gameData.Content as GameDetailsContent).Details.Name);
                    await SteamClient.Apps.SetShortcutExe(id, lauchOptions.Exe);
                    await SteamClient.Apps.SetShortcutStartDir(id, lauchOptions.WorkingDir);
                    setSteamClientID(id.toString());
                    setInstalling(false);
                }
            }
        } catch (error) {
            logger.error(error);
        }
    };
    return (
        <>

            <>
                <style>
                    {`
                            .GenericConfirmDialog {
                                width: 100% !important;
                            }
                        `}
                </style>
                <ModalRoot
                    // @ts-ignore
                    style={{ width: 800 }}
                    onCancel={closeModal}
                    onEscKeypress={closeModal}
                    closeModal={closeModal}>
                    {gameData.Type === "Empty" && <Loading />}
                    {gameData.Type === "GameDetails" &&
                        <ScrollPanelGroup focusable={false} style={{ background: parent }}>
                            <Panel>
                                <div style={{ margin: "0px", color: "white" }}>
                                    <Focusable onOptionsButton={install}
                                        // @ts-ignore
                                        focusableIfNoChildren={true}
                                        onOptionsActionDescription="Reinstall Game"
                                        onSecondaryActionDescription="Remove Game"
                                        onSecondaryButton={uninstall}
                                    >

                                        <GameDisplay
                                            name={(gameData.Content as GameDetailsContent).Details.Name}
                                            description={(gameData.Content as GameDetailsContent).Details.Description}
                                            images={(gameData.Content as GameDetailsContent).Details.Images}
                                            steamClientID={steamClientID}
                                            closeModal={closeModal}
                                            installing={installing}
                                            installer={download}
                                            progress={progress}
                                            cancelInstall={cancelInstall}
                                            uninstaller={uninstall}


                                            runner={() => {
                                                setTimeout(() => {
                                                    closeModal();
                                                    let gid = gameIDFromAppID(parseInt(steamClientID));
                                                    SteamClient.Apps.RunGame(gid, "", -1, 100);
                                                }, 500);
                                                //SteamClient.Apps.RunGame(parseInt(gameData.SteamClientID), "", -1, 100)
                                            }}

                                            confeditor={() => {
                                                //closeModal();
                                                showModal(<ConfEditor serverAPI={serverAPI} tabindex={0} shortname={shortname} platform={"linux"} forkname={"_"} version={"_"} />);
                                                //Router.CloseSideMenus();
                                                //Router.Navigate("/conf-editor/" + tabindex + "/" + shortname + "/linux/_/_");
                                            }}
                                            bateditor={() => {
                                                showModal(<BatEditor serverAPI={serverAPI} tabindex={0} shortname={shortname} />);
                                            }}
                                            hasDosConfig={(gameData.Content as GameDetailsContent).Details.HasDosConfig}
                                            hasBatFiles={(gameData.Content as GameDetailsContent).Details.HasBatFiles} />
                                    </Focusable>
                                </div>
                            </Panel>
                        </ScrollPanelGroup>}
                </ModalRoot>
            </>

        </>
    );
};
