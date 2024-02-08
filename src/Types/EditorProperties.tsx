import { ServerAPI } from "decky-frontend-lib";

export interface EditorProperties {
    serverAPI: ServerAPI;
    initActionSet: string;
    initAction: string;
    contentId: string;
    closeModal?: any;
}
export interface ExeRunnerProperties extends EditorProperties {

    shortName: string;
    closeParent: () => void;

}
