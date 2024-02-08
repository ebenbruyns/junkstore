import { AppDetails, LifetimeNotification, ServerAPI, showModal } from "decky-frontend-lib";
import { ContentError, ContentResult, LaunchOptions } from "../Types/Types";
import Logger from "./logger";
import { ErrorModal } from "../ErrorModal";
import { gameIDFromAppID } from "./gameIDFromAppID";

export interface GameStateUpdate {
    unAppID: number;
    nInstanceID: number;
    bRunning: boolean;
}
class StateStack {
    public peekState(): any | undefined {
        return this.stack[this.stack.length - 1];
    }
    private static instance: StateStack;
    private stack: any[];

    private constructor() {
        this.stack = [];
    }

    public static getInstance(): StateStack {
        if (!StateStack.instance) {
            StateStack.instance = new StateStack();
        }
        return StateStack.instance;
    }

    public pushState(state: any): void {
        this.stack.push(state);
    }

    public popState(): any | undefined {
        return this.stack.pop();
    }

    public clearStack(): void {
        this.stack = [];
    }

    public getStackSize(): number {
        return this.stack.length;
    }
}

// Usage example:
// const stateStack = StateStack.getInstance();
// stateStack.pushState({ key: "value" });
// console.log(stateStack.popState()); // { key: "value" }
// console.log(stateStack.getStackSize()); // 0


// function updateRunningGames(update: GameStateUpdate) {
//     const logger = new Logger("updateRunningGames");
//     logger.log("update: ", update);
//     if (update.bRunning) {
//         SteamUIStore.OnGameRunStateChanged()
//     } else {

//     }
// }
// function showKeyboard() {
//     const logger = new Logger("executeAction");
//     logger.log("showKeyboard");
//     // 
// }

// function hideKeyboard() {
//     const logger = new Logger("executeAction");
//     logger.log("hideKeyboard");
//     // SteamUIStore.MainRunningApp.local_per_client_data.display_status = 11
// }
export async function runApp(id: number) {
    setTimeout(() => {

        let gid = gameIDFromAppID(id);
        SteamClient.Apps.RunGame(gid, "", -1, 100);
    }, 1000);
}

export async function configureShortcut(id: Number, launchOptions: LaunchOptions) {
    const logger = new Logger("configureShortcut");
    // @ts-ignore
    // const apps = appStore.allApps.filter(app => app.display_name == launchOptions.Name && app.app_type == 1073741824 && app.appid != id)
    // for (const app of apps) {
    //     logger.debug("removing shortcut", app.appid)
    //     await SteamClient.Apps.RemoveShortcut(app.appid);
    // }




    if (launchOptions) {
        //await SteamClient.Apps.SetAppLaunchOptions(gid, "");
        await SteamClient.Apps.SetAppLaunchOptions(id, launchOptions.Options);
        //await SteamClient.Apps.SetShortcutName(id, launchOptions.Name);
        await SteamClient.Apps.SetShortcutExe(id, launchOptions.Exe);
        await SteamClient.Apps.SetShortcutStartDir(id, launchOptions.WorkingDir);
        //@ts-ignore
        const defaultProton = settingsStore.settings.strCompatTool;

        if (launchOptions.Compatibility) {
            await SteamClient.Apps.SpecifyCompatTool(id, launchOptions.CompatToolName);
        }
    }
}

const cleanupIds = async () => {
    // @ts-ignore
    const apps = appStore.allApps.filter(app => (app.display_name == "bash" || app.display_name == "") && app.app_type == 1073741824)
    for (const app of apps) {
        await SteamClient.Apps.RemoveShortcut(app.appid);
    }
}

