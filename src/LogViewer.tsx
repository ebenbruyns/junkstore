import { Dropdown, Focusable, ServerAPI } from "decky-frontend-lib";
import { VFC, useEffect, useRef, useState } from "react";
import Logger from "./Utils/logger";
import { LogFile } from "./Types/Types";
import { ScrollableWindowRelative } from './ScrollableWindow';


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
