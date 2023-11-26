import { DialogBody, DialogButton, DialogControlsSection, Field, Focusable, Navigation, PanelSection, ServerAPI, TextField, ToggleField } from "decky-frontend-lib";
import { VFC, useEffect, useRef, useState } from "react";
import { HiOutlineQrCode } from "react-icons/hi2";
import { SiBitcoin, SiDiscord, SiEthereum, SiGithub, SiGithubsponsors, SiMonero } from "react-icons/si";
import { showQrModal } from "./MainMenu";
import Logger from "./Utils/logger";


export const About: VFC<{ serverAPI: ServerAPI; }> = ({ serverAPI }) => {
    const [url, setUrl] = useState("https://github.com/ebenbruyns/junk-scripts/releases/download/Beta-0.1/Junk-Scripts-0.1.zip");
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
            link: "",
            buttonText: "Donate Bitcoin",
        },
        {
            label: "Etherium",
            icon: <SiEthereum />,
            link: "",
            buttonText: "Donate Etherium",
        },
        {
            label: "Monero",
            icon: <SiMonero />,
            link: "",
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
    // useEffect(() => {
    //     // Create a WebSocket connection to the backend server


    //     // Listen for messages from the backend server
    //     socket.onmessage = (event) => {
    //         logger.debug("Received message: " + event.data);
    //         const message = event.data;
    //         // Update the UI with the received output
    //         setOutput((prevOutput) => prevOutput + message);
    //         if (textareaRef.current !== null) {
    //             textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    //         }
    //     };

    //     // // Clean up the WebSocket connection
    //     // return () => {
    //     //     socket.close();
    //     // };
    // }, []);
    return (
        <DialogBody style={{ margin: "40px" }}>
            <DialogControlsSection style={{ height: "calc(100%)" }}>
                <div>Junk Store is a flexible and extensible frontend. You can use a custom backend to provide the content for the store.
                    This does come with security concerns so beware of what you download. You can create your own custom backends too by following
                    the instructions <a href="https://github.com/ebenbruyns/junkstore/wiki/Custom-Backends">here</a>.</div>
                <br />

                <TextField placeholder="Enter URL" value={url} onChange={(e) => setUrl(e.target.value)} />
                <ToggleField label="Backup" checked={backup === "true"}
                    onChange={(newValue) => setBackup(newValue.toString())} />
                <PanelSection>
                    <DialogButton onClick={download}>Download</DialogButton>
                </PanelSection>
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
                        style={{ width: "100%", height: "200px" }}
                        value={output}
                    />
                </PanelSection>
                <PanelSection>
                    <DialogButton
                        onClick={async () => {
                            await serverAPI.callPluginMethod("reload", {})
                        }}>Restart</DialogButton>
                </PanelSection>
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
            </DialogControlsSection>
        </DialogBody >
    );
};
