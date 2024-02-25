import { Focusable, ServerAPI, gamepadTabbedPageClasses } from "decky-frontend-lib";
import { GameData } from "../Types/Types";
import { VFC } from "react";
import GameGridItem from './GameGridItem';

export const contentTabsContainerClass = 'content-tabs-container'
interface GridContainerProperties {
    games: GameData[];
    serverAPI: ServerAPI;
    initActionSet: string;
    initAction: string;
}

const GridContainer: VFC<GridContainerProperties> = ({ serverAPI, games, initActionSet, initAction }) => {
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
                    gridGap: "16px",
                    gridTemplateColumns: `repeat(auto-fill, ${imgAreaWidth})`,
                    gridTemplateRows: "repeat(6, 1fr)",
                    overflow: "visible",
                    marginTop: '15px'
                }}
            >
                {games.map((game: GameData) => (
                    <GameGridItem
                        gameData={game}
                        serverAPI={serverAPI}
                        imgAreaWidth={imgAreaWidth}
                        imgAreaHeight={imgAreaHeight}
                        initActionSet={initActionSet}
                        initAction={initAction}
                    />
                ))}
            </Focusable>
        </>
    );
};
export default GridContainer;
