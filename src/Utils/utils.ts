import { LaunchOptions } from "../Types/Types";
import Logger from "./logger";

export enum AppRunStateChange {
    START,
    END,
    BOTH
}

export function gameIDFromAppID(appid: number) {
    let game = appStore.GetAppOverviewByAppID(appid);

    if (game) {
        return game.m_gameid;
    } else {
        return -1;
    }
};

export function getAppDetails(appId: number | string) {
    return appDetailsStore.GetAppDetails(typeof appId === 'string' ? parseInt(appId) : appId);
}

export function runApp(appId: number, onAppClose?: () => void, onAppLaunch?: () => void) {
    const logger = new Logger('runApp');
    logger.debug(`Running appId: ${appId}`)
    if (onAppLaunch) {
        const { unregister } = registerForAppRunStateChange(appId, () => {
            onAppLaunch();
            unregister();
        }, AppRunStateChange.START);
    }
    if (onAppClose) {
        const { unregister } = registerForAppRunStateChange(appId, () => {
            onAppClose();
            unregister();
        }, AppRunStateChange.END);
    }
    let gid = gameIDFromAppID(appId);
    if (gid && gid !== -1) SteamClient.Apps.RunGame(gid as string, "", -1, 100);
}

export function registerForAppRunStateChange(appId: number, callback: () => void, stateChange: AppRunStateChange): { unregister: () => void; } {
    return SteamClient.GameSessions.RegisterForAppLifetimeNotifications((data: { unAppID: number; nInstanceID: number; bRunning: boolean; }) => {
        if (data.unAppID !== appId) return;
        switch (stateChange) {
            case AppRunStateChange.START:
                if (data.bRunning) callback();
                break;
            case AppRunStateChange.END:
                if (!data.bRunning) callback();
                break;
            case AppRunStateChange.BOTH:
                callback();
        }
    });
}

export function configureShortcut(id: number, launchOptions: LaunchOptions) {
    const logger = new Logger("configureShortcut");

    if (launchOptions) {
        logger.debug("launchOptions: ", launchOptions);
        SteamClient.Apps.SetAppLaunchOptions(id, launchOptions.Options);
        SteamClient.Apps.SetShortcutExe(id, launchOptions.Exe);
        SteamClient.Apps.SetShortcutStartDir(id, launchOptions.WorkingDir);

        if (launchOptions.Compatibility) {
            SteamClient.Apps.SpecifyCompatTool(id, launchOptions.CompatToolName ?? '');
        }
    }
}