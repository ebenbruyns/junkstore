import { Dropdown, Focusable, ServerAPI } from "decky-frontend-lib";
import { VFC, useEffect, useState } from "react";
import Logger from "./Utils/logger";
import { LogFile } from "./Types/Types";
import { ScrollableWindowRelative } from './ScrollableWindow';


export const LogViewer: VFC<{ serverAPI: ServerAPI; }> = ({ serverAPI }) => {
    const [logs, setLogs] = useState<LogFile[]>([] as LogFile[]);
    const [logContent, setLogContent] = useState("");
    const logger = new Logger("LogViewer");
    const fetchLogs = async () => {
        try {
            const response = await serverAPI.callPluginMethod<object, LogFile[]>("get_logs", {});
            logger.log(response);
            if (response.result instanceof Array) {
                setLogs(response.result);
                if (response.result.length > 0) {
                    setLogContent(response.result[0].Content);
                }
            }
        } catch (e) {
            logger.error(e);
        }
    };
    useEffect(() => {

        fetchLogs();
    }, []);



    return (
        <Focusable
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                height: '100%',
                padding: '0 15px'
            }}
        >
            {logs.length > 0 && (
                <>
                    <Dropdown rgOptions={logs.map((log) => {
                        return { data: log.FileName, label: log.FileName };
                    })}
                        selectedOption={logs[0].FileName}
                        onChange={(e: any) => {
                            const temp = logs.find((log) => log.FileName == e.data);
                            setLogContent(temp?.Content || "");

                        }} />
                    <ScrollableWindowRelative >
                        <div style={{ padding: '5px 0', whiteSpace: 'pre-wrap' }}>
                            {logContent}
                        </div>
                    </ScrollableWindowRelative>
                </>
            )}
        </Focusable>
    );
};
