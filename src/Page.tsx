import { ServerAPI, useParams } from "decky-frontend-lib";
import { VFC } from "react";
import Logger from "./Utils/logger";
import { Content } from "./Content";
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

    return (
        <Content serverAPI={serverAPI} initActionSet={initActionSet} initAction={initAction} />
    );
};


