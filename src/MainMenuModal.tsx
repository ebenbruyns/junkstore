import { ModalRoot, ModalRootProps, ServerAPI } from "decky-frontend-lib";
import { VFC } from "react";
import { Content } from "./ContentTabs";

export interface MainMenuModalProps extends ModalRootProps {
    serverApi: ServerAPI
}
export const MainMenuModal: VFC<MainMenuModalProps> = ({ serverApi, onCancel, onOK, onEscKeypress, bAllowFullSize, bCancelDisabled, bOKDisabled, closeModal }) => {
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
            <Content serverAPI={serverApi} initActionSet="init" initAction="InitActions" closeModal={closeModal} />
        </ModalRoot>
    );
};
