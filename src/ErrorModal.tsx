import { PanelSection, ModalRoot } from "decky-frontend-lib";
import { VFC } from "react";
import { Panel } from "./Components/Scrollable";
import { ErrorModalProps } from "./ConfEditor";


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
            <Panel focusable={true} noFocusRing={false}>
                <PanelSection title="Error">
                    <h1>Error</h1>
                    <div>ActionSet: {Error.ActionSet}</div>
                    <div>ActionName:{Error.ActionName}</div>

                    <div>Message: {Error.Message}</div>
                    <div>{Error.Data}</div>

                </PanelSection>
            </Panel>
        </ModalRoot>
    );
};
