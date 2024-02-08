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


export async function runApp(id: number) {
    setTimeout(() => {

        let gid = gameIDFromAppID(id);
        SteamClient.Apps.RunGame(gid, "", -1, 100);
    }, 1000);
}

export async function configureShortcut(id: Number, launchOptions: LaunchOptions) {
    const logger = new Logger("configureShortcut");

    if (launchOptions) {
        await SteamClient.Apps.SetAppLaunchOptions(id, launchOptions.Options);
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

    const logger = new Logger("executeAction");
    logger.log(`actionSet: ${actionSet}, actionName: ${actionName},, args: ${args}`);
    const res = await serverAPI.callPluginMethod<{}, ContentResult>("execute_action", {
        actionSet: actionSet,
        actionName: actionName,
        ...args
    });

    if ((res.result as ContentResult).Type === 'RunExe') {

        const newLaunchOptions = (res.result as ContentResult).Content as LaunchOptions;
        // @ts-ignore
        if (args.appId) {
            // @ts-ignore
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
                    // This might not work in desktop mode.
                    // @ts-ignore
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