import { Focusable, ServerAPI, TextField } from "decky-frontend-lib";
import { useState, useEffect, VFC } from "react";
import GridContainer from "./GridContainer";
import { GameData } from "./Types";

export const StorePage: VFC<{ serverAPI: ServerAPI }> = ({ serverAPI }) => {
  const [games, setGames] = useState([] as GameData[]);
  const [searchQuery, setSearchQuery] = useState("");
  useEffect(() => {
    serverAPI
      .callPluginMethod<{}, GameData[]>("get_game_data", {
        filter: searchQuery,
      })
      .then((data) => {
        setGames(data.result as GameData[]);
      });
  }, [searchQuery]);
  useEffect(() => {
    onInit();
  }, []);
  const onInit = async () => {
    serverAPI
      .callPluginMethod<{}, GameData[]>("get_game_data", { filter: "" })
      .then((data) => {
        setGames(data.result as GameData[]);
      });
  };
  return (
    <div style={{ margin: "50px", color: "white" }}>
      <Focusable
        style={{
          marginBottom: "20px",
        }}
      >
        <TextField
          placeholder="Search"
          value={searchQuery}
          onChange={(e: any) => setSearchQuery(e.target.value)}
        />
      </Focusable>

      <GridContainer games={games} />
    </div>
  );
};
