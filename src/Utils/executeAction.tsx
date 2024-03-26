import { ServerAPI, ToastData, showModal } from "decky-frontend-lib";
import { ContentError, ContentResult, ContentType, ExecuteArgs, LaunchOptions, SuccessContent } from "../Types/Types";
import Logger from "./logger";
import { ErrorModal } from "../ErrorModal";
import { runApp } from "./utils";
import { configureShortcut } from './utils';
import { getAppDetails } from './utils';

//* this is where you will be assuming the type of content and if the case is amibigous you can use type unions and deal with each possiblitiy outside the function
export async function executeAction<Arguments extends ExecuteArgs, Content extends ContentType>(serverAPI: ServerAPI, actionSet: string, actionName: string, args: Arguments, onExeExit?: () => void): Promise<ContentResult<Content> | null> {

    const logger = new Logger("executeAction");
    // logger.log(`actionSet: ${actionSet}, actionName: ${actionName}`);
    // logger.debug("Args: ", args);
    const res = await serverAPI.callPluginMethod<{}, ContentResult<Content | LaunchOptions | ContentError>>("execute_action", {
        actionSet: actionSet,
        actionName: actionName,
        ...args
    });

    if (!res.success) { //TODO: need to handle server response errors as well, idk if you wanna make it show the modal too
        //const errorMsg = res.result;
        return null;
    }

    if (res.result.Type === 'RunExe') {
        const newLaunchOptions = res.result.Content as LaunchOptions;
        if (args.appId) {
            const id = parseInt(args.appId);
            const details = getAppDetails(id);
            logger.log("details: ", details);
            const oldLaunchOptions: LaunchOptions = {
                Name: details?.strDisplayName || "",
                Exe: details?.strShortcutExe || "",
                WorkingDir: details?.strShortcutStartDir || "",
                Options: details?.strShortcutLaunchOptions || "",
                CompatToolName: details?.strCompatToolName,
                Compatibility: !!details?.strCompatToolName
            };
            configureShortcut(id, newLaunchOptions);
            runApp(id, onExeExit, () => configureShortcut(id, oldLaunchOptions));
        }

        return null; //* does caller need to be able to distinguish this case or not
    }

    if (res.result.Type === 'Success') {
        const success = res.result.Content as SuccessContent;
        logger.debug("result: ", res);
        const data: ToastData = {
            title: "Junk-Store",
            body: success.Message,
        };
        if (success.Title) {
            data.title = success.Title;
        }

        if (success.Toast !== false) {
            logger.debug("toasting: ", data);
            serverAPI.toaster.toast(data);
        }
    }

    if (res.result.Type === 'Error') {
        const error = res.result.Content as ContentError; //only acceptable if this is gauranteed that in this case (res.result.Type === 'Error') Content is indeed ContentError
        showModal(<ErrorModal Error={error} />);
        logger.error("result: ", res);
        return null;
    }

    return res.result as ContentResult<Content>; //only acceptable because we've handle the other possibilities explicitly
}