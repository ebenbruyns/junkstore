import { Focusable, ServerAPI, TextField } from "decky-frontend-lib";
import { useState, useEffect, VFC } from "react";
import GridContainer from "./GridContainer";
import { GameData } from "./Types";
import { Panel, ScrollPanelGroup } from "./Scrollable";

export const StorePage: VFC<{ serverAPI: ServerAPI, tabindex: number }> = ({ serverAPI, tabindex }) => {
  const [games, setGames] = useState([] as GameData[]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterInstalled, setFilterInstalled] = useState(false);
  const [limited, setLimited] = useState(true);
  useEffect(() => {
    serverAPI
      .callPluginMethod<{}, GameData[]>("get_game_data", {
        tabindex: tabindex,
        filter: searchQuery,
        installed: filterInstalled,
        limited: limited,
      })
      .then((data) => {
        setGames(data.result as GameData[]);
      });
  }, [searchQuery, filterInstalled, limited]);
  useEffect(() => {
    onInit();
  }, []);
  const onInit = async () => {
    serverAPI
      .callPluginMethod<{}, GameData[]>("get_game_data",
        {
          tabindex: tabindex,
          filter: "",
          installed: filterInstalled,
          limited: limited
        })
      .then((data) => {
        setGames(data.result as GameData[]);
      });

  };
  return (

    <div>
      <Focusable
        style={{
          marginBottom: "20px",
        }}
        onSecondaryActionDescription="Toggle Installed Filter"
        onSecondaryButton={() => {
          setFilterInstalled(!filterInstalled);
        }}
        onOptionsActionDescription={limited ? "Show All" : "Limit Results"}
        onOptionsButton={() => {
          setLimited(!limited);

        }}
      >
        <TextField
          placeholder="Search"
          value={searchQuery}
          onChange={(e: any) => setSearchQuery(e.target.value)}
        />
      </Focusable>

      <GridContainer games={games} limited={limited} tabindex={tabindex} limitFn={() => { setLimited(!limited) }} filterFn={() => { setFilterInstalled(!filterInstalled) }} />
    </div >
  );
}

