import { Focusable, ServerAPI, TextField } from "decky-frontend-lib";
import { useState, useEffect, VFC } from "react";
import GridContainer from "./GridContainer";
import { ActionSet, ContentError, ContentResult, GameDataResult } from "./Types";
import { ErrorDisplay } from "./ErrorDisplay";
import Logger from "./logger";

export const StorePage: VFC<{
  serverAPI: ServerAPI,
  initActionSet: string,
  initAction: string
}> = ({
  serverAPI,
  initActionSet,
  initAction
}) => {
    const logger = new Logger("StorePage");
    logger.log("Startup")
    const [actionSetName, setActionSetName] = useState("");
    const [content, setContent] = useState({
      Type: "Empty"
    } as ContentResult);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterInstalled, setFilterInstalled] = useState(false);
    const [limited, setLimited] = useState(true);
    const fetchData = async (setName: string,
      filter: string,
      installed: boolean,
      limited: boolean) => {
      logger.debug(`setName ${setName}, filter: ${filter}, installed: ${installed}, limited: ${limited}`)
      if (!setName || setName === "") {
        logger.debug("setName is empty");
        return;
      }

      serverAPI.callPluginMethod<{}, ContentResult>("execute_action", {
        actionSet: setName,
        actionName: "GetContent",
        filter: filter,
        installed: String(installed),
        limited: String(limited)
      }).then((data) => {

        setContent(data.result as ContentResult);
      }
      ).catch((error) => {
        logger.error("GetContent: ", error);
      })
    };
    useEffect(() => {

      fetchData(actionSetName, searchQuery, filterInstalled, limited).then(() => {
      });
    }, [searchQuery, filterInstalled, limited, actionSetName]);
    useEffect(() => {
      onInit();
    }, []);
    const onInit = async () => {
      try {
        logger.debug(`OnInit:  ${initActionSet}, ${initAction}`);
        if (!initActionSet || initActionSet === "") {
          logger.debug("initActionSet is empty");
          return;
        }
        if (!initAction || initAction === "") {
          logger.debug("initAction is empty");
          return;
        }
        const data = await serverAPI.callPluginMethod<{}, ActionSet>("execute_action", {
          actionSet: initActionSet,
          actionName: initAction,
          inputData: "",
        });
        logger.debug("init StorePage result: ", data);
        const result = data.result as ActionSet;
        const tmp = result.SetName;
        logger.debug(`actionSet name: ${tmp}`);
        setActionSetName(tmp);
        fetchData(tmp, "", filterInstalled, limited);

        logger.debug(content);
      } catch (error) {
        console.error("OnInit: ", error);
      }


    };
    return (

      <>
        <Focusable
          // @ts-ignore
          focusableIfNoChildren={true}
          style={{
            marginBottom: "20px",
          }}
          onSecondaryActionDescription="Toggle Installed Filter"
          onSecondaryButton={() => {
            setFilterInstalled(!filterInstalled);
          }}
          onOptionsActionDescription={limited ? "Show All" : "Limit Results"}
          onOptionsButton={() => {
            setLimited(!limited);

          }}
        >
          <TextField
            placeholder="Search"
            value={searchQuery}
            onChange={(e: any) => setSearchQuery(e.target.value)}
          />
        </Focusable>
        {content.Type === "GameGrid" &&
          <GridContainer serverAPI={serverAPI} games={(content.Content as GameDataResult).Games} limited={limited} limitFn={() => { setLimited(!limited) }} filterFn={() => { setFilterInstalled(!filterInstalled) }} />
        }
        {content.Type === "Error" && <ErrorDisplay error={content.Content as ContentError} />}
        {content.Type === "Empty" && <div>Loading...</div>}
      </>
    );
  }

