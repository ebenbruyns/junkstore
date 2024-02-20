import GameImage from "./GameImage";
import { Focusable, ServerAPI, showModal } from "decky-frontend-lib";
import { GameData } from "../Types/Types";
import { GameDetailsItem } from "./GameDetailsItem";
import { VFC } from "react";

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
        overflow: "scroll",
        gridAutoRows: "1fr"
      }}
      onSecondaryActionDescription="Toggle Installed Filter"
      onSecondaryButton={filterFn}
      onOptionsActionDescription={limited ? "Show All" : "Limit Results"}
      onOptionsButton={limitFn}
    >
      {games.map((game: GameData) => (
        <div style={{ width: "118px", height: "210px", overflow: "clip" }}>
          <GameImage
            className={'libraryassetimage_Image_24_Au'}
            key={game.ID}
            src={game.Images.length > 0 ? game.Images[0] : ""}
            alt={game.Name}
            onClick={() => {
              showModal(<GameDetailsItem serverAPI={serverAPI} shortname={game.ShortName} initActionSet={initActionSet} initAction="" />)
              //Router.CloseSideMenus();
              //Router.Navigate("/game/" + tabindex + "/" + game.ShortName);
            }}
            filterFn={filterFn}
            limitFn={limitFn}
            limited={limited}
            initActionSet={initActionSet}
            initAction={initAction}
          />
          <div style={{ width: "calc ((100%/6) - 40px)", overflow: "clip" }}>{game.Name}</div>
        </div>
      ))}
    </Focusable>
  );
}
export default GridContainer;
