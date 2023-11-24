import { DialogBody, DialogButton, DialogControlsSection, ServerAPI, TextField, ToggleField } from "decky-frontend-lib";
import { VFC, useState } from "react";


export const DownloadCustomBackend: VFC<{ serverAPI: ServerAPI; }> = ({ serverAPI }) => {
    const [url, setUrl] = useState("http://192.168.8.100:9000/Junk-Scripts.zip");
    const [backup, setBackup] = useState("false");
    const download = async () => {
        console.log("Download: ", url);
        await serverAPI.callPluginMethod("download_custom_backend", {
            url: url,
            backup: backup
        });

    };

    return (
        <DialogBody style={{ marginTop: "40px" }}>
            <DialogControlsSection style={{ height: "calc(100%)" }}>
                <div>Junk Store is a flexible and extensible frontend. You can use a custom backend to provide the content for the store.
                    This does come with security concerns so beware of what you download. You can create your own custom backends too by following
                    the instructions <a href="https://github.com/ebenbruyns/junkstore/wiki/Custom-Backends">here</a>.</div>
                <br />

                <TextField placeholder="Enter URL" value={url} onChange={(e) => setUrl(e.target.value)} />
                <ToggleField label="Backup" checked={backup === "true"}
                    onChange={(newValue) => setBackup(newValue.toString())} />
                <DialogButton onClick={download}>Download</DialogButton>
            </DialogControlsSection>
        </DialogBody>
    );
};
