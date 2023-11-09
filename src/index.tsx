import {
  definePlugin,
  ServerAPI,
  staticClasses,
} from "decky-frontend-lib";
import { useEffect, useState, VFC } from "react";
import { FaBoxOpen } from "react-icons/fa";

import { Page } from "./Page";
import { ActionSet, ContentError } from "./Types";
import { ContentResult, StoreContent } from "./Types";
import { ErrorDisplay } from "./ErrorDisplay";
import { MainMenu } from "./MainMenu";

// interface ExecuteAction {
//   setName: string;
//   actionName: string;
//   inputData: string;  
//   ...args: any[]
// }
// @ts-ignore
const Content: VFC<{ serverAPI: ServerAPI; initActionSet: string; initAction: string; }> = ({ serverAPI, initActionSet, initAction }) => {
  const [content, setContent] = useState({
    Type: "",
    Content: {}
  } as ContentResult);
  const [setName, setSetName] = useState("");
  useEffect(() => {
    onInit();
  }, []);
  const onInit = async () => {
    try {
      console.log("init");
      const data = await serverAPI.callPluginMethod<{}, ActionSet>("execute_action", {
        actionSet: initActionSet,
        actionName: initAction,
        inputData: "",
        test: "test"
      });
      console.log(data);
      const result = data.result as ActionSet;
      const tmp = result.SetName;
      setSetName(tmp)
      const content = await serverAPI.callPluginMethod<{}, ContentResult>("execute_action", {
        actionSet: result.SetName,
        actionName: "GetContent",
        inputData: ""
      });
      setContent(content.result as ContentResult);
      console.log(content);
    } catch (error) {
      console.error("index.tsx: ", error);
    }
  };

  return (
    (<>
      {content.Type === "MainMenu" && <MainMenu content={content.Content as StoreContent} initActionSet={setName} initAction="" />}
      {content.Type === "Error" && <ErrorDisplay error={content.Content as ContentError} />}
    </>

    ));
};
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
