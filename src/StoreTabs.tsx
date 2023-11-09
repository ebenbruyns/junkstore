import { ServerAPI, Tabs } from "decky-frontend-lib";
import { VFC, useEffect, useState } from "react";
import { StorePage } from "./StorePage";
import { ActionSet, StoreTabsContent } from "./Types";



export const StoreTabs: VFC<{ serverAPI: ServerAPI, tabs: StoreTabsContent; initActionSet: string; initAction: string }> =
    ({ serverAPI, tabs,
        initAction, initActionSet }) => {
        // const { actionSet, actionName } = useParams<{ actionSet: string; actionName: string }>();
        // console.log(`Action Set: ${actionSet}, Action Name: ${actionName}`);

        const [currentTab, setCurrentTab] = useState("-1");

        const [content, setContent] = useState({
            Tabs: []
        } as StoreTabsContent);

        const [actionSetName, setActionSetName] = useState("");
        useEffect(() => {
            onInit();
        }, []);
        const onInit = async () => {
            try {
                console.log(`init StoreTabs.tsx: ${initActionSet}, ${initAction}`);
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
                console.log(`StoreTabs.tsx init result: ${data}`);
                const result = data.result as ActionSet;
                const tmp = result.SetName;
                console.log(`StoreTabs.tsx actionSet result: ${tmp}`);
                setActionSetName(tmp);
                setContent(tabs)
                setCurrentTab("0")

            } catch (error) {
                console.error(error);
            }
        };

        return (
            <div style={{ marginTop: "40px", height: "calc(100% - 40px)", color: "white" }}>
                {content.Tabs.length > 0 && <Tabs
                    activeTab={currentTab}
                    onShowTab={(tabID: string) => {
                        setCurrentTab(tabID);
                    }}
                    tabs={content.Tabs.map((tab, index) => ({
                        title: tab.Title,
                        content: <StorePage serverAPI={serverAPI} initActionSet={actionSetName} initAction={tab.ActionId} />,
                        id: index.toString(),
                    }))}
                />}
                {content.Tabs.length === 0 && <div>Loading... tabid: {currentTab}</div>}
            </div>
        );
    };

