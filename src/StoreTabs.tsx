import { ServerAPI, Tabs } from "decky-frontend-lib";
import { VFC, useEffect, useState } from "react";
import { StorePage } from "./StorePage";
interface ScriptSet {
    TabName: string;
    get_game_details: string;
    save_config: string;
    get_config: string;
    install_game: string;
    uninstall_game: string;
    get_game_data: string;
    plugin_init: string;
};

interface ScriptsState {
    init_script: string;
    content_dir: string;
    scripts: ScriptSet[];
};
export const StoreTabs: VFC<{ serverAPI: ServerAPI; }> = ({ serverAPI }) => {
    const [currentTab, setCurrentTab] = useState(0);

    // const [scripts, setScripts] = useState({

    //     init_script: "",
    //     content_dir: "",
    //     scripts: [
    //         {
    //             TabName: "Dos",
    //             get_game_details: "",
    //             save_config: "",
    //             get_config: "",
    //             install_game: "",
    //             uninstall_game: "",
    //             get_game_data: "",
    //             plugin_init: ""
    //         },
    //         {
    //             TabName: "Windows",
    //             get_game_details: "",
    //             save_config: "",
    //             get_config: "",
    //             install_game: "",
    //             uninstall_game: "",
    //             get_game_data: "",
    //             plugin_init: ""
    //         }
    //     ]
    // } as ScriptsState);
    // const [tabdata, setTabData] = useState(scripts.scripts.map((script, index) => ({
    //     title: script.TabName,
    //     content: <StorePage serverAPI={serverAPI} tabindex={index} />,
    //     id: index,
    // })))

    // useEffect(() => {
    //     onInit();
    // }, []);
    // const onInit = async () => {
    //     serverAPI
    //         .callPluginMethod<{}, {}>("get_scripts",
    //             {}
    //         )
    //         .then((data) => {
    //             setScripts(data.result as ScriptsState)

    //         });

    // };
    // useEffect(() => {
    //     setTabData(scripts.scripts.map((script, index) => ({
    //         title: script.TabName,
    //         content: <StorePage serverAPI={serverAPI} tabindex={index} />,
    //         id: index,
    //     })))
    // }, [scripts]);

    return (
        <div style={{ margin: "40px", height: "calc(100% - 40px)", color: "white" }}>
            <Tabs
                activeTab={currentTab}
                onShowTab={(tabID: number) => {
                    setCurrentTab(tabID);
                    dispatchEvent(new Event("stateUpdate"));
                    //this.eventBus.dispatchEvent(new Event("stateUpdate"));
                }}
                tabs={[{
                    title: "Dos",
                    content: <StorePage serverAPI={serverAPI} tabindex={0} />,
                    id: 0
                },
                {
                    title: "Windows",
                    content: <StorePage serverAPI={serverAPI} tabindex={1} />,
                    id: 1
                }
                ]}
            />
        </div>
    );
};

