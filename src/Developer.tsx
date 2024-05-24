import { ConfirmModal, DialogButton, DropdownItem, Field, Focusable, ModalRoot, PanelSection, PanelSectionRow, ServerAPI, Spinner, TextField, ToggleField, gamepadDialogClasses, quickAccessControlsClasses, quickAccessMenuClasses, showModal } from "decky-frontend-lib";
import { CSSProperties, VFC, useEffect, useState } from "react";
import { resetAchievements } from "./Utils/achievements";

import Logger from "./Utils/logger";
import { FaDownload } from "react-icons/fa6";
import { Loading } from './Components/Loading';
export interface BuildDownloaderProps {
    serverAPI: ServerAPI;
    closeModal?: any;
}

type Build = {
    id: number;
    head_sha: string;
    title: string;
    date: string;
};

const buildModalRootClass = 'build-modal-root';
const outerContainerClass = 'outer-container';

export const BuildDownloader: VFC<BuildDownloaderProps> = ({ serverAPI, closeModal }) => {
    const logger = new Logger("BuildDownloader");
    const [builds, setBuilds] = useState<Build[]>([]);
    const [loading, setLoading] = useState(true);
    const [value, setValue] = useState("");
    const [bearerToken, setBearerToken] = useState(localStorage.getItem('js_gh_bearerToken') || "");
    const [branch, setBranch] = useState(localStorage.getItem('js_gh_branch') || "main");
    const get_builds = async (token: string) => {
        setLoading(true);
        const res = await serverAPI.callPluginMethod<{}, Build[]>("get_latest_builds", {
            branch: branch,
            bearer_token: token
        });
        logger.log("get_latest_builds", res);

        setBuilds(res.success ? res.result : []);
        setLoading(false);
    };

    useEffect(() => {
        get_builds(bearerToken);
    }, [branch, bearerToken]);

    return (
        <>
            <style>{`
            .${buildModalRootClass} .${quickAccessMenuClasses.PanelSection} {
                padding: 0;
            }
            .${buildModalRootClass} .${outerContainerClass} .${gamepadDialogClasses.Field} {
                --field-negative-horizontal-margin: 2.8vw;
                padding: 8px 35px;
            }
            `}</style>
            <ModalRoot className={buildModalRootClass} onCancel={closeModal}>
                <div className={outerContainerClass} style={{ marginBottom: '20px' }}>
                    <PanelSectionRow>
                        <Field
                            bottomSeparator='none'
                            description={
                                <>
                                    <div style={{ paddingBottom: "6px" }} className={quickAccessControlsClasses.PanelSectionTitle}>
                                        Github Token
                                    </div>
                                    <Focusable style={{ display: 'flex', gap: '10px' }}>
                                        {bearerToken === "" && (
                                            <div style={{ width: '100%' }}>
                                                <TextField
                                                    style={{ overflow: 'hidden' }}
                                                    placeholder='Enter Token'
                                                    value={value}
                                                    onChange={(e) => setValue(e.target.value)}
                                                />
                                            </div>
                                        )}
                                        <DialogButton
                                            style={{ flex: 'auto', width: 'auto' }}
                                            onClick={() => {
                                                const token = bearerToken === '' ? value : '';
                                                localStorage.setItem('js_gh_bearerToken', token);
                                                setBearerToken(token);
                                                setValue('');
                                            }}
                                        >
                                            {bearerToken === "" ? "Save Token" : "Clear Token"}
                                        </DialogButton>
                                    </Focusable>
                                </>
                            }
                        />
                    </PanelSectionRow>
                    <PanelSectionRow>
                        <DropdownItem
                            bottomSeparator='none'
                            label={<div style={{ padding: '0' }} className={quickAccessControlsClasses.PanelSectionTitle}>Branch</div>}
                            menuLabel="Branch"
                            selectedOption={branch}
                            onChange={(e) => {
                                setBranch(e.data);
                                localStorage.setItem('js_gh_branch', e.data);
                            }}
                            rgOptions={[
                                {
                                    data: "main",
                                    label: "Stable",
                                },
                                {
                                    data: "development",
                                    label: "Development",
                                }
                            ]}
                        />
                    </PanelSectionRow>
                </div>
                <div style={{ margin: '0 5px', background: '#02000b8a' }}>
                    {loading ?
                        <div style={{ padding: '10px 0' }}>
                            <div style={{ marginBottom: '8px', fontSize: '12px', textAlign: 'center', color: '#969696' }}>Getting Builds...</div>
                            <div style={{ height: '80px' }}>
                                <Loading flex={true} />
                            </div>
                        </div>
                        :
                        <PanelSection>
                            <div style={{ padding: '15px 0' }} className={quickAccessControlsClasses.PanelSectionTitle}>Latest Builds</div>
                            {builds.map((build) =>
                                <PanelSectionRow>
                                    <Field
                                        onOKActionDescription='Download'
                                        label={
                                            <div style={{ display: 'flex', width: '100%', gap: '20px', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', flex: 'auto' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px' }}>
                                                        <div>Junk-Store-{build.head_sha}.zip</div>
                                                        <div style={{ fontSize: '12px', color: '#969696', textAlign: 'right' }}>{build.date}</div>
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: '#969696' }}>{build.title}</div>
                                                </div>
                                                <DownloadButton
                                                    style={{ height: '40px', width: "48px", minWidth: 'initial', padding: 'initial' }}
                                                    download={async () => {
                                                        logger.debug("download_build", build.id, build.head_sha);
                                                        await serverAPI.callPluginMethod<{}, {}>("download_build", {
                                                            id: build.id,
                                                            head_sha: build.head_sha,
                                                            bearer_token: bearerToken
                                                        });
                                                        logger.debug("finished downloading", build.id, build.head_sha);
                                                        closeModal();
                                                    }}
                                                />
                                            </div>
                                        }
                                    />
                                </PanelSectionRow>
                            )}
                        </PanelSection>
                    }
                </div>
            </ModalRoot>
        </>
    );
};

const DownloadButton: VFC<{ download: () => Promise<any>, style: CSSProperties; }> = ({ download, style }) => {
    const [downloading, setDownloading] = useState(false);
    return (
        <DialogButton
            style={style}
            onClick={async () => {
                setDownloading(true);
                await download();
                setDownloading(false);
            }}
        >
            {downloading ? <Spinner style={{ height: '25px', verticalAlign: 'middle' }} /> : <FaDownload />}
        </DialogButton>
    );
};

export const Developer: VFC<{ serverAPI: ServerAPI; }> = ({ serverAPI }) => {
    const logger = new Logger("Developer");
    const [logging, setLogging] = useState(localStorage.getItem('enableLogger') === 'true');
    const [firstLaunch, setFirstLaunch] = useState(localStorage.getItem('js_firstlaunch') === 'true');

    const toggleFirstLaunch = (value: string) => localStorage.setItem('js_firstlaunch', value);
    const toggleLogging = (value: string) => localStorage.setItem('enableLogger', value);

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
                <DialogButton onClick={() => showModal(<ConfirmModal strTitle="Confirm" strDescription={"Reset all achievements?"} onOK={() => resetAchievements()} />)}>
                    Reset Achievements
                </DialogButton>
            </PanelSection>
            <PanelSection>
                <DialogButton onClick={() => showModal(<BuildDownloader serverAPI={serverAPI} />)}>
                    {" Download github builds (testers only)"}
                </DialogButton>
            </PanelSection>
        </div>
    );
};
