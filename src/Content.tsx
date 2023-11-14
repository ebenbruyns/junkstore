import { Focusable, ServerAPI, TextField } from "decky-frontend-lib";
import { useState, useEffect, VFC } from "react";
import { ErrorDisplay } from "./Components/ErrorDisplay";
import GridContainer from "./Components/GridContainer";
import { Loading } from "./Components/Loading";
import { MainMenu } from "./MainMenu";
import { ContentTabs } from "./ContentTabs";
import { ActionSet, ContentError, ContentResult, GameDataList, StoreContent, StoreTabsContent } from "./Types/Types";
import { executeAction } from "./Utils/executeAction";
import Logger from "./Utils/logger";

export const Content: VFC<{ serverAPI: ServerAPI; initActionSet: string; initAction: string; }> = ({ serverAPI, initActionSet, initAction }) => {
    const logger = new Logger("index");
    const [content, setContent] = useState<ContentResult>({ Type: "Empty", Content: {} });
    const [actionSetName, setActionSetName] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");
    const [filterInstalled, setFilterInstalled] = useState(false);
    const [limited, setLimited] = useState(true);

    const fetchData = async (setName: string, filter: string, installed: boolean, limited: boolean) => {
        if (!setName) return;
        try {
            const data = await executeAction(serverAPI, setName,
                "GetContent",
                {
                    filter,
                    installed: String(installed),
                    limited: String(limited)
                });
            setContent(data as ContentResult);
        } catch (error) {
            logger.error("GetContent: ", error);
        }
    };
    useEffect(() => {
        logger.log("Content: ", content);
    }, [content]);

    useEffect(() => {
        logger.log(`Search query: ${searchQuery}, Filter installed: ${filterInstalled}, Limited: ${limited}, Action set name: ${actionSetName}`);
        fetchData(actionSetName, searchQuery, filterInstalled, limited);
    }, [searchQuery, filterInstalled, limited, actionSetName]);

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

            {content.Type === "GameGrid" && (
                <>
                    <Focusable
                        // @ts-ignore
                        focusableIfNoChildren
                        style={{ marginBottom: "20px" }}
                        onSecondaryActionDescription="Toggle Installed Filter"
                        onSecondaryButton={() => setFilterInstalled(!filterInstalled)}
                        onOptionsActionDescription={limited ? "Show All" : "Limit Results"}
                        onOptionsButton={() => setLimited(!limited)}
                    >
                        <TextField
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)} />
                    </Focusable>

                    <GridContainer
                        serverAPI={serverAPI}
                        games={(content.Content as GameDataList).Games}
                        limited={limited}
                        limitFn={() => setLimited(!limited)}
                        filterFn={() => setFilterInstalled(!filterInstalled)}
                        initActionSet={actionSetName}
                        initAction="" />
                </>
            )}
            {content.Type === "StoreTabs" &&
                <ContentTabs serverAPI={serverAPI}
                    tabs={content.Content as StoreTabsContent}
                    layout="horizontal"
                    initAction={initAction}
                    initActionSet={initActionSet} />}
            {content.Type === "SideBarPage" &&
                <ContentTabs serverAPI={serverAPI}
                    tabs={content.Content as StoreTabsContent}
                    layout="vertical"
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

