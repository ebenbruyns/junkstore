/**
 * Renders the content of the Junk Store plugin.
 * @param {Object} props - The component props.
 * @param {ServerAPI} props.serverAPI - The server API object.
 * @param {string} props.initActionSet - The initial action set to execute.
 * @param {string} props.initAction - The initial action to execute.
 * @returns {JSX.Element} - The JSX element to render.
 */
import { ServerAPI } from "decky-frontend-lib";
import { useEffect, useState, VFC } from "react";
import { ActionSet, ContentError } from "./Types";
import { ContentResult, StoreContent } from "./Types";
import { ErrorDisplay } from "./ErrorDisplay";
import { MainMenu } from "./MainMenu";
import Logger from "./logger";

export const Content: VFC<{ serverAPI: ServerAPI; initActionSet: string; initAction: string; }> = ({ serverAPI, initActionSet, initAction }) => {
    const logger = new Logger("index");
    const [content, setContent] = useState<ContentResult>({ Type: "", Content: {} });
    const [actionSetName, setActionSetName] = useState<string>("");

    useEffect(() => {
        onInit();
    }, []);

    const onInit = async () => {
        try {
            logger.debug("init");
            const data = await serverAPI.callPluginMethod<{}, ActionSet>("execute_action", {
                actionSet: initActionSet,
                actionName: initAction,
                inputData: ""
            });
            logger.debug("init result: ", data);
            const result = data.result as ActionSet;
            setActionSetName(result.SetName);
            const content = await serverAPI.callPluginMethod<{}, ContentResult>("execute_action", {
                actionSet: result.SetName,
                actionName: "GetContent",
                inputData: ""
            });
            setContent(content.result as ContentResult);
            logger.debug("GetContent result: ", content);
        } catch (error) {
            logger.error("OnInit: ", error);
        }
    };

    return (
        <>
            {content.Type === "MainMenu" && <MainMenu content={content.Content as StoreContent} initActionSet={actionSetName} initAction="" />}
            {content.Type === "Error" && <ErrorDisplay error={content.Content as ContentError} />}
        </>
    );
};
