import { ConfirmModal, DialogButton, Dropdown, ModalRoot, PanelSection, ScrollPanelGroup, ServerAPI, TextField, ToggleField, showModal } from "decky-frontend-lib";
import { VFC, useEffect, useState } from "react";
import { resetAchievements } from "./Utils/achievements";

import Logger from "./Utils/logger";
import { FaDownload } from "react-icons/fa6";
import { get } from "mobx";
export interface BuildDownloaderProps {
    serverAPI: ServerAPI;
    closeModal?: any;
}
export const BuildDownloader: VFC<BuildDownloaderProps> = ({ serverAPI, closeModal }) => {
    const logger = new Logger("BuildDownloader");
    const [builds, setBuilds] = useState([]);
    const [value, setValue] = useState("");
    const [bearerToken, setBearerToken] = useState(localStorage.getItem('js_gh_bearerToken') || "");
    const [branch, setBranch] = useState(localStorage.getItem('js_gh_branch') || "main");
    const get_builds = async () => {

        const res = await serverAPI.callPluginMethod<{}, {}>("get_latest_builds", {
            branch: branch,
            bearer_token: bearerToken
        });
        logger.log("get_latest_builds", res);
        if (res.success) {
            setBuilds(res.result);
        }
        return [];
    }
    useEffect(() => {
        get_builds();
    }, [])
    const onChange = async (value: string) => {
        setValue(value);
        localStorage.setItem('js_gh_bearerToken', value);
    }
    useEffect(() => {
        get_builds();
    }, [branch])
     
    const changeBranch = async (value: string) => {
        setBranch(value);
        localStorage.setItem('js_gh_branch', value);
        
    }
    return (
        <ModalRoot

            bAllowFullSize={true}
            closeModal={closeModal}
        >
            <PanelSection>
                <DialogButton onClick={async () => {
                    if (bearerToken === "") {
                        localStorage.setItem('js_gh_bearerToken', value);
                        setBearerToken(value);
                        get_builds();
                        return;
                    }
                    setBearerToken("");
                    localStorage.setItem('js_gh_bearerToken', "");
                }}
                >{bearerToken === "" ? "Save Bearer Token" : "Clear Bearer Token"}</DialogButton>
            </PanelSection>
            {bearerToken === "" && <PanelSection>
                <h2>Enter Github Token</h2>
                <TextField
                    style={{ overflow: 'hidden' }}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}

                />
            </PanelSection>
            }
            <PanelSection>
                <Dropdown
                    menuLabel="Branch"
                    selectedOption={branch}
                    rgOptions={[{
                        data: "main",
                        label: "Stable",
                    },
                    {
                        data: "development",

                        label: "Development",
                    },]}
                    onChange={(e) => changeBranch(e.data)}
                />
            </PanelSection>
            <div>
                <p>Latest Builds</p>

                {builds && builds &&
                    builds.map((build: any) => {
                        return (
                            <>
                                <div style={{ paddingBottom: "10px" }}>
                                    <div style={{ display: "flex", gap: '15px' }}>
                                        <div style={{ width: '100%' }}>Junk-Store-{build.head_sha}.zip on {build.date} <br />
                                            {build.title}</div>
                                        <DialogButton
                                            style={{ width: "48px", height: "48px", minWidth: 'initial', padding: 'initial' }}
                                            onClick={async () => {
                                                logger.debug("download_build", build.id, build.head_sha);

                                                await serverAPI.callPluginMethod<{}, {}>("download_build", {
                                                    id: build.id,
                                                    head_sha: build.head_sha,
                                                    bearer_token: bearerToken
                                                });
                                                logger.debug("finished downloading", build.id, build.head_sha);
                                                closeModal();
                                            }} >
                                            <FaDownload />
                                        </DialogButton>
                                    </div>

                                </div>


                            </>
                        )
                    })}


            </div>
        </ModalRoot>)
}

export const Developer: VFC<{ serverAPI: ServerAPI; }> = ({ serverAPI }) => {
    const logger = new Logger("Developer");
    const [logging, setLogging] = useState(localStorage.getItem('enableLogger') === 'true');
    const [firstLaunch, setFirstLaunch] = useState(localStorage.getItem('js_firstlaunch') === 'true');

    const toggleFirstLaunch = async (value: string) => {
        localStorage.setItem('js_firstlaunch', value);
    }
    const toggleLogging = async (value: string) => {
        localStorage.setItem('enableLogger', value);
    }

    return (
        <div>
            <ToggleField
                label="Enable UI Logging"
                checked={logging}
                onChange={(newValue) => toggleLogging(newValue.toString())}


            />
            <ToggleField
                label="Set first Launch"
                checked={firstLaunch}
                onChange={(newValue) => toggleFirstLaunch(newValue.toString())}
            />
            <PanelSection>
                <DialogButton

                    onClick={async () => {
                        showModal(<ConfirmModal strTitle="Confirm" strDescription={"Reset all achievements?"} onOK={() => { resetAchievements(); }} />)
                    }}
                >
                    Reset Achievements
                </DialogButton>
            </PanelSection>
            <PanelSection>
                <DialogButton

                    onClick={async () => {
                        showModal(<BuildDownloader serverAPI={serverAPI} />)
                    }}
                >
                    {" Download github builds (testers only)"}
                </DialogButton>
            </PanelSection>
        </div>

    );
};
