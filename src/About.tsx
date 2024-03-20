import { DialogBody, DialogButton, DialogControlsSection, Field, Focusable, Navigation, PanelSection, ServerAPI, SidebarNavigation, TextField, ToggleField } from "decky-frontend-lib";
import { VFC, useEffect, useRef, useState } from "react";
import { HiOutlineQrCode } from "react-icons/hi2";
import { SiDiscord, SiGithub, SiGithubsponsors, SiKofi } from "react-icons/si";
import { showQrModal } from "./MainMenu";
import Logger from "./Utils/logger";
import { LogViewer } from "./LogViewer";
import { ScrollableWindowRelative } from './ScrollableWindow';


export const About: VFC<{ serverAPI: ServerAPI; }> = ({ serverAPI }) => {
    const [url, setUrl] = useState("");
    const [backup, setBackup] = useState("false");
    const [reloading, setReloading] = useState(false);
    const logger = new Logger("About");
    const [output, setOutput] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const socket = useRef<WebSocket | null>(null);
    const [isInstalling, setIsInstalling] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const download = async () => {
        console.log("Download: ", url);
        setIsDownloading(true);
        await serverAPI.callPluginMethod("download_custom_backend", {
            url: url,
            backup: backup
        });
        await serverAPI.callPluginMethod("reload", {})
        setIsDownloading(false);
    };
    const socialLinks = [
        {
            label: "Discord",
            icon: <SiDiscord />,
            link: "https://discord.gg/uqemZ6cfHe",
            buttonText: "Join Us",
        },
        {
            label: "Ko-Fi",
            icon: <SiKofi />,
            link: "https://ko-fi.com/junkrunner",
            buttonText: "Buy me a coffee",
        },
        {
            label: "GitHub",
            icon: <SiGithub />,
            link: "https://github.com/ebenbruyns/junkstore",
            buttonText: "Report issues",
        },
        {
            label: "Sponsor on GitHub",
            icon: <SiGithubsponsors />,
            link: "https://github.com/sponsors/ebenbruyns",
            buttonText: "Sponsor",
        }
    ];
    useEffect(() => {
        // Create a WebSocket connection to the backend server
        socket.current = new WebSocket("ws://localhost:8765/ws");

        // Listen for messages from the backend server
        socket.current.onmessage = (event) => {
            logger.debug("Received message: " + event.data);

            const message = JSON.parse(event.data)
            // Update the UI with the received output
            setOutput((prevOutput) => prevOutput + message.data + "\n");
            if (textareaRef.current !== null) {
                textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
            }
            if (message.status === "closed") {
                setIsInstalling(false)
            }
        };

        // Clean up the WebSocket connection
        return () => {
            if (socket.current) {
                socket.current.close();
            }
        };
    }, []);
    const getRuntimeId = (name: string) => {
        // @ts-ignore
        const app = appStore.allApps.filter(a => a.display_name.startsWith(name))
        if (app.length === 0) {
            return -1
        }
        else
            return app[0].appid
    }

    const isRuntimeInstalled = (name: string) => {

        // @ts-ignore
        return appStore.GetAppOverviewByAppID(getRuntimeId(name)).local_per_client_data.installed

    }

    return (
        <DialogBody>
            <DialogControlsSection style={{ height: "calc(100%)" }}>
                <SidebarNavigation key="1" pages={[
                    {
                        title: "Custom Backend",
                        content: <><PanelSection>
                            <div>Junk Store is a flexible and extensible frontend. You can use a custom backend to provide the content for the store.
                                This does come with security concerns so beware of what you download. You can create your own custom backends too by following
                                the instructions on github.
                                <br />
                                <br />
                                <DialogButton onClick={() => {
                                    Navigation.NavigateToExternalWeb("https://github.com/ebenbruyns/junkstore/wiki/Custom-Backends");
                                }
                                }>Learn More</DialogButton>
                            </div>
                            <br />
                        </PanelSection>
                            <PanelSection>
                                <TextField placeholder="Enter URL" value={url} onChange={(e) => setUrl(e.target.value)} />
                            </PanelSection>
                            <PanelSection> <ToggleField label="Backup" checked={backup === "true"}
                                onChange={(newValue) => setBackup(newValue.toString())} />
                            </PanelSection>
                            <PanelSection>
                                <DialogButton
                                    disabled={isDownloading}
                                    onClick={download}>{isDownloading ? "Downloading..." : "Download"} </DialogButton>
                            </PanelSection>
                        </>
                    },
                    {
                        title: "Dependencies",
                        content: <>


                            <PanelSection>


                                <DialogButton
                                    disabled={isInstalling}
                                    onClick={async () => {
                                        try {
                                            logger.debug("Sending message: install_dependencies");
                                            if (socket.current) {
                                                setOutput("");
                                                setIsInstalling(true);
                                                socket.current.send(JSON.stringify({ action: "install_dependencies" }));
                                            }
                                        }
                                        catch (e) {
                                            logger.debug(e);
                                        }
                                    }}
                                >
                                    {isInstalling ? "Working..." : "Install Dependencies"}
                                </DialogButton>
                                <textarea
                                    ref={textareaRef}
                                    style={{ width: "100%", height: "200px", marginTop: "10px" }}
                                    value={output}
                                />
                            </PanelSection>
                            <PanelSection>
                                <DialogButton
                                    disabled={reloading}
                                    onClick={async () => {
                                        setReloading(true);
                                        await serverAPI.callPluginMethod("reload", {})
                                        setReloading(false);
                                    }}>
                                    {reloading == true ? "Reloading Scripts..." : "Reload scripts"}
                                </DialogButton>
                            </PanelSection>
                            <PanelSection>
                                <DialogButton
                                    disabled={isRuntimeInstalled("Proton EasyAntiCheat Runtime")}
                                    onClick={async () => {
                                        await SteamClient.Installs.OpenInstallWizard([getRuntimeId("Proton EasyAntiCheat Runtime")]);
                                    }
                                    }>Install Proton Easy Anti Cheat</DialogButton>

                            </PanelSection>

                            <PanelSection>
                                <DialogButton
                                    disabled={isRuntimeInstalled("Proton BattlEye Runtime")}
                                    onClick={async () => {
                                        await SteamClient.Installs.OpenInstallWizard([getRuntimeId("Proton BattlEye Runtime")]);
                                    }
                                    }>Install Proton BattlEye Runtime</DialogButton>

                            </PanelSection>
                        </>
                    },
                    {
                        title: "Support",
                        content: <>
                            <div
                                style={{
                                    display: 'flex',
                                    flex: 'auto',
                                    flexDirection: 'column',
                                    gap: '10px'
                                }}>
                                <div style={{ padding: '0 15px', flex: 'auto', display: 'flex' }}>
                                    <ScrollableWindowRelative>
                                        <div style={{ padding: '5px 0' }}>

                                            I try to make the Junk Store as easy to use as possible, but it is still a work in progress. While it  is free for you to use and download, this is first and foremost a passion project.
                                            <br />
                                            <br />
                                            There is quite a large vision for Junk Store and a lot that I would like to add, such as support for more stores, platforms, features, etc. Ultimately I would like to create a platform that allows anyone to create their own scripts and share them with the community. A platform that allows anyone to contribute settings and scripts for games and stores.
                                            <br />
                                            <br />

                                            To test the waters and to try and gauge interest in something like this, the first part has been gifted to the community to help you get more out of your gaming collection and experience.
                                            <br />
                                            <br />

                                            This is something I would like to continue adding to for your benefit, however as the saying goes 'time is money'. I would love to be able to work on this full time, however that is simply not possible without some form of income. To make my vision a reality, I would be grateful if you would consider contributing to the growth of Junk Store and this project.
                                            <br />
                                            <br />

                                            If you like what I'm doing please consider supporting me. I have a Github Sponsors page. I have also arranged to accept donations in Bitcoin, Etherium and Monero as requested by some. If you would like to support me in other ways please contact me on Discord.

                                            <br />
                                            <br />
                                        </div>
                                    </ScrollableWindowRelative>
                                </div>
                                <Focusable style={{ display: "flex", flexDirection: "column" }}>
                                    {socialLinks.map((linkInfo, index) => (
                                        <Field
                                            key={index}
                                            label={linkInfo.label}
                                            icon={linkInfo.icon}
                                            bottomSeparator={"none"}
                                            padding={"none"}
                                            indentLevel={1}
                                        >
                                            <Focusable
                                                style={{
                                                    marginLeft: "auto",
                                                    boxShadow: "none",
                                                    display: "flex",
                                                    justifyContent: "right",
                                                    padding: "4px",
                                                }}
                                            >
                                                <DialogButton
                                                    onClick={() => {
                                                        Navigation.NavigateToExternalWeb(linkInfo.link);
                                                    }}
                                                    style={{
                                                        padding: "10px",
                                                        fontSize: "14px",
                                                    }}
                                                >
                                                    {linkInfo.buttonText}
                                                </DialogButton>
                                                <DialogButton
                                                    onClick={() => {
                                                        showQrModal(linkInfo.link);
                                                    }}
                                                    style={{
                                                        display: "flex",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        padding: "10px",
                                                        maxWidth: "40px",
                                                        minWidth: "auto",
                                                        marginLeft: ".5em",
                                                    }}
                                                >
                                                    <HiOutlineQrCode />
                                                </DialogButton>
                                            </Focusable>
                                        </Field>
                                    ))}
                                </Focusable>
                            </div>
                        </>
                    },
                    {
                        title: "About",
                        content: (
                            <div style={{ padding: '0 15px', height: '100%', display: 'flex' }}>
                                <ScrollableWindowRelative>
                                    <div style={{ padding: '5px 0' }}>
                                        <div>
                                            Junk Store was born out of neccessity. I wanted a way to quickly and easily install and update games not
                                            available on Steam. I also wanted to be able to install games from other stores like GOG and Epic Games.
                                            <br />
                                            <br />
                                            It all started with DOS games but quickly grew to something more generic. If you can feed the plugin the relevant
                                            information it can install it.
                                            <br />
                                            <br />
                                            I hope you enjoy it.
                                            <br />
                                            <br />
                                            P.S. If you want to contribute to the project please contact me on Discord.
                                            <br />
                                            <br />
                                            <h2>Contributors</h2>
                                            <ul>
                                                <li>Eben Bruyns - Main Developer</li>
                                                <li>Logan (Beebles) - UI Developer</li>
                                                <li>Jesse Bofill - UI Developer</li>
                                            </ul>
                                        </div>
                                    </div>
                                </ScrollableWindowRelative>
                            </div>
                        )
                    },
                    {
                        title: "Logs",
                        content: <LogViewer serverAPI={serverAPI}></LogViewer>
                    }
                ]}

                    showTitle

                />
            </DialogControlsSection >
        </DialogBody >
    );
};
