import GameImage from "./GameImage";
import { Focusable, ServerAPI, showModal } from "decky-frontend-lib";
import { GameData } from "./Types";
import { GameDetailsItem } from "./GameDetailsPage";
function GridContainer(props: {
  games: GameData[]
  filterFn: () => void
  limitFn: () => void
  limited: boolean
  tabindex: number
  serverAPI: ServerAPI
}) {
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
      onSecondaryButton={props.filterFn}
      onOptionsActionDescription={props.limited ? "Show All" : "Limit Results"}
      onOptionsButton={props.limitFn}
    >
      {props.games.map((game: GameData) => (
        <div style={{ width: "118px", height: "210px", overflow: "clip" }}>
          <GameImage
            key={game.ID}
            src={game.Images.length > 0 ? game.Images[0] : ""}
            alt={game.Name}
            onClick={() => {
              showModal(<GameDetailsItem serverAPI={props.serverAPI} tabindex={props.tabindex} shortname={game.ShortName} />)
              //Router.CloseSideMenus();
              //Router.Navigate("/game/" + props.tabindex + "/" + game.ShortName);

            }}
            filterFn={props.filterFn}
            limitFn={props.limitFn}
            limited={props.limited}
          />
          <div style={{ width: "calc ((100%/6) - 40px)", overflow: "clip" }}>{game.Name}</div>
        </div>
      ))}
    </Focusable>
  );
}
export default GridContainer;
