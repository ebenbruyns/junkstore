import { PanelSection, ModalRoot, Focusable, } from "decky-frontend-lib";
import { VFC } from "react";
import { ErrorModalProps } from "./ConfEditor";
import { ErrorDisplay } from "./Components/ErrorDisplay";
import { addAchievement } from "./Utils/achievements";


export const ErrorModal: VFC<ErrorModalProps> = ({ Error, onCancel, onOK, onEscKeypress, bAllowFullSize, bCancelDisabled, bOKDisabled, closeModal }) => {
    addAchievement("MQ==")
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
                <PanelSection title="Error">
                    <ErrorDisplay error={Error} />

                </PanelSection>
            </Focusable>
        </ModalRoot>
    );
};
