import {
  definePlugin,
  ServerAPI,
  staticClasses,
} from "decky-frontend-lib";
import { FaBoxOpen } from "react-icons/fa";

import { Page } from "./Page";
import { Content } from "./Content";

export interface RunScriptArgs {
  cmd: string;
}

//@ts-ignore
export default definePlugin((serverApi: ServerAPI) => {
  serverApi.routerHook.addRoute(
    "/store/:initActionSet/:initAction",
    () => <Page serverAPI={serverApi} />,
    {
      exact: true,
    }
  );

  return {
    title: <div className={staticClasses.Title}>Custom Games Store</div>,
    content: <Content serverAPI={serverApi} initActionSet="init" initAction="GetContent" />,
    icon: <FaBoxOpen />,
    onDismount() {
      serverApi.routerHook.removeRoute("/store/:initActionSet/:iniAction");

    },
  };
});
