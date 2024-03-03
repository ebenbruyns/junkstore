import { Focusable, ServerAPI, gamepadTabbedPageClasses, showModal } from "decky-frontend-lib";
import { GameData } from "../Types/Types";
import { VFC, memo } from "react";
import GameGridItem from './GameGridItem';
import { GameDetailsItem } from './GameDetailsItem';
import Logger from "../Utils/logger";

export const contentTabsContainerClass = 'content-tabs-container';
interface GridContainerProperties {
    games: GameData[];
    serverAPI: ServerAPI;
    initActionSet: string;
    initAction: string;
    setActiveGame: (shortname: string) => void;
    clearActiveGame: () => void;
}

const GridContainer: VFC<GridContainerProperties> = memo(({ serverAPI, games, initActionSet, initAction, setActiveGame, clearActiveGame }) => {
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
                            setActiveGame(game.ShortName);
                            showModal(<GameDetailsItem serverAPI={serverAPI} shortname={game.ShortName} initActionSet={initActionSet} initAction={initAction} clearActiveGame={clearActiveGame} />);
                        }}
                    />
                ))}
            </Focusable>
        </>
    );
});
export default GridContainer;
