import {
  definePlugin,
  ServerAPI,
  staticClasses,
  useParams
} from "decky-frontend-lib";
import { FaBoxOpen } from "react-icons/fa";

import { Content } from "./ContentTabs";
import { About } from "./About";
import { addAchievement, getAchievementDetails, toastAchievement, toastFactory } from "./Utils/achievements";
import Logger from "./Utils/logger";




//@ts-ignore
export default definePlugin((serverApi: ServerAPI) => {
  
    
  toastFactory(serverApi.toaster);
    


  
  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();

  if (currentHour === 0 && currentMinute >= 0 && currentMinute <= 15) {
      addAchievement("MTAx")
  }
  const currentDate = new Date();
  const currentDay = currentDate.getDay();
  const currentMonth = currentDate.getMonth() + 1;
  if (currentDay === 5 && currentMonth === 13) {
      addAchievement("MTEw")
  }
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
