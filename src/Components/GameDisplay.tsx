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

} from "decky-frontend-lib";
import { Panel, ScrollPanelGroup } from "./Scrollable";
import { VFC } from "react";
import { FaCog } from "react-icons/fa";
import { EditorAction, ProgressUpdate } from "../Types/Types";
import { ConfEditor } from "../ConfEditor";
import { BatEditor } from "../BatEditor";
import Logger from "../Utils/logger";
interface GameDisplayProperties {
  serverApi: ServerAPI;
  name: string;
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
}

//@ts-ignore

const GameDisplay: VFC<GameDisplayProperties> = (
  {
    serverApi,
    closeModal,
    name,
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
    initActionSet
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
  return (
    <PanelSection>
      <h1>{name}</h1>
      <Focusable
        // @ts-ignore
        focusableIfNoChildren={true}

        style={{
          marginLeft: "0px",
          color: "white",

          width: "100%",

          overflow: "scroll",
        }}
        onCancel={(_) => {
          //e.stopPropagation();
          closeModal();
          // Router.CloseSideMenus();
        }}
        onCancelActionDescription="Go back to Store"
      >
        <Panel focusable={true} noFocusRing={false}>

          <Focusable style={{ display: "flex", flexDirection: "column", overflow: "scroll" }} >
            <Panel style={{ whiteSpace: "nowrap", overflowX: "scroll" }} >
              <Marquee play children={Array.isArray(images) &&
                images.map((image: string) => (
                  <img src={image} style={{ height: "150px", display: "inline-block" }} />
                ))}
              />
            </Panel>
          </Focusable>
        </Panel>

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
                    layout="below"
                    onClick={cancelInstall}
                    onOKButton={cancelInstall}
                    style={{
                      width: "168px", height: "40px", verticalAlign: "middle"
                    }}
                  >
                    Cancel
                  </DialogButton>
                  <ProgressBarWithInfo
                    nProgress={progress.Percentage}
                    description={progress.Description}
                  />
                </>
              )}
            </div>
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


        <ScrollPanelGroup
          focusable={false}
          style={{ flex: 1, minHeight: 0, height: "200px", width: "100%" }}
          scrollPaddingTop={32}
        >
          <Focusable
            // @ts-ignore
            focusableIfNoChildren={true}
            onCancel={(_) => { closeModal(); }}
            onCancelActionDescription="Go back to Store" >
            <Panel focusable={true} noFocusRing={false} style={{ width: "100%" }}>
              <div style={{ width: "100%" }} dangerouslySetInnerHTML={{ __html: description }} />
            </Panel>
          </Focusable>
        </ScrollPanelGroup>

      </Focusable>
    </PanelSection>

  );
}

export default GameDisplay;
