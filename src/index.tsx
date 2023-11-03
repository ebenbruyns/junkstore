import {
  ButtonItem,
  definePlugin,
  PanelSection,
  PanelSectionRow,
  Router,
  ServerAPI,
  staticClasses,
} from "decky-frontend-lib";
import { VFC } from "react";
import { FaBoxOpen } from "react-icons/fa";

import { StoreTabs } from "./StoreTabs";
export interface GameData {
  id: number;
  name: string;
  image: string;
  shortname: string;
}

// @ts-ignore
const Content: VFC<{ serverAPI: ServerAPI }> = ({ serverAPI }) => {
  return (
    <PanelSection title="Junk Store">
      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={() => {
            Router.CloseSideMenus();
            Router.Navigate("/store");
          }}
        >
          Browse Store
        </ButtonItem>
      </PanelSectionRow>
      {/* <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={() => {
            Router.CloseSideMenus();
            Router.Navigate("/conf-editor/0/inca1/linux/_/_");
          }}
        >
          Conf Editor
        </ButtonItem>
      </PanelSectionRow> 
      <PanelSectionRow>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <img src={logo} />
        </div>
      </PanelSectionRow>*/}
    </PanelSection>
  );
};

export interface RunScriptArgs {
  cmd: string;
}

//@ts-ignore
export default definePlugin((serverApi: ServerAPI) => {
  serverApi.routerHook.addRoute(
    "/store",
    () => <StoreTabs serverAPI={serverApi} />,
    {
      exact: true,
    }
  );

  return {
    title: <div className={staticClasses.Title}>Custom Games Store</div>,
    content: <Content serverAPI={serverApi} />,
    icon: <FaBoxOpen />,
    onDismount() {
      serverApi.routerHook.removeRoute("/store");

    },
  };
});
