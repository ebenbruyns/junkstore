import { PanelSection, ModalRoot, Focusable, } from "decky-frontend-lib";
import { VFC } from "react";
// import { Panel } from "./Components/Scrollable";
import { ErrorModalProps } from "./ConfEditor";
import { ErrorDisplay } from "./Components/ErrorDisplay";


export const ErrorModal: VFC<ErrorModalProps> = ({ Error, onCancel, onOK, onEscKeypress, bAllowFullSize, bCancelDisabled, bOKDisabled, closeModal }) => {
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
                // @ts-ignore
                focusable={true} noFocusRing={false}>
                <PanelSection title="Error">
                    <ErrorDisplay error={Error} />

                </PanelSection>
            </Focusable>
        </ModalRoot>
    );
};
