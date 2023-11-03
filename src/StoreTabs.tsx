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
    cancel_install: string;
    get_install_progress: string;
    get_game_bats: string;
    save_game_bats: string;
    download_game: string;

};

interface ScriptsState {
    init_script: string;
    content_dir: string;
    scripts: ScriptSet[];
};

export const StoreTabs: VFC<{ serverAPI: ServerAPI; }> = ({ serverAPI }) => {
    const [currentTab, setCurrentTab] = useState("0");

    const [scripts, setScripts] = useState({

        init_script: "",
        content_dir: "",
        scripts: [
            {
                TabName: "None",
                get_game_details: "",
                save_config: "",
                get_config: "",
                install_game: "",
                uninstall_game: "",
                get_game_data: "",
                plugin_init: "",
                cancel_install: "",
                get_install_progress: "",
                get_game_bats: "",
                save_game_bats: "",
                download_game: "",

            }
        ]
    } as ScriptsState);

    useEffect(() => {
        onInit();
    }, []);
    const onInit = async () => {
        serverAPI
            .callPluginMethod<{}, {}>("get_scripts",
                {}
            )
            .then((data) => {
                setScripts(data.result as ScriptsState)

            });

    };

    return (
        <div style={{ marginTop: "40px", height: "calc(100% - 40px)", color: "white" }}>
            <Tabs
                activeTab={currentTab}
                onShowTab={(tabID: string) => {
                    setCurrentTab(tabID);
                }}
                tabs={scripts.scripts.map((script, index) => ({
                    title: script.TabName,
                    content: <StorePage serverAPI={serverAPI} tabindex={index} />,
                    id: index.toString(),
                }))}
            />
        </div>
    );
};

