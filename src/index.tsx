import {
  definePlugin,
  ServerAPI,
  staticClasses,
  useParams
} from "decky-frontend-lib";
import { FaBoxOpen } from "react-icons/fa";

import { Content } from "./ContentTabs";
import { About } from "./About";

//@ts-ignore
export default definePlugin((serverApi: ServerAPI) => {
  serverApi.routerHook.addRoute(
    "/junk-store-content/:initActionSet/:initAction",
    () => {
      const { initActionSet, initAction } = useParams<{ initActionSet: string; initAction: string }>();
      return <Content key={initActionSet + "_" + initAction} serverAPI={serverApi} initActionSet={initActionSet} initAction={initAction} />;
    },
    {
      exact: true,
    }
  );
  serverApi.routerHook.addRoute(
    "/about-junk-store",
    () => {
      return <About serverAPI={serverApi} />
    },
    {
      exact: true,
    }
  );




  return {
    title: <div className={staticClasses.Title}>Custom Games Store</div>,
    content: <Content serverAPI={serverApi} initActionSet="init" initAction="InitActions" />,
    icon: <FaBoxOpen />,
    onDismount() {
      serverApi.routerHook.removeRoute("/junk-store-content/:initActionSet/:initAction");
      serverApi.routerHook.removeRoute("/about-junk-store");
    },
  };
});
