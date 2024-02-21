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
                    marginLeft: "0px",
                    color: "white",
                    display: "grid",
                    justifyContent: "center",
                    gridGap: "20px",
                    gridTemplateColumns: "repeat(6, 1fr)",
                    gridTemplateRows: "repeat(6, 1fr)",
                    width: "100%",
                    height: "calc (100% - 120px)",
                    overflow: "visible",
                    gridAutoRows: "1fr"
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
                        imgAreaWidth='120px'
                        imgAreaHeight='165px'
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
