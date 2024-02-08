import { DialogButton, DialogLabel, Focusable, ServerAPI } from "decky-frontend-lib";
import { VFC, useEffect, useState } from "react";
import { ActionSet, ContentError, ContentResult, LaunchOptions, LoginStatus, SettingsData } from "../Types/Types";
import Logger from "../Utils/logger";
import { executeAction } from "../Utils/executeAction";
import { ErrorDisplay } from "./ErrorDisplay";
import { gameIDFromAppID } from "../Utils/gameIDFromAppID";


export const LoginContent: VFC<{ serverAPI: ServerAPI; initActionSet: string; initAction: string; }> = ({ serverAPI, initActionSet, initAction }) => {
    const logger = new Logger("LoginContent");
    const [content, setContent] = useState<ContentResult>({ Type: "Empty", Content: {} });
    const [actionSetName, setActionSetName] = useState<string>("");
    const [LoggedIn, setLoggedIn] = useState<string>("false");
    const [SteamClientId, setSteamClientId] = useState<string>("");
    useEffect(() => {
        if (actionSetName !== "")
            updateLoginStatus();
    }
        , [LoggedIn, actionSetName]);
    const updateLoginStatus = async () => {
        logger.debug("Updating login status with actionSetName: ", actionSetName)
        const result = await executeAction(serverAPI, actionSetName,
            "GetContent",
            {
                inputData: ""
            });
        setContent(result);
        logger.debug("Login status: ", result);
    }
    const createShortcut = async (launchOptions: LaunchOptions) => {
        logger.debug("Creating shortcut for login");
        const id = await SteamClient.Apps.AddShortcut("Login", launchOptions.Exe, "", "")
        setSteamClientId(id.toString())
        await SteamClient.Apps.SetShortcutLaunchOptions(id, launchOptions.Options)
        await SteamClient.Apps.SetAppHidden(id, false);
        await SteamClient.Apps.SetShortcutName(id, launchOptions.Name);
        await executeAction(serverAPI, actionSetName,
            "SaveSetting",
            {
                name: "LoginSteamClientId",
                value: id.toString()
            });
        return id;
    }
    const getSteamClientId = async (launchOptions: LaunchOptions) => {
        if (SteamClientId === "") {
            logger.debug("No Shortcut found, creating one...");
            return await createShortcut(launchOptions);
        }
        else {
            const id = parseInt(SteamClientId);
            logger.debug("Shortcut configured: ", id);
            const app = appStore.allApps.find(a => { a.appid == id })
            if (app) {
                logger.debug("Shortcut found: ", id);
                return id;
            }
            else {
                logger.debug("Shortcut not found, creating one...");
                return await createShortcut(launchOptions);
            }

        }
    }
    const login = async () => {
        try {
            const data = await executeAction(serverAPI, actionSetName,
                "LoginLaunchOptions",
                {
                    inputData: ""
                });

            const launchOptions = data.Content as LaunchOptions
            setContent(data as ContentResult);
            const id = await getSteamClientId(launchOptions)
            // else
            //     runLogin(parseInt(SteamClientId));

            // setTimeout(() => {
            //     SteamClient.Apps.RemoveShortcut(id);
            // }, 10000);
            const gameId = gameIDFromAppID(id)

            await executeAction(serverAPI, actionSetName,
                "Login",
                {
                    inputData: "",
                    appId: String(id),
                    gameId: String(gameId)

                });


            setLoggedIn("true");

        } catch (error) {
            logger.error("Login: ", error);
        }
    };
    const runLogin = async (id: number) => {
        setTimeout(() => {

            let gid = gameIDFromAppID(id);
            SteamClient.Apps.RunGame(gid, "", -1, 100);
        }, 500);
    }
    const logout = async () => {
        try {
            const data = await executeAction(serverAPI, actionSetName,
                "Logout",
                {
                    inputData: ""
                });
            setLoggedIn("false")
            setContent(data);
        } catch (error) {
            logger.error("Logout: ", error);
        }
    };
    const onInit = async () => {
        try {
            logger.debug(`Initializing LoginContent with initActionSet: ${initActionSet} and initAction: ${initAction}`);
            const data = await executeAction(serverAPI, initActionSet,
                initAction,
                {
                    inputData: ""
                });
            logger.debug("init result: ", data);
            const result = data.Content as ActionSet;
            setActionSetName(result.SetName);
            const tmp = await executeAction(serverAPI, result.SetName,
                "GetSetting",
                {
                    name: "LoginSteamClientId",
                    inputData: ""
                });
            const settings = tmp.Content as SettingsData;
            if (settings.value !== "")
                setSteamClientId(settings.value);
            setLoggedIn("unknown")

        } catch (error) {
            logger.error("OnInit: ", error);
        }
    };
    useEffect(() => {
        onInit();
    }, []);
    return (
        <Focusable
            style={{
                flex: "1",
                display: "flex",
                gap: "8px",
                alignItems: "flex-end",
                marginLeft: "0em",
                marginRight: "0em",
                marginTop: "0em",
                marginBottom: "1em",
            }}
        >
            {content.Type === "LoginStatus" &&
                (content.Content as LoginStatus).LoggedIn &&
                <>
                    <DialogLabel>Logged in as {(content.Content as LoginStatus).Username}</DialogLabel>
                    <div style={{ flexGrow: 1, flexShrink: 1 }}></div>
                    <DialogButton onClick={logout} style={{
                        width: "100px", height: "40px", verticalAlign: "middle"
                    }}>Logout</DialogButton>
                </>}
            {content.Type === "LoginStatus" && !(content.Content as LoginStatus).LoggedIn &&
                <>
                    <DialogLabel>Not logged in</DialogLabel>
                    <div style={{ flexGrow: 1, flexShrink: 1 }}></div>
                    <DialogButton onClick={login} style={{
                        width: "100px", height: "40px", verticalAlign: "middle"
                    }}>Login</DialogButton>
                </>}
            {content.Type === "Empty" &&
                <div>Checking status...</div>}
            {content.Type === "Error" &&
                <ErrorDisplay error={content.Content as ContentError} />}
        </Focusable>
    );

};
