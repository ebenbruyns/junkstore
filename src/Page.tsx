import { DialogBody, DialogControlsSection, ServerAPI, SidebarNavigation, useParams } from "decky-frontend-lib";
import { VFC, useEffect, useState } from "react";
import { ActionSet, ContentError, ContentResult, StoreContent, StoreTabsContent } from "./Types/Types";
import { ErrorDisplay } from "./Components/ErrorDisplay";
import { Loading } from "./Components/Loading";
import { executeAction } from "./Utils/executeAction";
import Logger from "./Utils/logger";
import { MainMenu } from "./MainMenu";
import { StoreTabs } from "./StoreTabs";
/**
 * Renders a page component that displays either a StoreTabs or an ErrorDisplay component based on the content received from the server.
 * @param {Object} props - The component props.
 * @param {ServerAPI} props.serverAPI - The server API object used to make API calls.
 * @returns {JSX.Element} - The rendered page component.
 */

export const SideBarPage: VFC<{ serverAPI: ServerAPI; initActionSet: string; initAction: string; }> = ({ serverAPI, initAction, initActionSet }) => {
    const logger = new Logger("SideBarPage");
    logger.debug(`Action Set: ${initActionSet}, Init Action: ${initAction}`);
    const pages = [

        {
            title: "Preparing...",
            content: (
                <div>
                    Hang tight! We're preparing your Wine Cellar experience. If this is
                    taking longer than expected, the backend might be having a siesta.
                </div>
            ),
            // route: "/store/preparing",
        },
        {
            title: "About...",
            content: (
                <div>
                    Somethign else
                </div>
            ),
            //  route: "/store/about",
        }

    ]
    const OnInit = async () => {
        const data = await executeAction(serverAPI, initActionSet,
            initAction,
            {
                inputData: ""
            });
        const result = data.Content as ActionSet;
        const content = await executeAction(serverAPI, result.SetName,
            "GetContent",
            {
                inputData: ""
            });
        setContent(content);
    }
    const [content, setContent] = useState<ContentResult>({
        Type: "Empty",

    });
    useEffect(() => {
        OnInit();
    }, []);


    return (
        <DialogBody>
            <DialogControlsSection style={{ height: "100%" }}>

                {content.Type === "Error" && <ErrorDisplay error={content.Content as ContentError} />}
                {content.Type === "Empty" && <Loading></Loading>}
                {content.Type === "SideBarPage" && <SidebarNavigation pages={pages} />}
            </DialogControlsSection>
        </DialogBody>
    );
}



export const Page: VFC<{ serverAPI: ServerAPI; }> = ({ serverAPI }) => {
    const logger = new Logger("StorePage");
    const { initActionSet, initAction } = useParams<{ initActionSet: string; initAction: string; }>();
    logger.debug(`Action Set: ${initActionSet}, Init Action: ${initAction}`);

    return (
        <Content serverAPI={serverAPI} initActionSet={initActionSet} initAction={initAction} />
    );
};

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
            {content.Type === "StoreTabs" &&
                <StoreTabs serverAPI={serverAPI}
                    tabs={content.Content as StoreTabsContent}
                    initAction={initAction}
                    initActionSet={initActionSet} />}
            {content.Type === "SideBarPage" &&
                <SideBarPage serverAPI={serverAPI}
                    initAction={initAction}
                    initActionSet={initActionSet} />}
            {content.Type === "MainMenu" &&
                <MainMenu content={content.Content as StoreContent}
                    initActionSet={actionSetName} initAction="" />}
            {content.Type === "Error" &&
                <ErrorDisplay error={content.Content as ContentError} />}
            {content.Type === "Empty" &&
                <Loading />}
        </>
    );
};

