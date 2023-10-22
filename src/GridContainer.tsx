import GameImage from "./GameImage";
import { Focusable, Router } from "decky-frontend-lib";
import { GameData } from "./Types";

function GridContainer(props: {
  games: GameData[]
  filterFn: () => void
  limitFn: () => void
  limited: boolean
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

        overflow: "scroll",

      }}
      onSecondaryActionDescription="Toggle Installed Filter"
      onSecondaryButton={props.filterFn}
      onOptionsActionDescription={props.limited ? "Show All" : "Limit Results"}
      onOptionsButton={props.limitFn}
    >
      {props.games.map((game: GameData) => (
        <div>
          <GameImage
            key={game.ID}
            src={game.Images.length > 0 ? game.Images[0] : ""}
            alt={game.Name}
            onClick={() => {
              Router.CloseSideMenus();
              Router.Navigate("/game/" + game.ShortName);
            }}
            filterFn={props.filterFn}
            limitFn={props.limitFn}
            limited={props.limited}
          />
          <div style={{ width: "110px", overflow: "clip" }}>{game.Name}</div>
        </div>
      ))}
    </Focusable>
  );
}
export default GridContainer;
