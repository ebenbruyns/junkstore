import { Button, ButtonItem, DialogButton, Field, Focusable, ModalRoot, Navigation, PanelSection, PanelSectionRow, ServerAPI, showModal } from "decky-frontend-lib";
import { SiBitcoin, SiDiscord, SiEthereum, SiGithub, SiGithubsponsors, SiMonero } from "react-icons/si";
import { VFC } from "react";
import { StoreContent } from "./Types/Types";
import QRCode from "react-qr-code";
import { HiOutlineQrCode } from "react-icons/hi2";
/**
 * Renders the main menu of the Junk Store.
 * @param content - The content of the store.
 * @param initActionSet - The initial action set.
 * @param initAction - The initial action.
 * @returns A React component that renders the main menu of the Junk Store.
 */
// @ts-ignore

export const showQrModal = (url: string) => {
    showModal(
        <ModalRoot>
            <div
                style={{
                    margin: "0 auto 1.5em auto",
                    padding: "1em", // Add padding for whitespace
                    borderRadius: "2em", // Add rounded corners
                    background: "#F5F5F5", // Light gray background color
                    boxShadow: "0 1em 2em rgba(0, 0, 0, 0.5)", // Dark gray shadow color
                }}
            >
                <QRCode value={url} size={256} fgColor="#000000" bgColor="#F5F5F5" />
            </div>
            <span style={{ textAlign: "center", wordBreak: "break-word" }}>
                {url}
            </span>
        </ModalRoot>,
        window,
    );
};

export const MainMenu: VFC<{ serverApi: ServerAPI; content: StoreContent; initActionSet: string; initAction: string }> = ({
    serverApi,
    content,
    // @ts-ignore
    initAction,
    initActionSet }) => {
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

    return (
        <>
            {content.Panels.map((panel) => (
                <PanelSection title={panel.Title}>
                    {panel.Actions && panel.Actions.map((action) => (
                        <PanelSectionRow>
                            <ButtonItem
                                layout="below"
                                onClick={() => {
                                    Navigation.CloseSideMenus();
                                    Navigation.Navigate(`/content/${encodeURIComponent(initActionSet)}/${encodeURIComponent(action.ActionId)}`);
                                }}
                            >
                                {action.Title}
                            </ButtonItem>
                        </PanelSectionRow>
                    ))}
                </PanelSection>
            ))}
            <PanelSection title="About">
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
                <PanelSectionRow>
                    <ButtonItem layout="below"
                        onClick={async () => {
                            await serverApi.callPluginMethod("reload", {})
                        }}>Re-initialize</ButtonItem>
                    <ButtonItem
                        layout="below"
                        onClick={() => {
                            Navigation.CloseSideMenus();
                            Navigation.Navigate("/custom-backend");
                        }}
                    >
                        Download
                    </ButtonItem>
                </PanelSectionRow>
            </PanelSection>
        </>
    );
};
