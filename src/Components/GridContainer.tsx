import { DialogButton, Focusable, Menu, MenuItem, ServerAPI, Spinner, TextField, gamepadTabbedPageClasses, showContextMenu, showModal } from "decky-frontend-lib";
import { GameData, GameDataList, MenuAction, ScriptActions } from "../Types/Types";
import { Dispatch, SetStateAction, VFC, memo, useEffect, useState } from "react";
import GameGridItem from './GameGridItem';
import { GameDetailsItem } from './GameDetailsItem';
import Logger from "../Utils/logger";
import { FaSlidersH, FaCog } from 'react-icons/fa';
import { LoginContent } from './LoginContent';
import { executeAction } from '../Utils/executeAction';
import { ConfEditor } from '../ConfEditor';

export const contentTabsContainerClass = 'content-tabs-container';
export const gridContentContainerClass = 'grid-content-container';

interface GridContentArgs {
    filter?: string;
    installed?: boolean;
    limited?: boolean;
}

interface GridContentCache {
    filter: string;
    installed: boolean;
}

interface GridContentProps {
    content: GameDataList;
    serverAPI: ServerAPI;
    initActionSet: string;
    refreshContent: (actionArgs: GridContentArgs, onFinish?: () => void) => void;
    argsCache: GridContentCache;
    setArgsCache: Dispatch<SetStateAction<GridContentCache>>;
}

export const GridContent: VFC<GridContentProps> = ({ content, serverAPI, initActionSet, refreshContent, argsCache, setArgsCache }) => {
    const logger = new Logger('ContentGrid');
    const [isLimited, setIsLimited] = useState(true);
    const [isLimitedLoading, setIsLimitedLoading] = useState(false);
    const [installedFilterLoading, setInstalledLoading] = useState(false);
    const [scriptActions, setScriptActions] = useState<MenuAction[] | null>();

    useEffect(() => {
        (async () => {
            try {
                const actionRes = await executeAction<ScriptActions>(serverAPI, initActionSet, "GetScriptActions", { inputData: "" });
                logger.debug("onInit actionRes", actionRes);
                if (!actionRes) {
                    return;
                }
                // if (actionRes.Type === "ScriptSet") {
                const scriptActions = actionRes.Content;
                logger.debug("onInit scriptActions", scriptActions);
                setScriptActions(scriptActions.Actions);
            }
            catch (e) {
                logger.error(e);
            }
        })();
    }, []);

    const actionsMenu = (e: any) => {
        showContextMenu(
            <Menu label="Actions" cancelText="Cancel" onCancel={() => { }}>
                {scriptActions?.map((action) =>
                    <MenuItem
                        onSelected={async () => {
                            const args = {
                                shortname: "",
                                steamClientID: "",
                                startDir: "",
                                compatToolName: "",
                                inputData: "",
                                gameId: "",
                                appId: ""
                            };
                            const result = await executeAction(serverAPI, initActionSet, action.ActionId, args);
                            logger.debug("runScript result", result);
                        }}
                    >
                        {action.Title}
                    </MenuItem>
                )}
            </Menu>,
            e.currentTarget ?? window
        );
    };

    const updateCache: <Param extends keyof GridContentArgs>(param: Param, value: GridContentArgs[Param], onFinish?: () => void) => void =
        (param, value, onFinish) => {
            const newCache = { ...argsCache, [param]: value };
            refreshContent({ ...newCache, limited: isLimited }, () => {
                setArgsCache(newCache);
                onFinish?.();
            });
        };

    return (
        <Focusable
            className={gridContentContainerClass}
            onSecondaryButton={() => {
                setInstalledLoading(true);
                updateCache('installed', !argsCache.installed, () => setInstalledLoading(false));
            }}
            onOptionsButton={() => {
                setIsLimitedLoading(true);
                refreshContent({ ...argsCache, limited: !isLimited }, () => {
                    setIsLimited(!isLimited);
                    setIsLimitedLoading(false);
                });
            }}
            onSecondaryActionDescription={
                <div style={{ display: 'flex', gap: '4px' }}>
                    <text>Toggle Installed Filter</text>
                    {installedFilterLoading && <Spinner style={{ width: '20px' }} />}
                </div>
            }
            onOptionsActionDescription={
                <div style={{ display: 'flex', gap: '4px' }}>
                    <text>{isLimited ? 'Show All' : 'Limit Results'}</text>
                    {isLimitedLoading && <Spinner style={{ width: '20px' }} />}
                </div>
            }
        >
            <style>{`
                .${contentTabsContainerClass} .${gamepadTabbedPageClasses.TabContentsScroll} {
                    scroll-padding-top: calc( var(--basicui-header-height) + 140px ) !important;
                    scroll-padding-bottom: 80px;
                }
                .${contentTabsContainerClass} .${gamepadTabbedPageClasses.TabContents} .${gridContentContainerClass} {
                    padding-top: 15px;
                }
            `}</style>
            <Focusable style={{ display: "flex", gap: '15px' }}>
                <div style={{ width: '100%' }}>
                    <TextField
                        placeholder="Search"
                        value={argsCache.filter}
                        onChange={(e) => updateCache('filter', e.target.value)}
                    />
                </div>
                <DialogButton
                    onClick={actionsMenu}
                    disabled={!scriptActions}
                    style={{ width: "48px", minWidth: 'initial', padding: 'initial' }}
                >
                    <FaSlidersH style={{ verticalAlign: 'middle' }} />
                </DialogButton>
                <DialogButton
                    onClick={() => showModal(
                        <ConfEditor
                            serverAPI={serverAPI}
                            initActionSet={initActionSet}
                            initAction="GetTabConfigActions"
                            contentId="0"
                            refreshParent={() => refreshContent({ ...argsCache, limited: isLimited })}
                        />
                    )}
                    style={{ width: "48px", minWidth: 'initial', padding: 'initial' }}
                >
                    <FaCog style={{ verticalAlign: 'middle' }} />
                </DialogButton>
            </Focusable>
            {content.NeedsLogin === "true" && (
                <div style={{ paddingTop: '15px' }}>
                    <LoginContent serverAPI={serverAPI} initActionSet={initActionSet} initAction="GetLoginActions" />
                </div>
            )}
            {argsCache.installed && (
                <div style={{ margin: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                    <div style={{ backgroundColor: '#8b929a66', flex: 'auto', height: '1px' }} />
                    <div style={{ color: '#ffffffb3', fontSize: '12px', textTransform: 'uppercase' }}>
                        Installed
                    </div>
                    <div style={{ backgroundColor: '#8b929a66', flex: 'auto', height: '1px' }} />
                </div>
            )}
            <GridItems
                serverAPI={serverAPI}
                games={content.Games ?? []}
                initActionSet={initActionSet}
                initAction=""
            />
        </Focusable>
    );
};

interface GridItemsProperties {
    games: GameData[];
    serverAPI: ServerAPI;
    initActionSet: string;
    initAction: string;
}

const GridItems: VFC<GridItemsProperties> = memo(({ serverAPI, games, initActionSet, initAction}) => {
    const logger = new Logger("GridContainer");

    const imgAreaWidth = '120px';
    const imgAreaHeight = '165px';

    return (
        <>
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
                            // logger.debug("setActiveGame", game.ShortName);
                            // setActiveGame(game.ShortName);
                            showModal(
                                <GameDetailsItem
                                    serverAPI={serverAPI}
                                    shortname={game.ShortName}
                                    initActionSet={initActionSet}
                                    initAction={initAction}
                                    clearActiveGame={() => { }}
                                />
                            );
                        }}
                    />
                ))}
            </Focusable>
        </>
    );
});
export default GridItems;
