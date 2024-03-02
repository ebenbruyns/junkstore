import { DialogButton, Focusable, Menu, MenuItem, ServerAPI, TextField, gamepadTabbedPageClasses, showContextMenu, showModal } from "decky-frontend-lib";
import { ContentResult, GameData, GameDataList, MenuAction, ScriptActions } from "../Types/Types";
import { VFC, memo, useEffect, useState } from "react";
import GameGridItem from './GameGridItem';
import { GameDetailsItem } from './GameDetailsItem';
import Logger from "../Utils/logger";
import { FaSlidersH, FaCog } from 'react-icons/fa';
import { LoginContent } from './LoginContent';
import { executeAction } from '../Utils/executeAction';
import { ConfEditor } from '../ConfEditor';
import { useCachedData } from '../hooks/useCachedData';
import { Loading } from './Loading';

export const contentTabsContainerClass = 'content-tabs-container';

interface ContentState {
    searchQuery: string;
    filterInstalled: boolean;
    limited: boolean;
    // activeGame: string;
};


function parseContentState(state: string | null): ContentState {
    if (!state || state === "") {
        return {
            searchQuery: "",
            filterInstalled: true,
            limited: true,
            // activeGame: ""
        };
    }
    return JSON.parse(state);
}

interface ContentGridProps {
    content: GameDataList;
    serverAPI: ServerAPI;
    initActionSet: string;
    initAction: string;
    actionSetName: string;
    refreshContent?: (actionArgs: { [param: string]: string; }) => Promise<void>;
}

export const GridContent: VFC<ContentGridProps> = ({ content: initialContent, serverAPI, initAction, initActionSet, actionSetName }) => {
    const logger = new Logger('ContentGrid');

    const { cacheData, setCacheData, hadCache } = useCachedData(
        initActionSet,
        initAction,
        'gridcontent',
        {
            searchQuery: "",
            filterInstalled: true,
            limited: true
        }
    );

    const [content, setContent] = useState<ContentResult>(initialContent);
    const [mounted, setMounted] = useState(false);
    const [ready, setReady] = useState(!hadCache);
    const [scriptActions, setScriptActions] = useState<MenuAction[]>([]);


    useEffect(() => {
        (async () => {
            const actionRes = await executeAction<ScriptActions>(serverAPI, actionSetName, "GetScriptActions", { inputData: "" });
            logger.debug("onInit actionRes", actionRes);
            if (!actionRes) return;
            // if (actionRes.Type === "ScriptSet") {
            const scriptActions = actionRes.Content;
            logger.debug("onInit scriptActions", scriptActions);
            setScriptActions(scriptActions.Actions);
            
        })();
        logger.log('mounted grid content');
        setMounted(true);
    }, []);

    logger.log('grid render', content, ready);
    useEffect(() => {
        if (hadCache) refreshContent(() => setReady(true));
    }, [cacheData]);



    const runScript = async (actionSet: string, actionId: string, args: any) => {
        const result = await executeAction(serverAPI, actionSet, actionId, args);
        logger.debug("runScript result", result);

    };
    const configEditor = () => {
        showModal(<ConfEditor serverAPI={serverAPI} initActionSet={actionSetName} initAction="GetTabConfigActions" contentId="0" />);
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

    const refreshContent = async (after?: () => void) => {
        logger.log('refreshing');
        const data = await executeAction<GameDataList>(serverAPI,
            actionSetName,
            "GetContent",
            {
                filter: cacheData.searchQuery,
                installed: String(cacheData.filterInstalled),
                limited: String(cacheData.limited)
            }
        );
        logger.log('refreshed', data);
        setContent(data?.Content);
        after?.();
    };

    return (!ready ? <Loading /> :
        <Focusable
            onSecondaryButton={() => setCacheData(cache => ({ ...cache, filterInstalled: !cache.filterInstalled }))}
            onOptionsButton={() => setCacheData(cache => ({ ...cache, limited: !cache.limited }))}
            onSecondaryActionDescription="Toggle Installed Filter"
            onOptionsActionDescription={cacheData.limited ? "Show All" : "Limit Results"}
            style={{ paddingTop: '15px' }}
        >
            {/* {padTop && <div style={{ marginBottom: "50px", width: "100%", height: "100%" }} />} //this should probably be changed */}
            <Focusable style={{ display: "flex", gap: '15px' }}>
                <div style={{ width: '100%' }}>
                    <TextField
                        placeholder="Search"
                        value={cacheData.searchQuery}
                        onChange={(e) => setCacheData(cache => ({ ...cache, searchQuery: e.target.value }))}
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
            {content.NeedsLogin === "true" && (
                <div style={{ paddingTop: '15px' }}>
                    <LoginContent serverAPI={serverAPI} initActionSet={actionSetName} initAction="GetLoginActions" />
                </div>
            )}
            <GridContainer
                serverAPI={serverAPI}
                games={content.Games ?? []}
                initActionSet={actionSetName}
                initAction=""

            // setActiveGame={activeGameSetter}
            // clearActiveGame={clearActiveGame}
            />
        </Focusable>
    );
};

interface GridContainerProperties {
    games: GameData[];
    serverAPI: ServerAPI;
    initActionSet: string;
    initAction: string;
    // setActiveGame: (shortname: string) => void;
    // clearActiveGame: () => void;
}

const GridContainer: VFC<GridContainerProperties> = memo(({ serverAPI, games, initActionSet, initAction, /*setActiveGame, clearActiveGame*/ }) => {
    const logger = new Logger("GridContainer");

    const imgAreaWidth = '120px';
    const imgAreaHeight = '165px';

    return (
        <>
            <style>{`
                .${contentTabsContainerClass} .${gamepadTabbedPageClasses.TabContentsScroll} {
                    scroll-padding-top: calc( var(--basicui-header-height) + 140px ) !important;
                    scroll-padding-bottom: 80px;
                }
            `}</style>
            <Focusable
                style={{
                    display: "grid",
                    justifyContent: "space-between",
                    gridGap: "16px 12px",
                    gridTemplateColumns: `repeat(auto-fill, ${imgAreaWidth})`,
                    marginTop: '15px'
                }}
                //@ts-ignore
                navEntryPreferPosition={2} //maintain x
            >
                {games.map((game: GameData) => (
                    <GameGridItem
                        gameData={game}
                        imgAreaWidth={imgAreaWidth}
                        imgAreaHeight={imgAreaHeight}
                        onClick={() => {
                            logger.debug("onClick game: ", game);
                            logger.debug("setActiveGame", game.ShortName);
                            // setActiveGame(game.ShortName);
                            showModal(<GameDetailsItem serverAPI={serverAPI} shortname={game.ShortName} initActionSet={initActionSet} initAction={initAction} clearActiveGame={() => { }} />);
                        }}
                    />
                ))}
            </Focusable>
        </>
    );
});
export default GridContainer;
