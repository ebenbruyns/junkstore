import { ButtonItem, Navigation, PanelSection, PanelSectionRow } from "decky-frontend-lib";
import { VFC } from "react";
import { StoreContent } from "./Types/Types";
/**
 * Renders the main menu of the Junk Store.
 * @param content - The content of the store.
 * @param initActionSet - The initial action set.
 * @param initAction - The initial action.
 * @returns A React component that renders the main menu of the Junk Store.
 */
// @ts-ignore
export const MainMenu: VFC<{ content: StoreContent; initActionSet: string; initAction: string }> = ({ content, initAction, initActionSet }) => {
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
            <PanelSection title="Download Custom Backend">
                <PanelSectionRow>
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
