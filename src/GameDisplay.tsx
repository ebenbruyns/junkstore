import {
  PanelSection,
  PanelSectionRow,
  Focusable,
  ButtonItem,
} from "decky-frontend-lib";
import { Panel, ScrollPanelGroup } from "./Scrollable";
//@ts-ignore
function GameDisplay(props) {
  return (
    <PanelSection title={props.name}>
      <Focusable
        style={{
          marginLeft: "0px",
          color: "white",

          width: "100%",
          height: "600px",
          overflow: "scroll",
        }}
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
          <ButtonItem
            layout="below"
            onClick={props.installer}
            onOKButton={props.installer}
          >
            Install Game
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
