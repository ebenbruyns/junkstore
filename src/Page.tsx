import { ServerAPI, useParams } from "decky-frontend-lib";
import { VFC, useEffect, useState } from "react";
import { ActionSet, ContentError, ContentResult, StoreTabsContent } from "./Types";
import { ErrorDisplay } from "./ErrorDisplay";
import { StoreTabs } from "./StoreTabs";

export const Page: VFC<{ serverAPI: ServerAPI; }> = ({ serverAPI }) => {
    const { initActionSet, initAction } = useParams<{ initActionSet: string; initAction: string; }>();
    console.log(`Action Set: ${initActionSet}, Init Action: ${initAction}`);
    const [content, setContent] = useState({
        Type: "Error",
        Content: {
            Title: "Error",
            Message: "Error",
            Data: "",
        }
    } as ContentResult);
    const [setName, setSetName] = useState("");
    useEffect(() => {
        onInit();
    }, []);
    const onInit = async () => {
        try {
            console.log("init");
            const data = await serverAPI.callPluginMethod<{}, ActionSet>("execute_action", {
                actionSet: initActionSet,
                actionName: initAction,
                inputData: "",
            });
            console.log(data);
            const result = data.result as ActionSet;
            const tmp = result.SetName;
            setSetName(tmp);
            const content = await serverAPI.callPluginMethod<{}, ContentResult>("execute_action", {
                actionSet: result.SetName,
                actionName: "GetContent",
                inputData: ""
            });
            setContent(content.result as ContentResult);
            console.log(content);
        } catch (error) {
            console.error("Page.tsx", error);
        }
    };


    return (
        <>
            {content.Type === "StoreTabs" && <StoreTabs serverAPI={serverAPI} tabs={content.Content as StoreTabsContent} initAction={initAction} initActionSet={initActionSet} />}
            {content.Type === "Error" && <ErrorDisplay error={content.Content as ContentError} />}
        </>
    );
};
