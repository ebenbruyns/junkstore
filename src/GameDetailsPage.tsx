import { Router, Focusable, ServerAPI, useParams, ModalRoot, showModal, SimpleModal } from "decky-frontend-lib";
import { useState, useEffect, VFC } from "react";
import GameDisplay from "./GameDisplay";
import { GameDetails, LaunchOptions } from "./Types";
import { RiTestTubeFill } from "react-icons/ri";
import { Panel, ScrollPanelGroup } from "./Scrollable";
import { ConfEditor } from "./ConfEditor";
import { BatEditor } from "./BatEditor";

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

  const { tabindex, shortname } = useParams<{
    tabindex: number;
    shortname: string
  }>();
  return (
    <GameDetailsItem serverAPI={serverAPI} tabindex={tabindex} shortname={shortname} />
  )
}

export const GameDetailsItem: VFC<{ serverAPI: ServerAPI; tabindex: number; shortname: string; closeModal?: any }> = ({
  serverAPI,
  tabindex,
  shortname,
  closeModal
}) => {
  const [gameData, setGameData] = useState({} as GameDetails);
  const [steamClientID, setSteamClientID] = useState("");
  const [installing, setInstalling] = useState(false);
  // const { tabindex, shortname } = useParams<{
  //   tabindex: number;
  //   shortname: string
  // }>();

  const [buttonText, setButtonText] = useState("Play Game")
  useEffect(() => {
    onInit();
  }, []);
  const onInit = async () => {
    serverAPI
      .callPluginMethod<{}, GameDetails>("get_game_details", {
        tabindex: tabindex,
        shortname: shortname,
      })
      .then((data) => {
        const res = data.result as GameDetails;
        setGameData(res);
        setSteamClientID(res.SteamClientID);
      });
  };

  return (
    <>
      <style>
        {`
    .GenericConfirmDialog {
        width: 100% !important;
    }
`} </style>
      <ModalRoot style={{ width: 800 }} onCancel={closeModal} onEscKeypress={closeModal} closeModal={closeModal} >
        <ScrollPanelGroup focusable={false} style={{ background: parent }}>
          <Panel>
            <div style={{ margin: "0px", color: "white" }}>
              <Focusable onOptionsButton={() => {
                const id = parseInt(steamClientID)
                setSteamClientID("")
                setInstalling(true)
                serverAPI
                  .callPluginMethod<{}, LaunchOptions>("install_game", {
                    tabindex: tabindex,
                    shortname: gameData.ShortName,
                    id: steamClientID,
                  })
                  .then((data) => {

                    const r = data.result as LaunchOptions;
                    SteamClient.Apps.SetAppLaunchOptions(id, r.options)
                    SteamClient.Apps.SetShortcutName(id, gameData.Name)
                    SteamClient.Apps.SetShortcutExe(id, r.exe)
                    SteamClient.Apps.SetShortcutStartDir(id, r.workingdir)
                    setSteamClientID(id.toString())
                    setInstalling(false)
                  });
              }}
                onOptionsActionDescription="Reinstall Game"
                onSecondaryActionDescription="Remove Game"
                onSecondaryButton={() => {
                  serverAPI
                    .callPluginMethod<{}, LaunchOptions>("uninstall_game", {
                      tabindex: tabindex,
                      shortname: gameData.ShortName,
                    })
                    .then((data) => {
                      SteamClient.Apps.RemoveShortcut(parseInt(steamClientID))
                      setSteamClientID("")
                    })
                }}
              >
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
                  closeModal={closeModal}
                  installing={installing}
                  installer={() => {
                    setInstalling(true)
                    SteamClient.Apps.AddShortcut("Name", "/bin/bash", "/target", "options").then((id: number) => {
                      serverAPI
                        .callPluginMethod<{}, LaunchOptions>("install_game", {
                          tabindex: tabindex,
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
                          setInstalling(false)
                        });


                    });

                  }}
                  uninstaller={() => {
                    serverAPI
                      .callPluginMethod<{}, LaunchOptions>("uninstall_game", {
                        tabindex: tabindex,
                        shortname: gameData.ShortName,
                      })
                      .then((data) => {
                        SteamClient.Apps.RemoveShortcut(parseInt(steamClientID))
                        setSteamClientID("")
                      })
                  }}
                  runner={() => {
                    setTimeout(() => {
                      closeModal();
                      let gid = gameIDFromAppID(parseInt(steamClientID))
                      SteamClient.Apps.RunGame(gid, "", -1, 100);
                    }, 500)
                    //SteamClient.Apps.RunGame(parseInt(gameData.SteamClientID), "", -1, 100)
                  }}

                  confeditor={() => {
                    //closeModal();
                    showModal(<ConfEditor serverAPI={serverAPI} tabindex={tabindex} shortname={shortname} platform={"linux"} forkname={"_"} version={"_"} />)
                    //Router.CloseSideMenus();
                    //Router.Navigate("/conf-editor/" + tabindex + "/" + shortname + "/linux/_/_");
                  }}
                  bateditor={() => {
                    showModal(<BatEditor serverAPI={serverAPI} tabindex={tabindex} shortname={shortname} />)
                  }}
                  hasDosConfig={gameData.HasDosConfig}
                  hasBatFiles={gameData.HasBatFiles}
                />
              </Focusable>
            </div>
          </Panel>
        </ScrollPanelGroup>
      </ModalRoot >
    </>
  );
};
