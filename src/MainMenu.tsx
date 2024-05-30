import { ButtonItem, ModalRoot, Navigation, PanelSection, PanelSectionRow, ServerAPI, showModal } from "decky-frontend-lib";
import { VFC, useEffect } from "react";
import { StoreContent } from "./Types/Types";
import QRCode from "react-qr-code";

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

export const MainMenu: VFC<{ serverApi: ServerAPI; content: StoreContent; initActionSet: string; initAction: string; closeModal?: ()=>any }> = ({
    serverApi,
    content,
    initAction,
    initActionSet,
closeModal}) => {
    useEffect(() => {
        if (localStorage.getItem('js_firstlaunch') != "false") {
            Navigation.CloseSideMenus();
            Navigation.Navigate("/about-junk-store");
            localStorage.setItem('js_firstlaunch', 'false');
        }
    }, []);

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
                                    if (closeModal)
                                        closeModal();
                                    Navigation.Navigate(`/junk-store-content/${encodeURIComponent(initActionSet)}/${encodeURIComponent(action.ActionId)}`);
                                }}
                            >
                                {action.Title}
                            </ButtonItem>
                        </PanelSectionRow>
                    ))}
                </PanelSection>
            ))}
            <PanelSection title="">

                <PanelSectionRow>

                    <ButtonItem
                        layout="below"
                        onClick={() => {
                            Navigation.CloseSideMenus();
                            if (closeModal)
                                closeModal();
                            Navigation.Navigate("/about-junk-store");
                        }}
                    >
                        About
                    </ButtonItem>
                </PanelSectionRow>
            </PanelSection>
        </>
    );
};
