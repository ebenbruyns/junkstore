import { DialogBody, DialogButton, DialogControlsSection, Focusable, Menu, MenuItem, ServerAPI, SidebarNavigation, SidebarNavigationPage, Tabs, TextField, joinClassNames, showContextMenu, showModal } from "decky-frontend-lib";
import { VFC, useEffect, useState } from "react";
import { ActionSet, ContentError, ContentResult, ContentType, ExecuteArgs, ExecuteGetContentArgs, GameDataList, MenuAction, ScriptActions, StoreContent, StoreTabsContent } from "./Types/Types";
import Logger from "./Utils/logger";
import { executeAction } from "./Utils/executeAction";
import { Loading } from "./Components/Loading";
import { ErrorDisplay } from "./Components/ErrorDisplay";
import GridContainer, { contentTabsContainerClass } from "./Components/GridContainer";
import { HtmlContent } from "./HtmlContent";
import { TextContent } from "./TextContent";
import { MainMenu } from "./MainMenu";
import { LoginContent } from "./Components/LoginContent";
import { ConfEditor } from "./ConfEditor";
import { FaCog, FaSlidersH } from "react-icons/fa";
import { GameDetailsItem } from "./Components/GameDetailsItem";

interface ContentTabsProperties {
    serverAPI: ServerAPI;
    tabs: StoreTabsContent;
    initActionSet: string;
    initAction: string;
    layout: string;
}
export interface StoreTabsState {
    currentTab: string;
}

export const parseTabsState = (state: string | null): StoreTabsState => {
    if (!state || state === "") {
        return {
            currentTab: "-1"
        };
    }
    return JSON.parse(state) as StoreTabsState;
}

