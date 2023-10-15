import GameImage from "./GameImage";
import {
  Focusable,
  Router
} from "decky-frontend-lib";
import { GameData } from "./Types";

function GridContainer(props: { games: GameData[]; }) {

  return (
    <Focusable style={{
      marginLeft: "0px",
      color: "white",
      display: "grid", justifyContent: "center", gridGap: "40px",
      gridTemplateColumns: "repeat(6, 1fr)",
      gridTemplateRows: "repeat(6, 1fr)",
      width: "100%", height: "640px", overflow: "scroll"
    }}>


      {props.games.map((game: GameData) => (
        <div>
          <GameImage
            key={game.id}
            src={game.images.length > 0 ? game.images[0] : ""}
            alt={game.name}

            onClick={() => {
              Router.CloseSideMenus();
              Router.Navigate("/game/" + game.shortname)
            }}
          />
          <div>
            {game.name}
          </div></div>
      ))}

    </Focusable>
  );
}
export default GridContainer;