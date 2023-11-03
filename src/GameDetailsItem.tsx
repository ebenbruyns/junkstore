import { Focusable, ServerAPI, ModalRoot, showModal, sleep } from "decky-frontend-lib";
import { useState, useEffect, VFC, useRef } from "react";
import GameDisplay from "./GameDisplay";
import { GameDetails, LaunchOptions, ProgressUpdate } from "./Types";
import { Panel, ScrollPanelGroup } from "./Scrollable";
import { ConfEditor } from "./ConfEditor";
import { BatEditor } from "./BatEditor";
import { gameIDFromAppID } from "./gameIDFromAppID";


export const GameDetailsItem: VFC<{ serverAPI: ServerAPI; tabindex: number; shortname: string; closeModal?: any; }> = ({
    serverAPI, tabindex, shortname, closeModal
}) => {
    const [gameData, setGameData] = useState({} as GameDetails);
    const [steamClientID, setSteamClientID] = useState("");
    const [installing, setInstalling] = useState(false);
    const [progress, setProgress] = useState({
        progress_percentage: 0,
        progress_current: "",
        progress_total: "",
        running_time: "",
        eta: "",
        downloaded_size: 0,
        written_size: 0,
        cache_usage: 0,
        active_tasks: 0,
        download_speed_raw: 0,
        download_speed_decompressed: 0,
        disk_write_speed: 0,
        disk_read_speed: 0,
        file_size_mb: 0,
        remaining_mb: 0,
        total_size: 0,
    } as ProgressUpdate);
    // const { tabindex, shortname } = useParams<{
    //   tabindex: number;
    //   shortname: string
    // }>();
    const installingRef = useRef(installing);

    useEffect(() => {
        installingRef.current = installing;
    }, [installing]);


    useEffect(() => {
        if (installing) {
            updateProgress();
        }
    }, [installing]);
    const [] = useState("Play Game");
    useEffect(() => {
        onInit();
    }, []);
    const onInit = async () => {
        try {
            const data = await serverAPI.callPluginMethod<{}, GameDetails>("get_game_details", {
                tabindex: tabindex,
                shortname: shortname,
            });
            const res = data.result as GameDetails;
            setGameData(res);
            setSteamClientID(res.SteamClientID);
        } catch (error) {
            console.error(error);
        }
    };

    const updateProgress = async () => {
        while (installingRef.current) {
            console.log("updateProgress loop starting");
            try {
                console.log("updateProgress");
                serverAPI.callPluginMethod<{}, ProgressUpdate>("get_install_progress", {
                    tabindex: tabindex,
                    shortname: shortname,
                }).then((res) => {
                    const progressUpdate = res.result as ProgressUpdate;
                    if (progressUpdate != null) {
                        console.log(progressUpdate);
                        setProgress(progressUpdate);
                        console.log(progressUpdate.progress_percentage);
                        if (progressUpdate.progress_percentage >= 100) {
                            setInstalling(false);
                            console.log("setInstalling(false)");
                            install();
                            return;
                        }
                    }
                }).catch((e) => {
                    console.log("Error in progress updater", e);
                    console.error('Error in progress updater', e);
                });
            } catch (e) {
                console.log("Error in progress updater", e);
                console.error('Error in progress updater', e);
            }

            console.log("sleeping");
            await sleep(1000);
            console.log("woke up");
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
            await serverAPI.callPluginMethod<{}, LaunchOptions>("uninstall_game", {
                tabindex: tabindex,
                shortname: gameData.ShortName,
            });
            await SteamClient.Apps.RemoveShortcut(parseInt(steamClientID));
            setSteamClientID("");
        } catch (error) {
            console.error(error);
        }
    };
    const download = async () => {
        try {
            setInstalling(true);
            await serverAPI.callPluginMethod<{}, LaunchOptions>("download_game", {
                tabindex: tabindex,
                shortname: gameData.ShortName,
            });
        } catch (error) {
            console.error(error);
        }
    };
    const cancelInstall = async () => {
        try {
            setInstalling(false);
            await serverAPI.callPluginMethod<{}, LaunchOptions>("cancel_install", {
                tabindex: tabindex,
                shortname: gameData.ShortName,
            });
        } catch (error) {
            console.error(error);
        }
    };
    const install = async () => {

        //updateProgress();
        try {
            const id = await SteamClient.Apps.AddShortcut("Name", "/bin/bash", "target", "options");
            const data = await serverAPI.callPluginMethod<{}, LaunchOptions>("install_game", {
                tabindex: tabindex,
                shortname: gameData.ShortName,
                id: id,
            });
            const r = data.result as LaunchOptions;
            await SteamClient.Apps.SetAppLaunchOptions(id, r.options);
            await SteamClient.Apps.SetShortcutName(id, gameData.Name);
            await SteamClient.Apps.SetShortcutExe(id, r.exe);
            await SteamClient.Apps.SetShortcutStartDir(id, r.workingdir);
            setSteamClientID(id.toString());
            setInstalling(false);
        } catch (error) {
            console.error(error);
        }
    };
    return (
        <>
            <style>
                {`
    .GenericConfirmDialog {
        width: 100% !important;
    }
`} </style>
            <ModalRoot
                // @ts-ignore
                style={{ width: 800 }}
                onCancel={closeModal}
                onEscKeypress={closeModal}
                closeModal={closeModal}>
                <ScrollPanelGroup focusable={false} style={{ background: parent }}>
                    <Panel>
                        <div style={{ margin: "0px", color: "white" }}>
                            <Focusable onOptionsButton={install}
                                onOptionsActionDescription="Reinstall Game"
                                onSecondaryActionDescription="Remove Game"
                                onSecondaryButton={uninstall}
                            >

                                <GameDisplay
                                    name={gameData.Name}
                                    description={gameData.Description}
                                    releaseDate={gameData.ReleaseDate}
                                    developer={gameData.Developer}
                                    images={gameData.Images}
                                    publisher={gameData.Publisher}
                                    source={gameData.Source}
                                    genre={gameData.Genre}
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
                                        showModal(<ConfEditor serverAPI={serverAPI} tabindex={tabindex} shortname={shortname} platform={"linux"} forkname={"_"} version={"_"} />);
                                        //Router.CloseSideMenus();
                                        //Router.Navigate("/conf-editor/" + tabindex + "/" + shortname + "/linux/_/_");
                                    }}
                                    bateditor={() => {
                                        showModal(<BatEditor serverAPI={serverAPI} tabindex={tabindex} shortname={shortname} />);
                                    }}
                                    hasDosConfig={gameData.HasDosConfig}
                                    hasBatFiles={gameData.HasBatFiles} />
                            </Focusable>
                        </div>
                    </Panel>
                </ScrollPanelGroup>
            </ModalRoot>
        </>
    );
};
