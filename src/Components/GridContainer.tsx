import { Focusable, ServerAPI, gamepadTabbedPageClasses, showModal } from "decky-frontend-lib";
import { GameData } from "../Types/Types";
import { VFC, memo } from "react";
import GameGridItem from './GameGridItem';
import { GameDetailsItem } from './GameDetailsItem';

export const contentTabsContainerClass = 'content-tabs-container';
interface GridContainerProperties {
    games: GameData[];
    serverAPI: ServerAPI;
    initActionSet: string;
    initAction: string;
}

const GridContainer: VFC<GridContainerProperties> = memo(({ serverAPI, games, initActionSet, initAction }) => {
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
                        onClick={() => showModal(<GameDetailsItem serverAPI={serverAPI} shortname={game.ShortName} initActionSet={initActionSet} initAction={initAction} />)}
                    />
                ))}
            </Focusable>
        </>
    );
});
export default GridContainer;
