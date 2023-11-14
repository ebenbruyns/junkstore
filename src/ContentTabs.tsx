/**
 * Renders a component that displays a set of tabs, each containing a StorePage component.
 * @param {Object} props - The component properties.
 * @param {ServerAPI} props.serverAPI - The server API object.
 * @param {StoreTabsContent} props.tabs - The content of the tabs.
 * @param {string} props.initActionSet - The initial action set.
 * @param {string} props.initAction - The initial action.
 * @returns {JSX.Element} - The rendered component.
 */
import { DialogBody, DialogControlsSection, ServerAPI, SidebarNavigation, Tabs } from "decky-frontend-lib";
import { VFC, useEffect, useState } from "react";
import { ActionSet, StoreTabsContent } from "./Types/Types";
import Logger from "./Utils/logger";
import { executeAction } from "./Utils/executeAction";
import { Loading } from "./Components/Loading";
import { Content } from "./Content";

interface ContentTabsProperties {
    serverAPI: ServerAPI;
    tabs: StoreTabsContent;
    initActionSet: string;
    initAction: string;
    layout: string;
}

export const ContentTabs: VFC<ContentTabsProperties> = ({ serverAPI, tabs, initAction, initActionSet, layout }) => {
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
            const data = await executeAction(serverAPI, initActionSet,
                initAction,
                {
                    inputData: "",
                }
            );
            const result = data.Content as ActionSet;
            setActionSetName(result.SetName);
            setContent(tabs);
            setCurrentTab("0");
            logger.debug(`StoreTabs initialized with actionSetName: ${result.SetName}`);
        } catch (error) {
            logger.error(`Error initializing StoreTabs: ${error}`);
        }
    };
    const getContent = () => {
        return content.Tabs.map((tab, index) => ({
            title: tab.Title,
            content: <Content serverAPI={serverAPI} initActionSet={actionSetName} initAction={tab.ActionId} />,
            id: index.toString(),
        }));
    }


    return (
        <DialogBody>
            {layout === "horizontal" && content.Tabs.length > 0 &&
                <DialogControlsSection style={{ height: "calc(100% - 40px)", marginTop: "40px" }}>
                    <Tabs
                        activeTab={currentTab}
                        onShowTab={(tabID: string) => setCurrentTab(tabID)}
                        tabs={getContent()}
                    />
                </DialogControlsSection>}
            {layout === "vertical" && content.Tabs.length > 0 &&
                <DialogControlsSection style={{ height: "calc(100%)" }}>
                    <SidebarNavigation pages={getContent()} showTitle disableRouteReporting />
                </DialogControlsSection>
            }
            {content.Tabs.length === 0 && <Loading />}
        </DialogBody>
    );
};
