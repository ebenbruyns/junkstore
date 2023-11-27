import { DialogBody, DialogButton, DialogControlsSection, Field, Focusable, Navigation, PanelSection, ServerAPI, SidebarNavigation, TextField, ToggleField } from "decky-frontend-lib";
import { VFC, useEffect, useRef, useState } from "react";
import { HiOutlineQrCode } from "react-icons/hi2";
import { SiBitcoin, SiDiscord, SiEthereum, SiGithub, SiGithubsponsors, SiMonero } from "react-icons/si";
import { showQrModal } from "./MainMenu";
import Logger from "./Utils/logger";


export const About: VFC<{ serverAPI: ServerAPI; }> = ({ serverAPI }) => {
    //const [url, setUrl] = useState("https://github.com/ebenbruyns/junk-scripts/releases/download/Beta-0.1/Junk-Scripts-0.1.zip");
    const [url, setUrl] = useState("");
    const [backup, setBackup] = useState("false");
    const logger = new Logger("About");
    const download = async () => {
        console.log("Download: ", url);
        await serverAPI.callPluginMethod("download_custom_backend", {
            url: url,
            backup: backup
        });
        await serverAPI.callPluginMethod("reload", {})
        Navigation.OpenQuickAccessMenu();
    };
    const socialLinks = [
        {
            label: "Discord",
            icon: <SiDiscord />,
            link: "https://discord.gg/uqemZ6cfHe",
            buttonText: "Join Us",
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
        },
        {
            label: "Bitcoin",
            icon: <SiBitcoin />,
            link: "12saVtAXKwm8XdqD7WvMH61mP52nnTVnHA",
            buttonText: "Donate Bitcoin",
        },
        {
            label: "Etherium",
            icon: <SiEthereum />,
            link: "0x7c7d1a0a3f7627f2951639d901427d8e241ec62d",
            buttonText: "Donate Etherium",
        },
        {
            label: "Monero",
            icon: <SiMonero />,
            link: "82bGCPczfeMZjAGpNXwwBV1KnZx54mSuWCxFRuJ7xDjziUkRuBwciHFGENsWZBZ97veMdJyYDbLuqgeKL1LsFoXv6gQkaRb",
            buttonText: "Donate Monero",
        }
    ];
    const [output, setOutput] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const socket = useRef<WebSocket | null>(null);

    useEffect(() => {
        // Create a WebSocket connection to the backend server
        socket.current = new WebSocket("ws://localhost:8765/ws");

        // Listen for messages from the backend server
        socket.current.onmessage = (event) => {
            logger.debug("Received message: " + event.data);
            const message = event.data;
            // Update the UI with the received output
            setOutput((prevOutput) => prevOutput + message);
            if (textareaRef.current !== null) {
                textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
            }
        };

        // Clean up the WebSocket connection
        return () => {
            if (socket.current) {
                socket.current.close();
            }
        };
    }, []);

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
                                <DialogButton onClick={download}>Download</DialogButton>
                            </PanelSection>
                        </>
                    },
                    {
                        title: "Dependencies",
                        content: <>


                            <PanelSection>
                                <DialogButton
                                    onClick={async () => {
                                        try {
                                            logger.debug("Sending message: install_dependencies");
                                            if (socket.current) {
                                                setOutput("");
                                                socket.current.send(JSON.stringify({ action: "install_dependencies" }));
                                            }
                                        }
                                        catch (e) {
                                            logger.debug(e);
                                        }
                                    }}>Install Dependencies</DialogButton>
                                <textarea
                                    ref={textareaRef}
                                    style={{ width: "100%", height: "200px", marginTop: "10px" }}
                                    value={output}
                                />
                            </PanelSection>
                            <PanelSection>
                                <DialogButton
                                    onClick={async () => {
                                        await serverAPI.callPluginMethod("reload", {})
                                    }}>Restart</DialogButton>
                            </PanelSection>
                        </>
                    },
                    {
                        title: "Support",
                        content: <>
                            <PanelSection>
                                <Focusable style={{ display: "flex", flexDirection: "column" }}>
                                    {socialLinks.map((linkInfo, index) => (
                                        <Field
                                            key={index}
                                            label={linkInfo.label}
                                            icon={linkInfo.icon}
                                            bottomSeparator={"none"}
                                            padding={"none"}
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

                            </PanelSection>
                        </>
                    },
                    {
                        title: "About",
                        content: <>
                            <PanelSection>
                                <div>
                                    Junk Store was born out of neccessity. I wanted a way to quickly and easily install and update games not
                                    available on Steam. I also wanted to be able to install games from other stores like GOG and Epic Games.
                                    <br />
                                    It all started with DOS games but quickly grew to something more generic. If you can feed the plugin the relevant
                                    information it can install it.
                                    <br />

                                    I hope you enjoy it.
                                    <br />
                                    P.S. If you want to contribute to the project please contact me on Discord.
                                    <br />
                                </div>
                            </PanelSection>
                        </>
                    }
                ]}

                    showTitle

                />
            </DialogControlsSection>
        </DialogBody >
    );
};
