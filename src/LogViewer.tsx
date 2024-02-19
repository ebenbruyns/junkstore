import { Dropdown, Field, Focusable, ModalPosition, Panel, PanelSection, ScrollPanelGroup, ServerAPI } from "decky-frontend-lib";
import { VFC, useEffect, useRef, useState } from "react";
import Logger from "./Utils/logger";
import { LogFile } from "./Types/Types";


export const LogViewer: VFC<{ serverAPI: ServerAPI; }> = ({ serverAPI }) => {
    const [logs, setLogs] = useState([] as LogFile[]);
    const [selectedLog, setSelectedLog] = useState("");
    const [logContent, setLogContent] = useState("");
    const logger = new Logger("LogViewer");
    const focusRef = useRef(null);
    const fetchLogs = async () => {
        try {
            const response = await serverAPI.callPluginMethod("get_logs", {});
            logger.log(response);
            setLogs(response.result as LogFile[]);
        } catch (e) {
            logger.error(e);
        }
    };
    useEffect(() => {

        fetchLogs();
    }, []);

    const handleLogSelect = async (logFileName: string) => {
        try {
            const response = await serverAPI.callPluginMethod("get_log_content", { fileName: logFileName });
            setLogContent(response.result as string);
        } catch (e) {
            logger.error(e);
        }
    };

    return (
        <ModalPosition>
            <ScrollPanelGroup
                // @ts-ignore
                focusable={false} style={{ margin: "0px" }}>
                <Focusable


                >

                    {logs.length > 0 && (
                        <Focusable

                            noFocusRing={false}
                            style={{
                                marginTop: "40px",
                                height: "calc( 100% - 40px )",

                                justifyContent: "center",
                                margin: "40px",
                            }}
                        >
                            <Focusable style={{ marginBottom: "1em" }}>
                                <Dropdown rgOptions={logs.map((log) => {
                                    return { data: log.FileName, label: log.FileName };
                                })}
                                    selectedOption={logs[0].FileName}
                                    onChange={(e: any) => {
                                        const temp = logs.find((log) => log.FileName == e.data);
                                        setLogContent(temp?.Content || "");

                                    }} />
                            </Focusable>
                            <Focusable
                                // @ts-ignore
                                focusableIfNoChildren={true}
                                noFocusRing={true}
                                onFocusCapture={() => {
                                    if (focusRef && focusRef.current != null)
                                        // @ts-ignore
                                        focusRef.current.focus();
                                }}>
                                <textarea
                                    ref={focusRef}
                                    style={{ width: "calc( 100% - 10px )", height: "200px " }}
                                    value={logContent}
                                    readOnly={true}

                                />
                            </Focusable>
                        </Focusable>
                    )}

                </Focusable>


            </ScrollPanelGroup>
        </ModalPosition>
    );
};
