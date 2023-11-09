import { Focusable, ServerAPI, TextField } from "decky-frontend-lib";
import { useState, useEffect, VFC } from "react";
import GridContainer from "./GridContainer";
import { ActionSet, ContentError, ContentResult, GameDataResult } from "./Types";
import { ErrorDisplay } from "./ErrorDisplay";

export const StorePage: VFC<{
  serverAPI: ServerAPI,
  initActionSet: string,
  initAction: string
}> = ({
  serverAPI,
  initActionSet,
  initAction
}) => {
    const [actionSetName, setActionSetName] = useState("");
    const [content, setContent] = useState({
      Type: "Empty"
    } as ContentResult);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterInstalled, setFilterInstalled] = useState(false);
    const [limited, setLimited] = useState(true);
    const fetchData = async (setName: string, filter: string, installed: boolean, limited: boolean) => {
      console.log(`setName ${setName}, filter: ${filter}, installed: ${installed}, limited: ${limited}`)
      if (!setName || setName === "") {
        console.log("setName is empty");
        return;
      }

      serverAPI.callPluginMethod<{}, ContentResult>("execute_action", {
        actionSet: setName,
        actionName: "GetContent",
        filter: filter,
        installed: String(installed),
        limited: String(limited),
        inputData: ""
      }).then((data) => {

        setContent(data.result as ContentResult);
      }
      ).catch((error) => {
        console.error("StorePage.tsx: ", error);
      })
    };
    useEffect(() => {

      fetchData(actionSetName, searchQuery, filterInstalled, limited);
    }, [searchQuery, filterInstalled, limited, actionSetName]);
    useEffect(() => {
      onInit();
    }, []);
    const onInit = async () => {
      try {
        console.log(`init StorePage.tsx:  ${initActionSet}, ${initAction}`);
        if (!initActionSet || initActionSet === "") {
          console.log("initActionSet is empty");
          return;
        }
        if (!initAction || initAction === "") {
          console.log("initAction is empty");
          return;
        }
        const data = await serverAPI.callPluginMethod<{}, ActionSet>("execute_action", {
          actionSet: initActionSet,
          actionName: initAction,
          inputData: "",
        });
        console.log("init StorePage result: ", data);
        const result = data.result as ActionSet;
        const tmp = result.SetName;
        console.log(`StorePage.tsx actionSet name: ${tmp}`);
        setActionSetName(tmp);
        fetchData(tmp, "", filterInstalled, limited);

        console.log(content);
      } catch (error) {
        console.error("Page.tsx", error);
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

