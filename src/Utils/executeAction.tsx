import { AppDetails, LifetimeNotification, ServerAPI, ToastData, showModal } from "decky-frontend-lib";
import { ContentError, ContentResult, ContentType, ExecuteArgs, LaunchOptions, SuccessContent } from "../Types/Types";
import Logger from "./logger";
import { ErrorModal } from "../ErrorModal";
import { gameIDFromAppID } from "./gameIDFromAppID";

export interface GameStateUpdate {
    unAppID: number;
    nInstanceID: number;
    bRunning: boolean;
}


export async function runApp(id: number) {
    setTimeout(() => {

        let gid = gameIDFromAppID(id);
        SteamClient.Apps.RunGame(gid, "", -1, 100);
    }, 1500);
}

export async function configureShortcut(id: Number, launchOptions: LaunchOptions) {
    const logger = new Logger("configureShortcut");

    if (launchOptions) {
        logger.debug("launchOptions: ", launchOptions);
        await SteamClient.Apps.SetAppLaunchOptions(id, launchOptions.Options);
        await SteamClient.Apps.SetShortcutExe(id, launchOptions.Exe);
        await SteamClient.Apps.SetShortcutStartDir(id, launchOptions.WorkingDir);

        if (launchOptions.Compatibility) {
            await SteamClient.Apps.SpecifyCompatTool(id, launchOptions.CompatToolName);
        }
    }
}


//* this is where you will be assuming the type of content and if the case is amibigous you can use type unions and deal with each possiblitiy outside the function
export async function executeAction<Arguments extends ExecuteArgs, Content extends ContentType>(serverAPI: ServerAPI, actionSet: string, actionName: string, args: Arguments): Promise<ContentResult<Content> | null> { 

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
        const newLaunchOptions = res.result.Content as LaunchOptions; //only acceptable if this is gauranteed that in this case (res.result.Type === 'RunExe') Content is indeed LaunchOptions
        if (args.appId) {
            const id = parseInt(args.appId);
            const details = await getAppDetails(id)
            logger.log("details: ", details);
            const oldLaunchOptions: LaunchOptions = { //TODO: what happens if details is null? should it be handled specifically or should it be a allowed to set properties of undefined
                Name: details?.strDisplayName || "",
                Exe: details?.strShortcutExe || "",
                WorkingDir: details?.strShortcutStartDir || "",
                Options: details?.strShortcutLaunchOptions || "",
                CompatToolName: details?.strCompatToolName,
                Compatibility: !!details?.strCompatToolName
            };
            logger.debug("run with options: ", newLaunchOptions);

            //const launchOptions = await SteamClient.Apps.GetLaunchOptionsForApp(parseInt(args.appId))
            const { unregister } = SteamClient.GameSessions.RegisterForAppLifetimeNotifications((data: GameStateUpdate) => {
                logger.log("data: ", data)
                if (!data.bRunning) {
                    // This might not work in desktop mode.
                    let gamepadWindowInstance = SteamUIStore.m_WindowStore.GamepadUIMainWindowInstance
                    if (gamepadWindowInstance) {
                        setTimeout(async () => {
                            gamepadWindowInstance.NavigateBack();
                            unregister();
                            await configureShortcut(id, oldLaunchOptions);

                        }, 1000)
                    }
                }
            })
            await configureShortcut(id, newLaunchOptions);
            logger.debug("running app: ", id);
            const gameId = gameIDFromAppID(id)
            SteamClient.Apps.RunGame(gameId, "", -1, 100);
            //  runApp(id);
        }

        return null; //* does caller need to be able to distinguish this case or not
    }

    if (res.result.Type === 'Success') {
        const success = res.result.Content as SuccessContent
        logger.debug("result: ", res);
        const data: ToastData = {
            title: "Junk-Store",   
            body: success.Message,
        }
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

export async function getAppDetails(appId: number): Promise<AppDetails | null> {
    const logger = new Logger("getAppDetails");
    return await new Promise((resolve) => {
        let timeoutId: NodeJS.Timeout | undefined;
        try {
            const { unregister } = (SteamClient as SteamClientEx).Apps.RegisterForAppDetails(appId, (details) => {
                clearTimeout(timeoutId);
                unregister();
                logger.debug("App details: ", details);
                resolve(details);
            });

            timeoutId = setTimeout(() => {
                unregister();
                logger.debug("App details: timeout.");
                resolve(null);
            }, 1000);
        } catch (error) {
            clearTimeout(timeoutId);
            logger.error(error);
            resolve(null);
        }
    });
}




export interface SystemSuspendInfo {
    state: number;
}

export interface SystemResumeInfo {
    state: number;
    bGameSuspended: boolean;
}

export type AppResolutionOverrideConstants = "Default" | "Native";

export interface SteamClientEx {
    Apps: {
        AddShortcut: (appName: string, execPath: string, args: string, cmdLine: string) => Promise<number | undefined | null>;
        GetResolutionOverrideForApp: (appId: number) => Promise<AppResolutionOverrideConstants | string>;
        RegisterForAppDetails: (appId: number, callback: (details: AppDetails) => void) => { unregister: () => void };
        RemoveShortcut: (appId: number) => void;
        RunGame: (gameId: string, _1: string, _2: number, _3: number) => void;
        SetAppLaunchOptions: (appId: number, options: string) => void;
        SetAppResolutionOverride: (appId: number, resolution: AppResolutionOverrideConstants | string) => void;
        SetShortcutName: (appId: number, name: string) => void;
        TerminateApp: (gameId: string, _1: boolean) => void;
    };
    GameSessions: {
        RegisterForAppLifetimeNotifications: (callback: (data: LifetimeNotification) => void) => { unregister: () => void };
    };
    User: {
        RegisterForLoginStateChange: (callback: (username: string) => void) => { unregister: () => void };
        RegisterForPrepareForSystemSuspendProgress: (callback: (info: SystemSuspendInfo) => void) => { unregister: () => void };
        RegisterForResumeSuspendedGamesProgress: (callback: (info: SystemResumeInfo) => void) => { unregister: () => void };
        StartRestart: () => void;
    };
    System: {
        DisplayManager: {
            RegisterForStateChanges: (callback: () => void) => { unregister: () => void };
        };
    };
}