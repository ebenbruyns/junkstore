/**
 * Renders a component that displays a set of tabs, each containing a StorePage component.
 * @param {Object} props - The component properties.
 * @param {ServerAPI} props.serverAPI - The server API object.
 * @param {StoreTabsContent} props.tabs - The content of the tabs.
 * @param {string} props.initActionSet - The initial action set.
 * @param {string} props.initAction - The initial action.
 * @returns {JSX.Element} - The rendered component.
 */
import { ServerAPI, Tabs } from "decky-frontend-lib";
import { VFC, useEffect, useState } from "react";
import { StorePage } from "./StorePage";
import { ActionSet, StoreTabsContent } from "./Types";
import Logger from "./logger";

interface StoreTabsProperties {
    serverAPI: ServerAPI;
    tabs: StoreTabsContent;
    initActionSet: string;
    initAction: string;
}

export const StoreTabs: VFC<StoreTabsProperties> = ({ serverAPI, tabs, initAction, initActionSet }) => {
    const logger = new Logger("StoreTabs");
    const [currentTab, setCurrentTab] = useState("-1");
    const [content, setContent] = useState<StoreTabsContent>({ Tabs: [] });
    const [actionSetName, setActionSetName] = useState("");

    useEffect(() => {
        onInit();
    }, []);

    const onInit = async () => {
        try {
            logger.debug(`Initializing StoreTabs with initActionSet: ${initActionSet} and initAction: ${initAction}`);
            if (!initActionSet || initActionSet === "" || !initAction || initAction === "") {
                logger.debug("initActionSet or initAction is empty");
                return;
            }
            const data = await serverAPI.callPluginMethod<{}, ActionSet>("execute_action", {
                actionSet: initActionSet,
                actionName: initAction,
                inputData: "",
            });
            const result = data.result as ActionSet;
            setActionSetName(result.SetName);
            setContent(tabs);
            setCurrentTab("0");
            logger.debug(`StoreTabs initialized with actionSetName: ${result.SetName}`);
        } catch (error) {
            logger.error(`Error initializing StoreTabs: ${error}`);
        }
    };

    return (
        <div style={{ marginTop: "40px", height: "calc(100% - 40px)", color: "white" }}>
            {content.Tabs.length > 0 && <Tabs
                activeTab={currentTab}
                onShowTab={(tabID: string) => setCurrentTab(tabID)}
                tabs={content.Tabs.map((tab, index) => ({
                    title: tab.Title,
                    content: <StorePage serverAPI={serverAPI} initActionSet={actionSetName} initAction={tab.ActionId} />,
                    id: index.toString(),
                }))}
            />}
            {content.Tabs.length === 0 && <div>Loading... </div>}
        </div>
    );
};
