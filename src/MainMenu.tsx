import {
    ButtonItem, PanelSection,
    PanelSectionRow,
    Router
} from "decky-frontend-lib";
import { VFC } from "react";
import { StoreContent } from "./Types";

export const MainMenu: VFC<{ content: StoreContent; initActionSet: string; initAction: string }> = ({ content, initAction, initActionSet }) => {
    return (
        <>
            {content.Panels.map((c) => (
                <PanelSection title={c.Title}>

                    {c.Actions && c.Actions.map((a) => (
                        <PanelSectionRow>

                            <ButtonItem
                                layout="below"
                                onClick={() => {
                                    Router.CloseSideMenus();
                                    Router.Navigate(`/store/${encodeURIComponent(initActionSet)}/${encodeURIComponent(a.ActionId)}`);
                                }}
                            >
                                {a.Title}
                            </ButtonItem>
                        </PanelSectionRow>))}

                </PanelSection>))}
            <PanelSection title="About">
                <PanelSectionRow>
                    <ButtonItem
                        layout="below"
                        onClick={() => {
                            Router.CloseSideMenus();
                            Router.Navigate("/support");
                        }}>Support us</ButtonItem>
                </PanelSectionRow>
            </PanelSection>
        </>

    );
};
