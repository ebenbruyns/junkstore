import { DialogButton, DialogLabel, Navigation, ServerAPI } from "decky-frontend-lib";
import { ReactElement, VFC, useEffect, useState } from "react";
import {
    ActionSet, ContentError, ContentResult, ContentType,
    ExecuteArgs, ExecuteLoginArgs, GetSettingArgs, LaunchOptions, LoginStatus,
    SaveSettingsArgs, SettingsData
} from "../Types/Types";
import Logger from "../Utils/logger";
import { executeAction } from "../Utils/executeAction";
import { ErrorDisplay } from "./ErrorDisplay";
import { gameIDFromAppID } from "../Utils/utils";


export const LoginContent: VFC<{ serverAPI: ServerAPI; initActionSet: string; initAction: string; }> = ({ serverAPI, initActionSet, initAction }) => {
    const logger = new Logger("LoginContent");
    const [content, setContent] = useState<ContentResult<ContentType>>({ Type: "Empty", Content: {} });
    const [actionSetName, setActionSetName] = useState<string>("");
    const [LoggedIn, setLoggedIn] = useState<string>("false");
    const [SteamClientId, setSteamClientId] = useState<string>("");
    const originRoute = location.pathname.replace('/routes', '');
    useEffect(() => {
        if (actionSetName !== "") {
            updateLoginStatus();
        }
    }, [LoggedIn, actionSetName]);
    const updateLoginStatus = async () => {
        logger.debug("Updating login status with actionSetName: ", actionSetName);
        const result = await executeAction<ExecuteArgs, ContentType>(serverAPI, actionSetName,
            "GetContent",
            {
                inputData: ""
            });
        if (result == null) {
            logger.error("Login status is null");
            return;
        }
        setContent(result);
        logger.debug("Login status: ", result);
    };
    const onLoginExit = (id) => {
        Navigation.CloseSideMenus();
        Navigation.Navigate(originRoute);
        setTimeout(() => {
            SteamClient.Apps.RemoveShortcut(id);
        }, 1000);
    };
    const createShortcut = async (launchOptions: LaunchOptions) => {
        logger.debug("Creating shortcut for login: ", launchOptions);
        const id = await SteamClient.Apps.AddShortcut("Login", launchOptions.Exe, "", "");
        logger.debug("Shortcut created for login: ", id);
        SteamClient.Apps.SetShortcutLaunchOptions(id, launchOptions.Options);
        SteamClient.Apps.SetShortcutName(id, launchOptions.Name);
        logger.debug("Saving shortcut for login: ", id);
        await executeAction<SaveSettingsArgs, ContentType>(serverAPI, actionSetName,
            "SaveSetting",
            {
                name: "LoginSteamClientId",
                value: id.toString()
            });
        logger.debug("Shortcut created for login: ", id);
        setSteamClientId(id.toString());
        return id;
    };
    const getSteamClientId = async (launchOptions: LaunchOptions) => {
        if (SteamClientId === "") {
            logger.debug("No Shortcut found, creating one...");
            return await createShortcut(launchOptions);
        }
        else {
            const id = parseInt(SteamClientId);
            logger.debug("Shortcut configured: ", id);
            const app = appStore.allApps.find(a =>  a.appid == id);
            if (app) {
                logger.debug("Shortcut found: ", id);
                return id;
            }
            else {
                logger.debug("Shortcut not found, creating one...");
                return await createShortcut(launchOptions);
            }

        }
    };
    const login = async () => {
        try {
            const launchOptionsResult = await executeAction<ExecuteArgs, LaunchOptions>(serverAPI, actionSetName,
                "LoginLaunchOptions", {});
            logger.debug("launchOptionsResult: ", launchOptionsResult);
            if (launchOptionsResult == null) {
                logger.error("launchOptionsResult is null");
                return;
            }
            const launchOptions = launchOptionsResult?.Content;
            if (launchOptions == null) {
                logger.error("LaunchOptions is null");
                return;
            }
            
            
            const id = await getSteamClientId(launchOptions);
            const gameId = gameIDFromAppID(id);

            await executeAction<ExecuteLoginArgs, ContentType>(serverAPI, actionSetName,
                "Login",
                {
                    appId: String(id),
                    gameId: String(gameId)
                },
                () => onLoginExit(id)
            );

            setContent(launchOptionsResult);            
            setLoggedIn("true");

        } catch (error) {
            logger.error("Login: ", error);
        }
    };
    
    const logout = async () => {
        try {
            setContent({ Type: "Empty", Content: {} });
            const data = await executeAction<ExecuteArgs, LoginStatus>(serverAPI, actionSetName,
                "Logout",
                {
                    inputData: ""
                });
            
            if (data == null) {
                logger.error("login status is null");
                return;
            }
            setLoggedIn("false");
            setContent(data);
        } catch (error) {
            logger.error("Logout: ", error);
        }
    };
    const onInit = async () => {
        try {
            logger.debug(`Initializing LoginContent with initActionSet: ${initActionSet} and initAction: ${initAction}`);
            const data = await executeAction<ExecuteArgs, ActionSet>(serverAPI, initActionSet,
                initAction,
                {
                    inputData: ""
                });
            logger.debug("init result: ", data);
            const result = data?.Content as ActionSet;
            
            const tmp = await executeAction<GetSettingArgs, SettingsData>(serverAPI, result.SetName,
                "GetSetting",
                {
                    name: "LoginSteamClientId",
                    inputData: ""
                });
            const settings = tmp?.Content as SettingsData;
            if (settings.value !== "") {
              setSteamClientId(settings.value);
            }
            setActionSetName(result.SetName);
            setLoggedIn("unknown");

        } catch (error) {
            logger.error("OnInit: ", error);
        }
    };
    useEffect(() => {
        onInit();
    }, []);

    const labelStyle = { flex: 'auto', margin: '0', display: 'flex', alignItems: 'center' };
    let innerElement: ReactElement = <></>;

    switch (content.Type) {
        case 'LoginStatus':
            const isLoggedIn = (content.Content as LoginStatus).LoggedIn;
            innerElement = (
                <>
                    <DialogLabel style={labelStyle}>Logged in as {(content.Content as LoginStatus).Username}</DialogLabel>
                    <DialogButton onClick={isLoggedIn ? logout : login} style={{ width: "100px", verticalAlign: "middle" }}>{isLoggedIn ? 'Logout' : 'Login'}</DialogButton>
                </>
            );
            break;
        case 'Empty':
            innerElement = <DialogLabel style={labelStyle}>Checking status...</DialogLabel>;
            break;
        case 'Error':
            innerElement = <ErrorDisplay error={content.Content as ContentError} />;
    }

    return (
        <div style={{ display: "flex", height: '40px' }}>
            {innerElement}
        </div>
    );
};
