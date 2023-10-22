import {
  PanelSection,
  PanelSectionRow,
  Focusable,
  ButtonItem,
  Router
} from "decky-frontend-lib";
import { Panel, ScrollPanelGroup } from "./Scrollable";
import { useState } from "react";
//@ts-ignore
function GameDisplay(props) {
  return (
    <PanelSection title={props.name}>
      <Focusable
        style={{
          marginLeft: "0px",
          color: "white",

          width: "100%",
          height: "400px",
          overflow: "scroll",
        }}
        onCancel={(_) => {
          Router.Navigate("/store")
        }}
        onCancelActionDescription="Go back to Store"
      >
        <Focusable style={{ display: "flex" }}>
          <ScrollPanelGroup>
            {Array.isArray(props.images) &&
              props.images.map((image: string) => (
                <img src={image} style={{ height: "200px" }} />
              ))}
          </ScrollPanelGroup>
        </Focusable>

        <PanelSection>
          {props.steamClientID == "" && (
            <ButtonItem
              layout="below"
              onClick={props.installer}
              onOKButton={props.installer}
            >
              Install Game
            </ButtonItem>)}
          {props.steamClientID !== "" && (
            <ButtonItem
              layout="below"
              onClick={props.runner}
              onOKButton={props.runner}
            >
              Play Game
            </ButtonItem>)}
          <ButtonItem
            layout="below"
            onClick={props.confeditor}
            onOKButton={props.confeditor}
          >
            Configure Game
          </ButtonItem>
        </PanelSection>
        <PanelSectionRow style={{ margin: "10px" }}>
          Developer: {props.developer} {props.releaseDate}
        </PanelSectionRow>
        <PanelSectionRow style={{ margin: "10px" }}>
          Genre: {props.genre}
        </PanelSectionRow>
        <PanelSectionRow style={{ margin: "10px" }}>
          Source: {props.source}
        </PanelSectionRow>

        <PanelSectionRow style={{ margin: "10px" }}>
          <ScrollPanelGroup
            focusable={false}
            style={{ flex: 1, minHeight: 0, height: "200px" }}
            scrollPaddingTop={32}
          >
            <Panel focusable={true} noFocusRing={false}>
              {props.description}
            </Panel>
          </ScrollPanelGroup>
        </PanelSectionRow>
      </Focusable>
    </PanelSection>
  );
}

export default GameDisplay;