export const ContentTabs: VFC<ContentTabsProperties> = ({ serverAPI, tabs, initAction, initActionSet, layout }) => {
    const logger = new Logger("StoreTabs");
    const state = localStorage.getItem(`${initActionSet}_${initAction}_tabs`)
    const savedState = parseTabsState(state);
    logger.debug("Initial Saved state: ", savedState);
    const [currentTab, setCurrentTab] = useState(savedState ? savedState?.currentTab : "-1");
    const [content, setContent] = useState<StoreTabsContent>({ Tabs: [] });
    const [actionSetName, setActionSetName] = useState("");

    const saveState = () => {
        if (currentTab !== undefined) {
            const state = {
                currentTab
            };
            logger.debug("Saving state: ", state);
            localStorage.setItem(`${initActionSet}_${initAction}_tabs`, JSON.stringify(state));
        }

    };

    const loadState = () => {
        const savedState = localStorage.getItem(`${initActionSet}_${initAction}_tabs`);
        logger.debug("Loading state: ", savedState);
        if (savedState) {
            const state = JSON.parse(savedState);
            setCurrentTab(state.currentTab);
        }
    };
    useEffect(() => {
        saveState();
    }, [currentTab]);
    useEffect(() => {


        loadState();

        const handleBeforeUnload = () => {
            saveState();
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [initActionSet, initAction]);

    useEffect(() => {
        onInit();
        loadState();
    }, []);

    const onInit = async () => {
        try {
            logger.debug(`Initializing StoreTabs with initActionSet: ${initActionSet} and initAction: ${initAction}`);
            if (!initActionSet || initActionSet === "" || !initAction || initAction === "") {
                logger.debug("initActionSet or initAction is empty");
                return;
            }
            const data = await executeAction<ExecuteArgs, ActionSet>(serverAPI, initActionSet,
                initAction,
                {

                }
            );
            const result = data?.Content as ActionSet;
            setActionSetName(result.SetName);
            setContent(tabs);
            //setCurrentTab("0");
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
    };
    const getPages = () => {
        return content.Tabs.map((tab) => ({
            title: tab.Title,
            content: <Content key={tab.ActionId} serverAPI={serverAPI} initActionSet={actionSetName} initAction={tab.ActionId} />,
            identifier: tab.Title

        } as SidebarNavigationPage));

    };


    return (
        <DialogBody key={initActionSet + "_" + initAction}>
            {layout === "horizontal" && content.Tabs.length > 0 &&
                <DialogControlsSection
                    className={joinClassNames(contentTabsContainerClass, 'gamepadlibrary_GamepadLibrary_ZBBhe')}
                    key={initActionSet + "_" + initAction + "horizontal"}
                >
                    <Tabs
                        key="0"
                        activeTab={currentTab}
                        onShowTab={(tabID: string) => setCurrentTab(tabID)}
                        tabs={getContent()}
                        canBeHeaderBackground={'on-outer-scroll'}
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

export interface ContentState {
    searchQuery: string;
    filterInstalled: boolean;
    limited: boolean;
    activeGame: string;
};

export const parseContentState = (state: string | null): ContentState => {
    if (!state || state === "") {
        return {
            searchQuery: "",
            filterInstalled: true,
            limited: true,
            activeGame: ""
        };
    }
    return JSON.parse(state) as ContentState;
}

export const Content: VFC<{ serverAPI: ServerAPI; initActionSet: string; initAction: string; padTop?: boolean; }> = ({
    serverAPI, initActionSet, initAction, padTop = true }) => {
    const logger = new Logger("Content");
    const state = localStorage.getItem(`${initActionSet}_${initAction}_searchquery`)
    const savedState = parseContentState(state);
    const [content, setContent] = useState<null | ContentResult<ContentType | string>>({ Type: "Empty", Content: "" });
    const [actionSetName, setActionSetName] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState(savedState ? savedState?.searchQuery : "");
    const [filterInstalled, setFilterInstalled] = useState(savedState ? savedState?.filterInstalled : true);
    const [limited, setLimited] = useState(savedState ? savedState?.limited : true);
    const [scriptActions, setScriptActions] = useState<MenuAction[]>([]);
    const [activeGame, setActiveGame] = useState(savedState ? savedState?.activeGame : "");
    const saveState = () => {
        logger.debug("Saving state");
        const state = {
            searchQuery,
            filterInstalled,
            limited,
            activeGame
        };
        logger.debug("State: ", state);
        localStorage.setItem(`${initActionSet}_${initAction}_searchquery`, JSON.stringify(state));
    };

    const loadState = () => {
        logger.debug("Loading state");
        const savedState = localStorage.getItem(`${initActionSet}_${initAction}_searchquery`);
        logger.debug("Saved state: ", savedState);
        if (savedState) {
            const state = JSON.parse(savedState);
            setSearchQuery(state.searchQuery);
            setFilterInstalled(state.filterInstalled);
            setLimited(state.limited);
            setActiveGame(state.activeGame);
        }
    };
    const activeGameSetter = (shortname: string) => {
        logger.debug("Setting active game: ", shortname);
        setActiveGame(shortname);
    }
    const clearActiveGame = () => {
        logger.debug("Clearing active game");
        setActiveGame("");
    }
    useEffect(() => {
        logger.debug("Saving state on useEffect");
        saveState();
    }
        , [searchQuery, filterInstalled, limited, activeGame]);

    useEffect(() => {


        loadState();

        const handleBeforeUnload = () => {
            saveState();
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [initActionSet, initAction]);

    const fetchData = async (setName: string, filter: string, installed: boolean, limited: boolean) => {
        if (!setName) {
            return;
        }
        try {
            const data = await executeAction<ExecuteGetContentArgs, ContentType | string>(serverAPI, setName,
                "GetContent",
                {
                    filter,
                    installed: String(installed),
                    limited: String(limited)
                });
            setContent(data);
        } catch (error) {
            logger.error("GetContent: ", error);
        }
    };
    useEffect(() => {
        logger.log("Content: ", content);
        if (content?.Type !== "Empty" && content?.Type !== "Error") {
            if (activeGame && activeGame !== "") {
                logger.debug("activeGame: ", activeGame);
                showModal(<GameDetailsItem serverAPI={serverAPI} shortname={activeGame} initActionSet={actionSetName} initAction="" clearActiveGame={clearActiveGame} />)
            }
            else {
                logger.debug("No active game");
            }
        }
    }, [content]);

    useEffect(() => {
        logger.log(`Search query: ${searchQuery}, Filter installed: ${filterInstalled}, Limited: ${limited}, Action set name: ${actionSetName}`);
        fetchData(actionSetName, searchQuery, filterInstalled, limited);
    }, [searchQuery, filterInstalled, limited, actionSetName]);

    useEffect(() => {
        onInit();
        loadState();

    }, []);

    const onInit = async () => {
        try {
            logger.debug(`Initializing Content with initActionSet: ${initActionSet} and initAction: ${initAction}`);
            const data = await executeAction<ExecuteArgs, ScriptActions>(serverAPI, initActionSet,
                initAction,
                {

                });
            logger.debug("init result: ", data);
            const result = data?.Content as ActionSet;
            setActionSetName(result.SetName);
            const menu = await executeAction<ExecuteArgs, MenuAction>(serverAPI, result.SetName,
                "GetContent",
                {
                    inputData: ""
                });
            setContent(menu);
            logger.debug("GetContent result: ", menu);
            const actionRes = await executeAction<ExecuteArgs, ScriptActions>(serverAPI, result.SetName,
                "GetScriptActions",
                {
                    inputData: ""
                });
            logger.debug("onInit actionRes", actionRes);
            if (actionRes?.Type === "ScriptSet") {
                const scriptActions = actionRes.Content as ScriptActions;
                logger.debug("onInit scriptActions", scriptActions);
                setScriptActions(scriptActions.Actions);
            }

        } catch (error) {
            logger.error("OnInit: ", error);
        }
    };
    const configEditor = () => {
        showModal(<ConfEditor serverAPI={serverAPI} initActionSet={actionSetName} initAction="GetTabConfigActions" contentId="0" refreshParent={() => { }} />);
    };
    const runScript = async (actionSet: string, actionId: string, args: any) => {
        const result = await executeAction(serverAPI, actionSet, actionId, args);
        logger.debug("runScript result", result);

    };
    const actionsMenu = (e: any) => {
        showContextMenu(
            <Menu label="Actions" cancelText="Cancel" onCancel={() => { }}>
                {scriptActions && scriptActions.length > 0 && scriptActions.map((action) => {


                    return (<MenuItem onSelected={
                        async () => {
                            const args = {
                                shortname: "",
                                steamClientID: "",
                                startDir: "",
                                compatToolName: "",
                                inputData: "",
                                gameId: "",
                                appId: ""
                            };

                            runScript(initActionSet, action.ActionId, args);

                        }}
                    >{action.Title}</MenuItem>);

                })}


            </Menu>,
            e.currentTarget ?? window
        );
    };

    return (
        <>
            {content?.Type === "GameGrid" && (
                <Focusable
                    onSecondaryButton={() => setFilterInstalled(!filterInstalled)}
                    onOptionsButton={() => setLimited(!limited)}
                    onSecondaryActionDescription="Toggle Installed Filter"
                    onOptionsActionDescription={limited ? "Show All" : "Limit Results"}
                    style={{ paddingTop: '15px' }}
                >
                    {padTop && <div style={{ marginBottom: "50px", width: "100%", height: "100%" }} />} {/*this should probably be changed*/}
                    <Focusable style={{ display: "flex", gap: '15px' }}>
                        <div style={{ width: '100%' }}>
                            <TextField
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <DialogButton
                            onClick={actionsMenu}
                            onOKButton={actionsMenu}
                            style={{ width: "48px", minWidth: 'initial', padding: 'initial' }}
                        >
                            <FaSlidersH style={{ verticalAlign: 'middle' }} />
                        </DialogButton>
                        <DialogButton
                            onClick={configEditor}
                            onOKButton={configEditor}
                            style={{ width: "48px", minWidth: 'initial', padding: 'initial' }}
                        >
                            <FaCog style={{ verticalAlign: 'middle' }} />
                        </DialogButton>
                    </Focusable>
                    {(content.Content as GameDataList).NeedsLogin === "true" && (
                        <div style={{ paddingTop: '15px' }}>
                            <LoginContent serverAPI={serverAPI} initActionSet={actionSetName} initAction="GetLoginActions" />
                        </div>
                    )}
                    <GridContainer
                        serverAPI={serverAPI}
                        games={(content.Content as GameDataList).Games}
                        initActionSet={actionSetName}
                        initAction=""

                        setActiveGame={activeGameSetter}
                        clearActiveGame={clearActiveGame}
                    />
                </Focusable>
            )}
            {content?.Type === "StoreTabs" &&
                <ContentTabs serverAPI={serverAPI}
                    tabs={content.Content as StoreTabsContent}
                    layout="horizontal"
                    initAction={initAction}
                    initActionSet={initActionSet}
                />}
            {content?.Type === "SideBarPage" &&
                <ContentTabs serverAPI={serverAPI}
                    tabs={content.Content as StoreTabsContent}
                    layout="vertical"
                    initAction={initAction}
                    initActionSet={initActionSet}
                />
            }
            {content?.Type === "MainMenu" &&
                <MainMenu //key={initActionSet + "_" + initAction} 
                    serverApi={serverAPI}
                    content={content.Content as StoreContent}
                    initActionSet={actionSetName}
                    initAction=""
                />
            }
            {content?.Type === "Text" &&
                <TextContent //key={initActionSet + "_" + initAction} 
                    content={content.Content as string}
                />
            }
            {content?.Type === "Html" &&
                <HtmlContent //key={initActionSet + "_" + initAction}
                    content={content.Content as string}
                />
            }
            {content?.Type === "Error" &&
                <ErrorDisplay //key={initActionSet + "_" + initAction}
                    error={content.Content as ContentError}
                />
            }
            {content?.Type === "Empty" && <Loading />}
        </>
    );
};


