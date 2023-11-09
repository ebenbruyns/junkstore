/**
 * StorePage component displays a list of games and allows the user to search and filter the list.
 * @param {Object} props - The component props.
 * @param {ServerAPI} props.serverAPI - The server API object.
 * @param {string} props.initActionSet - The initial action set.
 * @param {string} props.initAction - The initial action.
 * @returns {JSX.Element} - The StorePage component.
 */
import { Focusable, ServerAPI, TextField } from "decky-frontend-lib";
import { useState, useEffect, VFC } from "react";
import GridContainer from "./GridContainer";
import { ActionSet, ContentError, ContentResult, GameDataContent } from "./Types";
import { ErrorDisplay } from "./ErrorDisplay";
import Logger from "./logger";

interface StorePageProperties {
  serverAPI: ServerAPI;
  initActionSet: string;
  initAction: string;
}

export const StorePage: VFC<StorePageProperties> = ({
  serverAPI,
  initActionSet,
  initAction
}) => {
  const logger = new Logger("StorePage");
  const [actionSetName, setActionSetName] = useState("");
  const [content, setContent] = useState<ContentResult>({ Type: "Empty" });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterInstalled, setFilterInstalled] = useState(false);
  const [limited, setLimited] = useState(true);

  const fetchData = async (setName: string, filter: string, installed: boolean, limited: boolean) => {
    if (!setName) return;
    try {
      const data = await serverAPI.callPluginMethod<{}, ContentResult>("execute_action", {
        actionSet: setName,
        actionName: "GetContent",
        filter,
        installed: String(installed),
        limited: String(limited)
      });
      setContent(data.result as ContentResult);
    } catch (error) {
      logger.error("GetContent: ", error);
    }
  };
  useEffect(() => {
    logger.log("Content: ", content);
  }, [content]);

  useEffect(() => {
    logger.log(`Search query: ${searchQuery}, Filter installed: ${filterInstalled}, Limited: ${limited}, Action set name: ${actionSetName}`);
    fetchData(actionSetName, searchQuery, filterInstalled, limited);
  }, [searchQuery, filterInstalled, limited, actionSetName]);

  useEffect(() => {
    onInit();
  }, []);

  const onInit = async () => {
    if (!initActionSet || !initAction) return;
    try {
      const data = await serverAPI.callPluginMethod<{}, ActionSet>("execute_action", {
        actionSet: initActionSet,
        actionName: initAction,
        inputData: "",
      });
      const result = data.result as ActionSet;
      setActionSetName(result.SetName);
      fetchData(result.SetName, "", filterInstalled, limited);
      logger.log(`Initialized with action set ${result.SetName} and action ${initAction}`);
    } catch (error) {
      logger.error("OnInit: ", error);
    }
  };



  return (
    <>
      <Focusable
        // @ts-ignore
        focusableIfNoChildren
        style={{ marginBottom: "20px" }}
        onSecondaryActionDescription="Toggle Installed Filter"
        onSecondaryButton={() => setFilterInstalled(!filterInstalled)}
        onOptionsActionDescription={limited ? "Show All" : "Limit Results"}
        onOptionsButton={() => setLimited(!limited)}
      >
        <TextField
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Focusable>
      {content.Type === "GameGrid" && (
        <GridContainer
          serverAPI={serverAPI}
          games={(content.Content as GameDataContent).Games}
          limited={limited}
          limitFn={() => setLimited(!limited)}
          filterFn={() => setFilterInstalled(!filterInstalled)}
          initActionSet={actionSetName}
          initAction=""
        />
      )}
      {content.Type === "Error" && <ErrorDisplay error={content.Content as ContentError} />}
      {content.Type === "Empty" && <div>Loading...</div>}
    </>
  );
};
