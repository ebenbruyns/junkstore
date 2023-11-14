import { ServerAPI, showModal } from "decky-frontend-lib";
import { ContentError, ContentResult } from "./Types/Types";
import Logger from "./Utils/logger";
import { ErrorModal } from "./ErrorModal";


export async function executeAction(serverAPI: ServerAPI, actionSet: string, actionName: string, args: {}): Promise<ContentResult> {
    const logger = new Logger("executeAction");
    logger.log(`OnInit: actionSet: ${actionSet}, actionName: ${actionName}, args: ${args}`);

    const res = await serverAPI.callPluginMethod<{}, ContentResult>("execute_action", {
        actionSet: actionSet,
        actionName: actionName,
        ...args
    });


    if ((res.result as ContentResult).Type === 'Error') {

        const error = (res.result as ContentResult).Content as ContentError;
        showModal(<ErrorModal Error={error} />);
        logger.error("result: ", res);
        return {} as ContentResult;
    }

    return res.result as ContentResult;
}
