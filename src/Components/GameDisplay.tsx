import {
  PanelSection,
  Focusable,
  DialogButton,
  Marquee,
  ProgressBarWithInfo,
  showContextMenu,
  Menu,
  MenuItem,
  showModal,
  ServerAPI,
  ScrollPanelGroup,
  ModalPosition,

} from "decky-frontend-lib";
// import { Panel, ScrollPanelGroup } from "./Scrollable";
import { VFC } from "react";
import { FaCog, FaSlidersH } from "react-icons/fa";
import { EditorAction, MenuAction, ProgressUpdate } from "../Types/Types";
import { ConfEditor } from "../ConfEditor";
import { BatEditor } from "../BatEditor";
import Logger from "../Utils/logger";
import { ExeRunner } from "../ExeRunner";
import { getAppDetails } from "../Utils/executeAction";
interface GameDisplayProperties {
  serverApi: ServerAPI;
  name: string;
  shortName: string;
  closeModal?: any;
  images: string[];
  installer: () => void;
  uninstaller: () => void;
  steamClientID: string;
  runner: () => void;
  description: string;
  installing: boolean;
  progress: ProgressUpdate;
  editors: EditorAction[];
  cancelInstall: () => void;
  initActionSet: string;
  actions: MenuAction[];
  resetLaunchOptions: () => void;
  updater: () => void;
  scriptRunner: (actionSet: string, actionId: string, args: any) => void;
  clearActiveGame: () => void;
}

//@ts-ignore

