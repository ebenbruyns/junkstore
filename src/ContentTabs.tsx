/**
 * Renders a component that displays a set of tabs, each containing a StorePage component.
 * @param {Object} props - The component properties.
 * @param {ServerAPI} props.serverAPI - The server API object.
 * @param {StoreTabsContent} props.tabs - The content of the tabs.
 * @param {string} props.initActionSet - The initial action set.
 * @param {string} props.initAction - The initial action.
 * @returns {JSX.Element} - The rendered component.
 */
import { DialogBody, DialogControlsSection, ServerAPI, SidebarNavigation, SidebarNavigationPage, Tabs, joinClassNames } from "decky-frontend-lib";
import { VFC, useEffect, useState } from "react";
import { ActionSet, ContentError, ContentResult, StoreContent, StoreTabsContent } from "./Types/Types";
import Logger from "./Utils/logger";
import { executeAction } from "./Utils/executeAction";
import { Loading } from "./Components/Loading";
import { ErrorDisplay } from "./Components/ErrorDisplay";
import { GridContent, contentTabsContainerClass } from "./Components/GridContainer";
import { HtmlContent } from "./HtmlContent";
import { TextContent } from "./TextContent";
import { MainMenu } from "./MainMenu";
import { useCachedData } from './hooks/useCachedData';
interface ContentTabsProperties {
    serverAPI: ServerAPI;
    tabs: StoreTabsContent;
    initActionSet: string;
    initAction: string;
    layout: string;
    subActionSet: string;
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
};

interface ContentData {
    serverAPI: ServerAPI;
    content: Content;
    initActionSet: string;
    initAction: string;
    subActionSet: string;
}

