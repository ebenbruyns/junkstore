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
import { ActionSet, ContentError } from "./Types/Types";
import { ContentResult, StoreContent } from "./Types/Types";
import { ErrorDisplay } from "./Components/ErrorDisplay";
import { MainMenu } from "./MainMenu";
import Logger from "./Utils/logger";
import { Loading } from "./Components/Loading";
import { executeAction } from "./executeAction";

export const Content: VFC<{ serverAPI: ServerAPI; initActionSet: string; initAction: string; }> = ({ serverAPI, initActionSet, initAction }) => {
    const logger = new Logger("index");
    const [content, setContent] = useState<ContentResult>({ Type: "Empty", Content: {} });
    const [actionSetName, setActionSetName] = useState<string>("");

    useEffect(() => {
        onInit();
    }, []);

    const onInit = async () => {
        try {
            logger.debug("init");
            const data = await executeAction(serverAPI, initActionSet,
                initAction,
                {
                    inputData: ""
                });
            logger.debug("init result: ", data);
            const result = data.Content as ActionSet;
            setActionSetName(result.SetName);
            const menu = await executeAction(serverAPI, result.SetName,
                "GetContent",
                {
                    inputData: ""
                });
            setContent(menu);
            logger.debug("GetContent result: ", menu);
        } catch (error) {
            logger.error("OnInit: ", error);
        }
    };

    return (
        <>
            {content.Type === "MainMenu" && <MainMenu content={content.Content as StoreContent} initActionSet={actionSetName} initAction="" />}
            {content.Type === "Error" && <ErrorDisplay error={content.Content as ContentError} />}
            {content.Type === "Empty" && <Loading />}
        </>
    );
};
