import { ConfirmModal, Focusable, ModalRoot, ModalRootProps, PanelSection, ServerAPI, ToggleField, gamepadTabbedPageClasses, showModal } from "decky-frontend-lib";
import { get } from "mobx";
import { VFC, useState } from "react";
import { AchievementDetails, addAchievement, getAchievementDetails, getAchievements, hasAchievement } from "./Utils/achievements";
import { IconContext } from "react-icons";
import { contentTabsContainerClass, gridContentContainerClass } from "./Components/GridContent";
export interface AchievementModalProps extends ModalRootProps {
    achievement: AchievementDetails;

}
export const AchievementDisplay:VFC<AchievementModalProps> = ({ achievement, onCancel, onOK, onEscKeypress, bAllowFullSize, bCancelDisabled, bOKDisabled, closeModal }) => {
    return (
        <ModalRoot
            onCancel={onCancel}
            onOK={onOK}
            onEscKeypress={onEscKeypress}
            bAllowFullSize={bAllowFullSize}
            bCancelDisabled={bCancelDisabled}
            bOKDisabled={bOKDisabled}
            closeModal={closeModal}
        >
            <Focusable
                focusable={true} noFocusRing={false}>
                <PanelSection title="Achievement">
                    <div>
                        <IconContext.Provider value={{ className: "shared-class", size: 100 }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                {achievement.icon}
                                </div>
                                <h2>{achievement.name}</h2>
                                <p>{achievement.description}</p>
                           
                        </IconContext.Provider>
                    </div>

                </PanelSection>
            </Focusable>
        </ModalRoot>

    );
};

export const Achievements: VFC<{ serverAPI: ServerAPI; }> = ({ serverAPI }) => {

    const [achievements, setAchievements] = useState(getAchievements())
    

    return (
        <>
            <style>{`
                .${contentTabsContainerClass} .${gamepadTabbedPageClasses.TabContentsScroll} {
                    scroll-padding-top: calc( var(--basicui-header-height) + 140px ) !important;
                    scroll-padding-bottom: 80px;
                }
                .${contentTabsContainerClass} .${gamepadTabbedPageClasses.TabContents} .${gridContentContainerClass} {
                    padding-top: 15px;
                }
            `}</style>
            <Focusable
                className={gridContentContainerClass}
                style={{
                    display: "flex", gap: '15px', width: '100%', flexWrap: 'wrap', padding: '15px'
                
                }}
            >

                <IconContext.Provider value={{ className: "shared-class", size: 100 }}>
                    {achievements.map((achievement) => {
                        const details = getAchievementDetails(achievement);
                        return (
                            <Focusable
                                onActivate={() => {
                                    showModal(<AchievementDisplay achievement={details} />)
                                    if (hasAchievement('MTE=') === false) {
                                        addAchievement('MTE=')
                                        setAchievements(getAchievements())
                                    }
                                        

                                }}
                                onOKActionDescription="Show details"

                                style={{ width: 100, position: 'relative' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div

                                        style={{
                                            position: 'relative',
                                            margin: 'auto',
                                            display: 'flex'
                                        }}
                                     key={achievement}>

                                        {details.icon}

                                    </div>
                                </div>
                            </Focusable>

                        );
                    }
                    )}
                </IconContext.Provider>
            </Focusable>
        </>
    );
};