export const ContentTabs: VFC<ContentTabsProperties> = ({ serverAPI, tabs: content, initAction, initActionSet, layout, subActionSet: actionSetName }) => {
    const logger = new Logger("StoreTabs");
    const state = localStorage.getItem(`${initActionSet}_${initAction}_tabs`);
    const savedState = parseTabsState(state);
    // logger.debug("Initial Saved state: ", savedState);
    const { cacheData, setCacheData } = useCachedData(initActionSet, initAction, 'tabs', { currentTab: "-1" });
    // const [currentTab, setCurrentTab] = useState(savedState ? savedState?.currentTab : "-1");
    // const [content, setContent] = useState<StoreTabsContent>({ Tabs: [] });
    // const [actionSetName, setActionSetName] = useState("");
    // console.log('con tabs', content, actionSetName);

    const getTabs = () => {
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
                        activeTab={cacheData.currentTab}
                        onShowTab={(tabID: string) => setCacheData({ currentTab: tabID })}
                        tabs={getTabs()}
                        //@ts-ignore
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

// function useContent() {
//     logger.debug(`Initializing Content with initActionSet: ${initActionSet} and initAction: ${initAction}`);
//     const actionSetRes = await executeAction<ActionSet>(serverAPI, initActionSet, initAction, { inputData: "" });
//     logger.debug("init result: ", actionSetRes);
//     if (!actionSetRes) return;
//     const actionSet = actionSetRes.Content;
//     logger.debug("Action set: ", actionSet);
//     const contentRes = await executeAction(serverAPI, actionSet.SetName, "GetContent", { inputData: "" });
//     setActionSetName(actionSet.SetName);
//     setContent(contentRes);
//     logger.debug("GetContent result: ", contentRes);
// }

export const Content: VFC<{ serverAPI: ServerAPI; initActionSet: string; initAction: string; padTop?: boolean; }> = ({
    serverAPI, initActionSet, initAction, padTop = true, }) => {
    const logger = new Logger("Content");
    // const state = localStorage.getItem(`${initActionSet}_${initAction}_searchquery`)
    // const savedState = parseContentState(state);
    const [content, setContent] = useState<ContentResult>({ Type: "Empty", Content: {} });
    const [actionSetName, setActionSetName] = useState<string>("");
    // const [searchQuery, setSearchQuery] = useState(savedState ? savedState?.searchQuery : "");
    // const [filterInstalled, setFilterInstalled] = useState(savedState ? savedState?.filterInstalled : true);
    // const [limited, setLimited] = useState(savedState ? savedState?.limited : true);
    // const [scriptActions, setScriptActions] = useState<MenuAction[]>([]);
    // const [activeGame, setActiveGame] = useState(savedState ? savedState?.activeGame : "");
    // console.log('content', initAction, initActionSet, actionSetName);
    // const saveState = () => {
    //     logger.debug("Saving state");
    //     const state = {
    //         searchQuery,
    //         filterInstalled,
    //         limited,
    //         activeGame
    //     };
    //     logger.debug("State: ", state);
    //     localStorage.setItem(`${initActionSet}_${initAction}_searchquery`, JSON.stringify(state));
    // };

    // const loadState = () => {
    //     logger.debug("Loading state");
    //     const savedState = localStorage.getItem(`${initActionSet}_${initAction}_searchquery`);
    //     logger.debug("Saved state: ", savedState);
    //     if (savedState) {
    //         const state = JSON.parse(savedState);
    //         setSearchQuery(state.searchQuery);
    //         setFilterInstalled(state.filterInstalled);
    //         setLimited(state.limited);
    //         setActiveGame(state.activeGame);
    //     }
    // };
    // const activeGameSetter = (shortname: string) => {
    //     logger.debug("Setting active game: ", shortname);
    //     setActiveGame(shortname);
    // }
    // const clearActiveGame = () => {
    //     logger.debug("Clearing active game");
    //     setActiveGame("");
    // }
    // useEffect(() => {
    //     logger.debug("Saving state on useEffect");
    //     saveState();
    // }
    //     , [searchQuery, filterInstalled, limited, activeGame]);

    // useEffect(() => {


    //     loadState();

    //     const handleBeforeUnload = () => {
    //         saveState();
    //     };

    //     window.addEventListener("beforeunload", handleBeforeUnload);

    //     return () => {
    //         window.removeEventListener("beforeunload", handleBeforeUnload);
    //     };
    // }, [initActionSet, initAction]);

    const getContentArgs = async (actionArgs: {[param: string]: string}) => {
            const data = await executeAction(serverAPI, actionSetName, "GetContent", actionArgs);
            logger.log('refreshed', data)
            setContent(data as ContentResult);

    };

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
            }
            catch (e){

            }
        }

    // useEffect(() => {
    //     logger.log("Content: ", content);
    //     if (content.Type !== "Empty" && content.Type !== "Error") {
    //         if (activeGame && activeGame !== "") {
    //             logger.debug("activeGame: ", activeGame);
    //             showModal(<GameDetailsItem serverAPI={serverAPI} shortname={activeGame} initActionSet={actionSetName} initAction="" clearActiveGame={clearActiveGame} />)
    //         }
    //         else {
    //             logger.debug("No active game");
    //         }
    //     }
    // }, [content]);

    // useEffect(() => {
    //     // logger.log(`Search query: ${searchQuery}, Filter installed: ${filterInstalled}, Limited: ${limited}, Action set name: ${actionSetName}`);
    //     fetchData(actionSetName);
    // }, [ actionSetName]);

    useEffect(() => {
        onInit();
        // loadState();

    }, []);

    const onInit = async () => {
        try {
            logger.debug(`Initializing Content with initActionSet: ${initActionSet} and initAction: ${initAction}`);
            const actionSetRes = await executeAction<ActionSet>(serverAPI, initActionSet, initAction, { inputData: "" });
            logger.debug("init result: ", actionSetRes);
            if (!actionSetRes) return logger.error('action result is null');
            const actionSet = actionSetRes.Content;
            logger.debug("Action set: ", actionSet);
            const contentRes = await executeAction(serverAPI, actionSet.SetName, "GetContent", { inputData: "" });
            setActionSetName(actionSet.SetName);
            setContent(contentRes);
            // logger.debug("GetContent result: ", contentRes);
            // const actionRes = await executeAction(serverAPI, result.SetName,
            //     "GetScriptActions",
            //     {
            //         inputData: ""
            //     }) as ContentResult;
            // logger.debug("onInit actionRes", actionRes);
            // if (actionRes.Type === "ScriptSet") {
            //     const scriptActions = actionRes.Content as ScriptActions;
            //     logger.debug("onInit scriptActions", scriptActions);
            //     setScriptActions(scriptActions.Actions);
            // }

        } catch (error) {
            logger.error("OnInit: ", error);
        }
    };
    // const configEditor = () => {
    //     showModal(<ConfEditor serverAPI={serverAPI} initActionSet={actionSetName} initAction="GetTabConfigActions" contentId="0" />);
    // };
    // const runScript = async (actionSet: string, actionId: string, args: any) => {
    //     const result = await executeAction(serverAPI, actionSet, actionId, args);
    //     logger.debug("runScript result", result);

    // };
    // const actionsMenu = (e: any) => {
    //     showContextMenu(
    //         <Menu label="Actions" cancelText="Cancel" onCancel={() => { }}>
    //             {scriptActions && scriptActions.length > 0 && scriptActions.map((action) => {


    //                 return (<MenuItem onSelected={
    //                     async () => {
    //                         const args = {
    //                             shortname: "",
    //                             steamClientID: "",
    //                             startDir: "",
    //                             compatToolName: "",
    //                             inputData: "",
    //                             gameId: "",
    //                             appId: ""
    //                         };

    //                         runScript(initActionSet, action.ActionId, args);

    //                     }}
    //                 >{action.Title}</MenuItem>);

    //             })}


    //         </Menu>,
    //         e.currentTarget ?? window
    //     );
    // };

    return (
        <>
            {content.Type === "GameGrid" && (
                <GridContent
                    content={content.Content}
                    serverAPI={serverAPI}
                    initAction={initAction}
                    initActionSet={initActionSet}
                    actionSetName={actionSetName}
                    refreshContent={getContentArgs}
                />
            )}
            {content.Type === "StoreTabs" &&
                <ContentTabs serverAPI={serverAPI}
                    tabs={content.Content as StoreTabsContent}
                    layout="horizontal"
                    initAction={initAction}
                    initActionSet={initActionSet}
                    subActionSet={actionSetName}
                />}
            {content.Type === "SideBarPage" &&
                <ContentTabs serverAPI={serverAPI}
                    tabs={content.Content as StoreTabsContent}
                    layout="vertical"
                    initAction={initAction}
                    initActionSet={initActionSet}
                    subActionSet={actionSetName}
                />
            }
            {content.Type === "MainMenu" &&
                <MainMenu //key={initActionSet + "_" + initAction} 
                    serverApi={serverAPI}
                    content={content.Content as StoreContent}
                    initActionSet={'MainMenu'}
                    initAction=""
                />
            }
            {content.Type === "Text" &&
                <TextContent //key={initActionSet + "_" + initAction} 
                    content={content.Content as string}
                />
            }
            {content.Type === "Html" &&
                <HtmlContent //key={initActionSet + "_" + initAction}
                    content={content.Content as string}
                />
            }
            {content.Type === "Error" &&
                <ErrorDisplay //key={initActionSet + "_" + initAction}
                    error={content.Content as ContentError}
                />
            }
            {content.Type === "Empty" && <Loading />}
        </>
    );
};