export async function executeAction(serverAPI: ServerAPI, actionSet: string, actionName: string, args: {}): Promise<ContentResult> {
    //let currentWindowID = SteamUIStore.WindowStore.GetAppFocusedWindowID()

    const logger = new Logger("executeAction");
    // if args has appId, get the existing launch options and pass a copy to the closerin REgisterForGameActionTaskChange

    // SteamClient.Apps.RegisterForGameActionTaskChange((data, a) => {
    //     logger.log("task change: ", data)
    //     logger.log("task change: ", a)

    //     // if (data.action === "launch") {
    //     //     SteamUIStore.MainRunningApp.local_per_client_data.display_status = 11
    //     //     SteamUIStore.WindowStore.SetAppFocusedWindowID(0, currentWindowID)
    //     // }
    // }
    logger.log(`actionSet: ${actionSet}, actionName: ${actionName},, args: ${args}`);
    // const unregisterGameUpdates = SteamClient.GameSessions.RegisterForAppLifetimeNotifications(updateRunningGames);
    // const unregisterOpenKeyboard = SteamClient.Input.RegisterForUserKeyboardMessages(showKeyboard)
    // const unregisterCloseKeyboard = SteamClient.Input.RegisterForUserDismissKeyboardMessages(hideKeyboard)
    // logger.log("Setting Timeout for 1 second to navigate to running app")
    // setTimeout(() => {
    //     if (SteamUIStore.MainRunningApp && SteamUIStore.MainRunningApp.appid != 0) {
    //         logger.log("Navigating to running app")
    //         if (SteamUIStore.WindowStore.m_mapAppWindows.size > 1) {
    //             SteamUIStore.NavigateToRunningApp();
    //             SteamUIStore.MainRunningApp.local_per_client_data.display_status = 4

    //         }
    //     }
    // }, 2000)
    // logger.log("running login app")
    const res = await serverAPI.callPluginMethod<{}, ContentResult>("execute_action", {
        actionSet: actionSet,
        actionName: actionName,
        ...args
    });
    // if (SteamUIStore.MainRunningApp) {
    //     SteamUIStore.MainRunningApp.local_per_client_data.display_status = 11
    //     let w = SteamUIStore.m_WindowStore.GamepadUIMainWindowInstance
    //     w.NavigateBack();

    // }

    // if (typeof unregisterGameUpdates === 'function') {
    //     unregisterGameUpdates();
    // }

    if ((res.result as ContentResult).Type === 'RunExe') {

        const newLaunchOptions = (res.result as ContentResult).Content as LaunchOptions;

        if (args.appId) {
            const id = parseInt(args.appId);
            const details = await getAppDetails(id)
            const oldLaunchOptions = {
                Name: details?.strDisplayName,
                Exe: details?.strShortcutExe,
                WorkingDir: details?.strShortcutStartDir,
                Options: details?.strShortcutLaunchOptions,
                CompatToolName: details?.strCompatToolName,
                Compatibility: details?.strCompatToolName ? true : false

            } as LaunchOptions;
            logger.debug("run with options: ", newLaunchOptions);

            //const launchOptions = await SteamClient.Apps.GetLaunchOptionsForApp(parseInt(args.appId))
            const { unregister } = SteamClient.GameSessions.RegisterForAppLifetimeNotifications((data: GameStateUpdate) => {
                logger.log("data: ", data)
                if (!data.bRunning) {
                    let w = SteamUIStore.m_WindowStore.GamepadUIMainWindowInstance
                    if (w) {
                        setTimeout(async () => {
                            w.NavigateBack();
                            unregister();
                            await configureShortcut(id, oldLaunchOptions);

                        }, 1000)
                    }
                }
            })
            await configureShortcut(id, newLaunchOptions);
            logger.debug("running app: ", id);
            runApp(id);
        }

        return {} as ContentResult;
    }
    if ((res.result as ContentResult).Type === 'Error') {

        const error = (res.result as ContentResult).Content as ContentError;
        showModal(<ErrorModal Error={error} />);
        logger.error("result: ", res);
        return {} as ContentResult;
    }

    return res.result as ContentResult;
}

export async function getAppDetails(appId: number): Promise<AppDetails | null> {
    return await new Promise((resolve) => {
        let timeoutId: NodeJS.Timeout | undefined;
        try {
            const { unregister } = (SteamClient as SteamClientEx).Apps.RegisterForAppDetails(appId, (details) => {
                clearTimeout(timeoutId);
                unregister();
                console.log("details: ", details);
                resolve(details);
            });

            timeoutId = setTimeout(() => {
                unregister();
                resolve(null);
            }, 1000);
        } catch (error) {
            clearTimeout(timeoutId);
            //logger.critical(error);
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