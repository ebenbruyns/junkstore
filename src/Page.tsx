import { ServerAPI, useParams } from "decky-frontend-lib";
import { VFC, useEffect, useState } from "react";
import { ActionSet, ContentError, ContentResult, StoreTabsContent } from "./Types";
import { ErrorDisplay } from "./ErrorDisplay";
import Logger from "./logger";
import { StoreTabs } from "./StoreTabs";
/**
 * Renders a page component that displays either a StoreTabs or an ErrorDisplay component based on the content received from the server.
 * @param {Object} props - The component props.
 * @param {ServerAPI} props.serverAPI - The server API object used to make API calls.
 * @returns {JSX.Element} - The rendered page component.
 */


export const Page: VFC<{ serverAPI: ServerAPI; }> = ({ serverAPI }) => {
    const logger = new Logger("StorePage");
    const { initActionSet, initAction } = useParams<{ initActionSet: string; initAction: string; }>();
    logger.debug(`Action Set: ${initActionSet}, Init Action: ${initAction}`);
    const [content, setContent] = useState<ContentResult>({
        Type: "Error",
        Content: {
            Title: "Error",
            Message: "Error",
            Data: "",
        }
    });

    useEffect(() => {
        onInit();
    }, []);

    const onInit = async () => {
        logger.debug("init");
        const data = await serverAPI.callPluginMethod<{}, ActionSet>("execute_action", {
            actionSet: initActionSet,
            actionName: initAction,
            inputData: ""
        });
        logger.debug(data);
        const result = data.result as ActionSet;
        const content = await serverAPI.callPluginMethod<{}, ContentResult>("execute_action", {
            actionSet: result.SetName,
            actionName: "GetContent",
            inputData: ""
        });
        setContent(content.result as ContentResult);
        logger.debug(content);
    };

    return (
        <>
            {content.Type === "StoreTabs" && <StoreTabs serverAPI={serverAPI} tabs={content.Content as StoreTabsContent} initAction={initAction} initActionSet={initActionSet} />}
            {content.Type === "Error" && <ErrorDisplay error={content.Content as ContentError} />}
        </>
    );
};
