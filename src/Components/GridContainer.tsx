import { Focusable, ServerAPI, gamepadTabbedPageClasses } from "decky-frontend-lib";
import { GameData } from "../Types/Types";
import { VFC } from "react";
import GameGridItem from './GameGridItem';

interface GridContainerProperties {
    games: GameData[];
    filterFn: () => void;
    limitFn: () => void;
    limited: boolean;
    serverAPI: ServerAPI;
    initActionSet: string;
    initAction: string;
}

const GridContainer: VFC<GridContainerProperties> = ({ serverAPI, games, filterFn, limitFn, limited, initActionSet, initAction }) => {
    const imgAreaWidth = '120px';
    const imgAreaHeight = '165px';

    return (
        <>
            <style>{`
                .${gamepadTabbedPageClasses.TabContentsScroll} {
                    scroll-padding-top: 160px;
                    scroll-padding-bottom: 115px;
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
                }}
                onSecondaryActionDescription="Toggle Installed Filter"
                onSecondaryButton={filterFn}
                onOptionsActionDescription={limited ? "Show All" : "Limit Results"}
                onOptionsButton={limitFn}
            >
                {games.map((game: GameData) => (
                    <GameGridItem
                        gameData={game}
                        serverAPI={serverAPI}
                        imgAreaWidth={imgAreaWidth}
                        imgAreaHeight={imgAreaHeight}
                        // filterFn={filterFn}
                        // limitFn={limitFn}
                        // limited={limited}
                        initActionSet={initActionSet}
                        initAction={initAction}
                    />
                ))}
            </Focusable>
        </>
    );
};
export default GridContainer;
