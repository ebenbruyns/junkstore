import { Focusable, ServerAPI, TextField } from "decky-frontend-lib";
import { useState, useEffect, VFC } from "react";
import GridContainer from "./GridContainer";
import { GameData } from "./Types";
import { Panel, ScrollPanelGroup } from "./Scrollable";

export const StorePage: VFC<{ serverAPI: ServerAPI }> = ({ serverAPI }) => {
  const [games, setGames] = useState([] as GameData[]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterInstalled, setFilterInstalled] = useState(false);
  const [limited, setLimited] = useState(true);
  useEffect(() => {
    serverAPI
      .callPluginMethod<{}, GameData[]>("get_game_data", {
        tabindex: 0,
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
          tabindex: 0,
          filter: "",
          installed: filterInstalled,
          limited: limited
        })
      .then((data) => {
        setGames(data.result as GameData[]);
      });

  };
  return (
    <ScrollPanelGroup focusable={false}>
      <Panel>
        <div style={{ margin: "50px", color: "white" }}>
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

          <GridContainer games={games} limited={limited} limitFn={() => { setLimited(!limited) }} filterFn={() => { setFilterInstalled(!filterInstalled) }} />
        </div >
      </Panel>
    </ScrollPanelGroup >
  );
};
