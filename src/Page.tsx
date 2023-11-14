import { ServerAPI, useParams } from "decky-frontend-lib";
import { VFC, useEffect, useState } from "react";
import { ActionSet, ContentError, ContentResult, StoreTabsContent } from "./Types/Types";
import { ErrorDisplay } from "./Components/ErrorDisplay";
import Logger from "./Utils/logger";
import { StoreTabs } from "./StoreTabs";
import { Loading } from "./Components/Loading";
import { executeAction } from "./Utils/executeAction";
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
        Type: "Empty",

    });

    useEffect(() => {
        onInit();
    }, []);

    const onInit = async () => {
        logger.debug("init");
        const data = await executeAction(serverAPI, initActionSet,
            initAction,
            {
                inputData: ""
            });
        logger.debug(data);
        const result = data.Content as ActionSet;
        const content = await executeAction(serverAPI, result.SetName,
            "GetContent",
            {
                inputData: ""
            });
        setContent(content);
        logger.debug(content);
    };

    return (
        <>
            {content.Type === "StoreTabs" && <StoreTabs serverAPI={serverAPI} tabs={content.Content as StoreTabsContent} initAction={initAction} initActionSet={initActionSet} />}
            {content.Type === "Error" && <ErrorDisplay error={content.Content as ContentError} />}
            {content.Type === "Empty" && <Loading></Loading>}
        </>
    );
};
