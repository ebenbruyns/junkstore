import { Router, Focusable, ServerAPI, useParams } from "decky-frontend-lib";
import { useState, useEffect, VFC } from "react";
import GameDisplay from "./GameDisplay";
import { GameDetails, LaunchOptions } from "./Types";
import { RiTestTubeFill } from "react-icons/ri";

export const gameIDFromAppID = (appid: number) => {
  //@ts-ignore
  let game = appStore.GetAppOverviewByAppID(appid);

  if (game !== null) {
    return game.m_gameid;
  } else {
    return -1
  }
}

export const GameDetailsPage: VFC<{ serverAPI: ServerAPI }> = ({
  serverAPI,
}) => {
  const [gameData, setGameData] = useState({} as GameDetails);
  const [steamClientID, setSteamClientID] = useState("");
  const { shortname } = useParams<{ shortname: string }>();
  useEffect(() => {
    onInit();
  }, []);
  const onInit = async () => {
    serverAPI
      .callPluginMethod<{}, GameDetails>("get_game_details", {
        tabindex: 0,
        shortname: shortname,
      })
      .then((data) => {
        const res = data.result as GameDetails;
        setGameData(res);
        setSteamClientID(res.SteamClientID);
      });
  };
  return (
    <div style={{ margin: "50px", color: "white" }}>
      <Focusable>
        <GameDisplay
          name={gameData.Name}
          description={gameData.Description}
          releaseDate={gameData.ReleaseDate}
          developer={gameData.Developer}
          images={gameData.Images}
          publisher={gameData.Publisher}
          source={gameData.Source}
          genre={gameData.Genre}
          steamClientID={steamClientID}
          installer={() => {
            SteamClient.Apps.AddShortcut("Name", "/bin/bash", "/target", "options").then((id: number) => {
              serverAPI
                .callPluginMethod<{}, LaunchOptions>("install_game", {
                  tabindex: 0,
                  shortname: gameData.ShortName,
                  id: id,
                })
                .then((data) => {

                  const r = data.result as LaunchOptions;
                  SteamClient.Apps.SetAppLaunchOptions(id, r.options)
                  SteamClient.Apps.SetShortcutName(id, gameData.Name)
                  SteamClient.Apps.SetShortcutExe(id, r.exe)
                  SteamClient.Apps.SetShortcutStartDir(id, r.workingdir)
                  setSteamClientID(id.toString());
                });


            });

          }}
          runner={() => {
            setTimeout(() => {
              let gid = gameIDFromAppID(parseInt(steamClientID))
              SteamClient.Apps.RunGame(gid, "", -1, 100);
            }, 500)
            //SteamClient.Apps.RunGame(parseInt(gameData.SteamClientID), "", -1, 100)
          }}

          confeditor={() => {
            Router.CloseSideMenus();
            Router.Navigate("/conf-editor/" + shortname + "/linux/_/_");
          }}
        />
      </Focusable>
    </div>
  );
};
