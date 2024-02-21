import { VFC, useEffect, useState } from "react";
import { ExeRunnerProperties } from "./Types/EditorProperties";
import { executeAction, getAppDetails } from "./Utils/executeAction";
import { ActionSet, FilesData, SaveRefresh } from "./Types/Types";
import { DialogButton, ModalRoot, PanelSection, ScrollPanelGroup, SteamSpinner } from "decky-frontend-lib";
import Logger from "./Utils/logger";
import { gameIDFromAppID } from "./Utils/gameIDFromAppID";


export const ExeRunner: VFC<ExeRunnerProperties> = ({
    serverAPI, initActionSet, initAction, contentId, closeModal, shortName, closeParent, refreshParent
}) => {
    const logger = new Logger("ExeRunner");
    const [actionSetName, setActionSetName] = useState("" as string);
    const [filesData, setFilesData] = useState({} as FilesData);
    const [busy, setBusy] = useState(false);
    const OnInit = async () => {
        logger.debug("OnInit");
        logger.debug("initActionSet: ", initActionSet);
        logger.debug("initAction: ", initAction);
        logger.debug("contentId: ", contentId);
        const gameId = gameIDFromAppID(parseInt(contentId))
        const result = await executeAction(
            serverAPI, initActionSet,
            initAction,

            {
                gameId: String(gameId),
                appId: String(contentId),
                content_id: contentId,
            }
        )
        const setName = (result.Content as ActionSet).SetName;
        setActionSetName(setName);
        logger.debug("setName: ", setName);
        logger.debug("result: ", result);
        // @ts-ignore
        const id = parseInt(contentId)
        const details = await getAppDetails(id)
        // @ts-ignore
        if (details == null) {
            logger.error("details is null"); return;

        }
        else {

            const data = await executeAction(serverAPI, setName,
                "GetContent",
                {

                    gameId: String(gameId),
                    appId: String(contentId),
                    SteamClientId: contentId,
                    shortName: shortName
                })
            const res = (data.Content as FilesData);
            logger.debug("FilesData: ", res);
            setFilesData(res);
        }

    }
    useEffect(() => {
        OnInit();
    }, []);
    return (
        <>
            <style>
                {`
    .GenericConfirmDialog {
        width: 100% !important,
        height: 100% !important,
    }
`} </style>
            <ModalRoot
                bAllowFullSize={true}
                // @ts-ignore
                bAllowFullSizeMobile={true}
                closeModal={closeModal}
            >
                <div>Select executable to run</div>
                {busy && <SteamSpinner />}


                {!busy && filesData.Files && filesData.Files.map((file) => {
                    const runExe = async () => {
                        setBusy(true);
                        logger.debug(`steamclientid ${parseInt(contentId)}`)
                        // @ts-ignore
                        const compatToolName = appDetailsStore.GetAppData(Number(contentId)).details.strCompatToolName
                        //@ts-ignore
                        const startDir = appDetailsStore.GetAppData(parseInt(contentId)).details.strShortcutStartDir
                        const gameExe = file.Path.startsWith(startDir) ? file.Path.substring(startDir.length + 1) : file.Path
                        const gameId = gameIDFromAppID(parseInt(contentId))
                        const result = await executeAction(serverAPI, actionSetName, "RunBinary"
                            , {
                                gameId: String(gameId),
                                appId: String(contentId),
                                SteamClientID: contentId,
                                GameShortname: shortName,
                                GameExe: gameExe,

                                AdditionalArguments: false,
                                CompatToolName: compatToolName

                            });
                        if (result.Type === "Refresh") {
                            const tmp = result.Content as SaveRefresh
                            if (tmp.Refresh) {
                                refreshParent()
                            }
                        }
                        closeModal();
                        closeParent();
                        setBusy(false);
                    }

                    const setExecutable = async () => {
                        logger.debug(`steamclientid ${parseInt(contentId)}`)
                        await SteamClient.Apps.SetShortcutExe(parseInt(contentId), file.Path);
                        closeModal();
                    }
                    return (
                        <ScrollPanelGroup
                            // @ts-ignore
                            focusable={false} style={{ margin: "0px" }}>
                            <PanelSection>
                                <DialogButton onOKButton={runExe} onClick={runExe} onSecondaryButton={setExecutable} onSecondaryActionDescription="Set game executable">{file.Path}</DialogButton>
                            </PanelSection>
                        </ScrollPanelGroup >)
                })
                }






            </ModalRoot >
        </>
    );

};
