import {
  PanelSection,
  PanelSectionRow,
  Focusable,
  ButtonItem,
  Router,
  DialogButton,
  Carousel,
  Marquee,
  showModal,
  ModalRoot,

} from "decky-frontend-lib";
import { Panel, PlayButton, ScrollPanelGroup } from "./Scrollable";
import { useState, VFC } from "react";
import { FaArrowRight, FaCog, FaScroll } from "react-icons/fa";
import { RiArrowRightSFill } from "react-icons/ri";
//@ts-ignore

const GameDisplay: VFC<{
  name: string; closeModal?: any; images: string[]; installer: () => void;
  uninstaller: () => void;
  steamClientID: string;
  runner: () => void;
  confeditor: () => void;
  developer: string;
  releaseDate: string;
  genre: string;
  source: string;
  description: string;
  publisher: string;
  bateditor: () => void;
  hasDosConfig: boolean;
  hasBatFiles: boolean;
  installing: boolean;
}> = (
  {
    closeModal,
    name,
    images,
    steamClientID,
    installer,
    uninstaller,
    runner,
    confeditor,
    developer,
    releaseDate,
    genre,
    source,
    description,
    publisher,
    bateditor,
    hasDosConfig,
    hasBatFiles,
    installing
  }
) => {
    return (

      <PanelSection title={name}>
        <Focusable

          style={{
            marginLeft: "0px",
            color: "white",

            width: "100%",

            overflow: "scroll",
          }}
          onCancel={(e) => {
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

          <PanelSection style={{ display: "flex", flexDirection: "row" }} focusable={true}>
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
                  layout="below"
                  onClick={runner}
                  onOKButton={runner}

                  style={{
                    //background: "#59bf40", 
                    width: "168px", height: "40px", verticalAlign: "middle"
                  }}
                >
                  {/* <RiArrowRightSFill style={{
                    width: "30px",
                    height: "30px",
                    minWidth: "30px",
                    maxHeight: "30px",
                    minHeight: "30px",
                    position: "relative",
                    margin: 0,
                    padding: 0,
                    transform: "translate(0px, -2px)",
                    verticalAlign: "middle"
                  }} /> */}
                  <span>Play Game</span>
                </DialogButton>)}
              <div style={{ flexGrow: 1, flexShrink: 1 }}>
                {installing && (
                  <span>Installing please wait...</span>
                )}
              </div>
              {hasDosConfig && (
                <DialogButton
                  onClick={confeditor}
                  onOKButton={confeditor}
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
                </DialogButton>)}

              {hasBatFiles && (
                <DialogButton
                  onClick={bateditor}
                  onOKButton={bateditor}
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
                  <FaScroll
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%,-50%)",
                    }}
                  />
                </DialogButton>)}

            </Focusable>
          </PanelSection>
          <PanelSectionRow style={{ margin: "10px" }}>
            Developer: {developer} {releaseDate}
          </PanelSectionRow>
          <PanelSectionRow style={{ margin: "10px" }}>
            Genre: {genre}
          </PanelSectionRow>
          <PanelSectionRow style={{ margin: "10px" }}>
            Source: {source}
          </PanelSectionRow>

          <PanelSectionRow style={{ margin: "10px" }}>
            <ScrollPanelGroup
              focusable={false}
              style={{ flex: 1, minHeight: 0, height: "200px" }}
              scrollPaddingTop={32}
            >
              <Panel focusable={true} noFocusRing={false}>
                {description}
              </Panel>
            </ScrollPanelGroup>
          </PanelSectionRow>
        </Focusable>
      </PanelSection>

    );
  }

export default GameDisplay;
