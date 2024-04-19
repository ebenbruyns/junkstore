import { VFC, useEffect, useState } from "react";
import { executeAction } from "./Utils/executeAction";
import { getAppDetails } from './Utils/utils';
import { ActionSet, ExecuteGetExeActionSetArgs, ExecuteGetFilesDataArgs, ExecuteRunBinaryArgs, FilesData, SaveRefresh } from "./Types/Types";
import { DialogButton, ModalRoot, PanelSection, ScrollPanelGroup, SteamSpinner } from "decky-frontend-lib";
import Logger from "./Utils/logger";
import { gameIDFromAppID } from "./Utils/utils";
import { EditorProperties } from './Types/EditorProperties';

const exeRunnerRootClass = 'exe-runner-modal-root';
export interface ExeRunnerProperties extends EditorProperties {
    shortName: string;
    onExeExit: () => void;
}

export const ExeRunner: VFC<ExeRunnerProperties> = ({
    serverAPI, initActionSet, initAction, contentId, closeModal, shortName, refreshParent, onExeExit
}) => {
    const logger = new Logger("ExeRunner");
    const [actionSetName, setActionSetName] = useState("" as string);
    const [filesData, setFilesData] = useState<FilesData>({ Files: [] } as FilesData);
    const [busy, setBusy] = useState(false);
    const OnInit = async () => {
        logger.debug("OnInit");
        logger.debug("initActionSet: ", initActionSet);
        logger.debug("initAction: ", initAction);
        logger.debug("contentId: ", contentId);
        const gameId = gameIDFromAppID(parseInt(contentId));
        const actionSetResult = await executeAction<ExecuteGetExeActionSetArgs, ActionSet>(
            serverAPI, initActionSet,
            initAction,

            {
                gameId: String(gameId),
                appId: String(contentId),
                content_id: contentId,
            }
        );
        const setName = actionSetResult?.Content.SetName;
        if (setName == null) {
            logger.error("setName is null");
            return;
        }

        logger.debug("setName: ", setName);
        logger.debug("result: ", actionSetResult);
        const details = await getAppDetails(contentId);
        if (details == null) {
            logger.error("details is null"); return;

        }
        else {

            const filesDataResult = await executeAction<ExecuteGetFilesDataArgs, FilesData>(serverAPI, setName,
                "GetContent",
                {

                    gameId: String(gameId),
                    appId: String(contentId),
                    SteamClientId: contentId,
                    shortName: shortName
                });
            if (filesDataResult?.Content == null) {
                logger.error("res is null");
                return;
            }
            logger.debug("FilesData: ", filesDataResult?.Content);
            setActionSetName(setName);
            setFilesData(filesDataResult?.Content);
        }

    };
    useEffect(() => {
        OnInit();
    }, []);
    return (
        <>
            <style>
                {`
    .${exeRunnerRootClass}.GenericConfirmDialog {
        width: 100% !important,
        height: 100% !important,
    }
`} </style>
            <ModalRoot
                className={exeRunnerRootClass}
                bAllowFullSize={true}
                closeModal={closeModal}
            >
                <div>Select executable to run</div>
                {busy && <SteamSpinner />}


                {!busy && filesData.Files && filesData.Files.map((file) => {
                    const runExe = async () => {
                        setBusy(true);
                        logger.debug(`steamclientid ${contentId}`);
                        const appDetails = getAppDetails(contentId);
                        logger.debug("app details: ", appDetails);
                        if (appDetails == null) {
                            logger.error("app details is null");
                            return;
                        }

                        const compatToolName = appDetails.strCompatToolName;
                        const startDir = appDetails.strShortcutStartDir;

                        const gameExe = file.Path.startsWith(startDir) ? file.Path.substring(startDir.length + 1) : file.Path;
                        const gameId = gameIDFromAppID(parseInt(contentId));
                        const result = await executeAction<ExecuteRunBinaryArgs, SaveRefresh>(
                            serverAPI,
                            actionSetName,
                            "RunBinary",
                            {
                                gameId: String(gameId),
                                appId: String(contentId),
                                SteamClientId: contentId,
                                shortName: shortName,
                                GameExe: gameExe.replace("\\", "\\\\"),
                                AdditionalArguments: false,
                                CompatToolName: compatToolName

                            },
                            onExeExit
                        );
                        if (result?.Type === "Refresh") {
                            const tmp = result.Content as SaveRefresh;
                            if (tmp.Refresh) {
                                refreshParent();
                            }
                        }
                        closeModal();
                        setBusy(false);
                    };

                    const setExecutable = () => {
                        logger.debug(`steamclientid ${parseInt(contentId)}`);
                        SteamClient.Apps.SetShortcutExe(parseInt(contentId), file.Path);
                        closeModal();
                    };
                    return (
                        <ScrollPanelGroup
                            focusable={false} style={{ margin: "0px" }}>
                            <PanelSection>
                                <DialogButton
                                    onOKButton={runExe}
                                    onClick={runExe}
                                    onSecondaryButton={setExecutable}
                                    onSecondaryActionDescription="Set game executable">
                                    {file.Path}
                                </DialogButton>
                            </PanelSection>
                        </ScrollPanelGroup >
                    );
                })}
            </ModalRoot >
        </>
    );
};
