/**
 * Renders a component that displays a set of tabs, each containing a StorePage component.
 * @param {Object} props - The component properties.
 * @param {ServerAPI} props.serverAPI - The server API object.
 * @param {StoreTabsContent} props.tabs - The content of the tabs.
 * @param {string} props.initActionSet - The initial action set.
 * @param {string} props.initAction - The initial action.
 * @returns {JSX.Element} - The rendered component.
 */
import { DialogBody, DialogControlsSection, Focusable, ServerAPI, SidebarNavigation, SidebarNavigationPage, Tabs, TextField } from "decky-frontend-lib";
import { VFC, useEffect, useState } from "react";
import { ActionSet, ContentError, ContentResult, GameDataList, StoreContent, StoreTabsContent } from "./Types/Types";
import Logger from "./Utils/logger";
import { executeAction } from "./Utils/executeAction";
import { Loading } from "./Components/Loading";
import { ErrorDisplay } from "./Components/ErrorDisplay";
import GridContainer from "./Components/GridContainer";
import { HtmlContent } from "./HtmlContent";
import { TextContent } from "./TextContent";
import { MainMenu } from "./MainMenu";
import { LoginContent } from "./Components/LoginContent";
interface ContentTabsProperties {
    serverAPI: ServerAPI;
    tabs: StoreTabsContent;
    initActionSet: string;
    initAction: string;
    layout: string;
}

export const ContentTabs: VFC<ContentTabsProperties> = ({ serverAPI, tabs, initAction, initActionSet, layout }) => {
    const logger = new Logger("StoreTabs");
    const [currentTab, setCurrentTab] = useState("-1");
    const [content, setContent] = useState<StoreTabsContent>({ Tabs: [] });
    const [actionSetName, setActionSetName] = useState("");

    useEffect(() => {
        onInit();
    }, []);

    const onInit = async () => {
        try {
            logger.debug(`Initializing StoreTabs with initActionSet: ${initActionSet} and initAction: ${initAction}`);
            if (!initActionSet || initActionSet === "" || !initAction || initAction === "") {
                logger.debug("initActionSet or initAction is empty");
                return;
            }
            const data = await executeAction(serverAPI, initActionSet,
                initAction,
                {
                    inputData: "",
                }
            );
            const result = data.Content as ActionSet;
            setActionSetName(result.SetName);
            setContent(tabs);
            setCurrentTab("0");
            logger.debug(`StoreTabs initialized with actionSetName: ${result.SetName}`);
        } catch (error) {
            logger.error(`Error initializing StoreTabs: ${error}`);
        }
    };
    const getContent = () => {
        return content.Tabs.map((tab, index) => ({
            title: tab.Title,
            content: <Content key={tab.ActionId} serverAPI={serverAPI} initActionSet={actionSetName} initAction={tab.ActionId} padTop={false} />,
            id: index.toString()
        }));
    }
    const getPages = () => {
        return content.Tabs.map((tab) => ({
            title: tab.Title,
            content: <Content key={tab.ActionId} serverAPI={serverAPI} initActionSet={actionSetName} initAction={tab.ActionId} />,
            identifier: tab.Title

        } as SidebarNavigationPage));

    }


    return (
        <DialogBody key={initActionSet + "_" + initAction}>
            {layout === "horizontal" && content.Tabs.length > 0 &&
                <DialogControlsSection key={initActionSet + "_" + initAction + "horizontal"} style={{ height: "calc(100% - 40px)" }}>
                    <div style={{ marginBottom: "40px" }} />
                    <Tabs key="0"
                        activeTab={currentTab}
                        onShowTab={(tabID: string) => setCurrentTab(tabID)}
                        tabs={getContent()}
                    />
                </DialogControlsSection>}
            {layout === "vertical" && content.Tabs.length > 0 &&
                <DialogControlsSection key={initActionSet + "_" + initAction + "vertical"} style={{ height: "calc(100%)" }}>
                    <SidebarNavigation key="1" pages={getPages()} showTitle

                    />
                </DialogControlsSection>
            }
            {content.Tabs.length === 0 && <Loading />}
        </DialogBody>
    );
};



export const Content: VFC<{ serverAPI: ServerAPI; initActionSet: string; initAction: string; padTop?: boolean; }> = ({
    serverAPI, initActionSet, initAction, padTop = true }) => {
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
            logger.debug(`Initializing Content with initActionSet: ${initActionSet} and initAction: ${initAction}`);
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


                    {padTop && <div style={{ marginBottom: "50px" }} />}
                    <Focusable //key={initActionSet + "_" + initAction}
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
                    {(content.Content as GameDataList).NeedsLogin === "true" && (
                        <LoginContent serverAPI={serverAPI} initActionSet={actionSetName} initAction="GetLoginActions" />
                    )}
                    <GridContainer
                        serverAPI={serverAPI}
                        games={(content.Content as GameDataList).Games}
                        limited={limited}
                        limitFn={() => setLimited(!limited)}
                        filterFn={() => setFilterInstalled(!filterInstalled)}
                        initActionSet={actionSetName}
                        initAction="" />
                </>
            )
            }
            {
                content.Type === "StoreTabs" &&
                <ContentTabs serverAPI={serverAPI}
                    tabs={content.Content as StoreTabsContent}
                    layout="horizontal"
                    initAction={initAction}
                    initActionSet={initActionSet} />
            }
            {
                content.Type === "SideBarPage" &&
                <ContentTabs serverAPI={serverAPI}
                    tabs={content.Content as StoreTabsContent}
                    layout="vertical"
                    initAction={initAction}
                    initActionSet={initActionSet} />
            }
            {
                content.Type === "MainMenu" &&
                <MainMenu //key={initActionSet + "_" + initAction} 
                    serverApi={serverAPI}
                    content={content.Content as StoreContent}
                    initActionSet={actionSetName} initAction="" />
            }
            {
                content.Type === "Text" &&
                <TextContent //key={initActionSet + "_" + initAction} 
                    content={content.Content as string} />
            }
            {
                content.Type === "Html" &&
                <HtmlContent //key={initActionSet + "_" + initAction}
                    content={content.Content as string} />
            }

            {
                content.Type === "Error" &&
                <ErrorDisplay //key={initActionSet + "_" + initAction}
                    error={content.Content as ContentError} />
            }
            {
                content.Type === "Empty" &&
                <Loading />
            }
        </>
    );
};