const GameDisplay: VFC<GameDisplayProperties> = (
  {
    serverApi,
    closeModal,
    name,
    shortName,
    images,
    steamClientID,
    installer,
    // @ts-ignore
    uninstaller,
    cancelInstall,
    runner,
    description,
    installing,
    progress,
    editors,
    initActionSet,
    actions,
    resetLaunchOptions,
    scriptRunner,
    clearActiveGame
  }
) => {
  const logger = new Logger("GameDisplay");
  logger.log(`initActionSet: ${initActionSet}`)

  const contextMenu = (e: any) => {
    showContextMenu(
      <Menu label="Configuration" cancelText="Cancel" onCancel={() => { }}>
        {editors.map((editor) => {
          return <MenuItem onSelected={
            () => {
              if (editor.Type == "IniEditor")
                showModal(<ConfEditor serverAPI={serverApi} initActionSet={initActionSet} initAction={editor.InitActionId} contentId={editor.ContentId} />);
              if (editor.Type == "FileEditor")
                showModal(<BatEditor serverAPI={serverApi} initActionSet={initActionSet} initAction={editor.InitActionId} contentId={editor.ContentId} />)

            }
          }>{editor.Title}</MenuItem>
        })}

      </Menu>,
      e.currentTarget ?? window
    )
  }

  const actionsMenu = (e: any) => {
    showContextMenu(
      <Menu label="Actions" cancelText="Cancel" onCancel={() => { }}>
        {steamClientID !== "" &&
          <MenuItem onSelected={
            () => {

              logger.debug("show exe list")
              showModal(<ExeRunner serverAPI={serverApi} initActionSet={initActionSet} initAction="GetExeActions" contentId={steamClientID} shortName={shortName} closeParent={closeModal} />)

            }
          }>Run exe in Game folder</MenuItem>}
        {steamClientID !== "" &&
          <>
            <MenuItem onSelected={resetLaunchOptions}>Reset Launch Options</MenuItem>
            <MenuItem onSelected={uninstaller}>Uninstall Game</MenuItem>
          </>
        }

        {actions && actions.length > 0 && actions.map((action) => {

          const installed = steamClientID != "";
          const mustBeInstalled = action.InstalledOnly != undefined && action.InstalledOnly == true;
          const show = installed || !mustBeInstalled;

          if (show)
            return <MenuItem onSelected={
              async () => {
                const args = {
                  shortname: shortName,
                  steamClientID: "",
                  startDir: "",
                  compatToolName: "",
                  inputData: "",
                  gameId: "",
                  appId: ""
                }
                if (steamClientID != "") {
                  logger.debug("steamClientID: ", steamClientID)
                  //@ts-ignore
                  const id = parseInt(steamClientID)
                  const details = await getAppDetails(id)
                  // @ts-ignore
                  if (details == null) {
                    logger.error("details is null"); return;

                  }
                  else {
                    logger.debug("details: ", details)
                    const compatToolName = details.strCompatToolName
                    //@ts-ignore
                    const startDir = details.strShortcutStartDir
                    args.startDir = startDir;
                    args.compatToolName = compatToolName;
                    args.steamClientID = steamClientID;
                    args.gameId = String(steamClientID);
                    args.appId = String(id);
                  }
                }
                scriptRunner(initActionSet, action.ActionId, args)
              }
            }>{action.Title}</MenuItem>
          else
            return null;

        })}

      </Menu>,
      e.currentTarget ?? window
    )
  }

  return (
    <>





      <Focusable
        // @ts-ignore
        focusableIfNoChildren={true}

        style={{
          marginLeft: "0px",
          color: "white",

          width: "100%",
          height: "100%",
          overflow: "scroll",
          padding: "0px",
          margin: "0px"
        }}
        onCancel={(_) => {
          //e.stopPropagation();
          clearActiveGame();
          closeModal();
          // Router.CloseSideMenus();
        }}
        onCancelActionDescription="Go back to Store"
      >
        <h1 style={{ padding: "0px", margin: "0px" }}>{name}</h1>

        <Focusable
          // @ts-ignore
          focusable={true}
          noFocusRing={false} e style={{ display: "flex", flexDirection: "column", overflow: "scroll" }} >
          {/* <div
                // @ts-ignore
                style={{ whiteSpace: "nowrap", overflowX: "scroll" }} > */}

          <Marquee play children={Array.isArray(images) &&
            images.map((image: string) => (
              <img src={image} style={{ height: "150px", display: "inline-block" }} />
            ))}
          />
          {/* </div> */}
        </Focusable>

        <PanelSection
          // @ts-ignore
          style={{ display: "flex", flexDirection: "row" }} focusable={true}>
          <style>
            {`
            .DialogInputLabelGroup {
                margin-bottom: 0;
            }
            .ButtonItem {
              margin-bottom: 0;
            }
        `}
          </style>
          <Focusable
            style={{
              flex: "1",
              display: "flex",
              gap: "8px",
              alignItems: "flex-end",
              marginLeft: "1em",
              marginRight: "1em",
              marginTop: "1em"
            }}
          >

            {steamClientID == "" && !installing && (

              <DialogButton
                // @ts-ignore
                layout="below"
                onClick={installer}
                onOKButton={installer}
                style={{
                  width: "168px", height: "40px", verticalAlign: "middle"
                }}
              >
                Install Game
              </DialogButton>
            )}
            {steamClientID !== "" && !installing && (

              <DialogButton
                // @ts-ignore
                layout="below"
                onClick={runner}
                onOKButton={runner}

                style={{
                  //background: "#59bf40", 
                  width: "168px", height: "40px", verticalAlign: "middle"
                }}
              >

                <span>Play Game</span>
              </DialogButton>)}
            <div style={{ flexGrow: 1, flexShrink: 1 }}>
              {installing && (
                <>
                  <DialogButton
                    // @ts-ignore
                    layout="blow"
                    onClick={cancelInstall}
                    onOKButton={cancelInstall}
                    style={{
                      width: "168px", height: "40px", verticalAlign: "middle"
                    }}
                  >
                    Cancel
                  </DialogButton>
                  <ProgressBarWithInfo label={progress.Description}
                    nProgress={progress.Percentage}
                    // @ts-ignore
                    style={{ width: "100%", height: "40px", verticalAlign: "middle" }}

                  />
                </>
              )}

            </div>
            {/* actions.length > 0 && ( */}
            <DialogButton
              onClick={actionsMenu}
              onOKButton={actionsMenu}
              style={{
                width: "40px",
                height: "40px",
                minWidth: "40px",
                maxHeight: "40px",
                minHeight: "40px",
                margin: "0",
                position: "relative",
                flexDirection: "column",
              }}
            >
              <FaSlidersH
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%,-50%)",
                }}
              />
            </DialogButton>
            {/* ) */}

            {editors.length > 0 && (
              <DialogButton
                onClick={contextMenu}
                onOKButton={contextMenu}
                style={{
                  width: "40px",
                  height: "40px",
                  minWidth: "40px",
                  maxHeight: "40px",
                  minHeight: "40px",
                  margin: "0",
                  position: "relative",
                  flexDirection: "column",
                }}
              >
                <FaCog
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%,-50%)",
                  }}
                />
              </DialogButton>)
            }

          </Focusable>
        </PanelSection>
        <PanelSection>


          <ScrollPanelGroup
            // @ts-ignore
            focusable={false}
            style={{ flex: 1, minHeight: 0, height: "200px", width: "100%" }}
            scrollPaddingTop={32}
          >
            <Focusable
              // @ts-ignore
              focusableIfNoChildren={true}
              onCancel={(_) => { closeModal(); }}
              onCancelActionDescription="Go back to Store" >
              <Focusable
                // @ts-ignore
                focusable={true}
                noFocusRing={false} style={{ width: "100%" }}>
                <div style={{ width: "100%" }} dangerouslySetInnerHTML={{ __html: description }} />
              </Focusable>
            </Focusable>
          </ScrollPanelGroup>
        </PanelSection>
      </Focusable>

    </>
  );
}

export default GameDisplay;
