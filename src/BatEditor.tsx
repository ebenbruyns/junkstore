import {
    Focusable,
    PanelSection, Dropdown, ModalRoot, ScrollPanelGroup
} from "decky-frontend-lib";
import { VFC, useEffect, useState, useRef } from "react";
import { ActionSet, ExecuteGetActionSetArgs, FileData, FilesData, SaveRefresh } from "./Types/Types";
// import { Panel, ScrollPanelGroup } from "./Components/Scrollable";
import { EditorProperties } from "./Types/EditorProperties";
import { executeAction } from "./Utils/executeAction";

const batEditorRootClass = 'bat-editor-modal-root';

export const BatEditor: VFC<EditorProperties> = ({
    serverAPI,
    initActionSet,
    initAction,
    contentId,
    closeModal,
    refreshParent
}) => {
    const [batData, setBatData] = useState([{ Id: 0, GameId: 0, Path: '', Content: '' }] as FileData[]);
    //const [editorText, setEditorText] = useState("test" as string);
    const [selectedBat, setSelectedBat] = useState({ Id: 0, GameId: 0, Content: "", Path: "" } as FileData);
    const focusRef = useRef<HTMLTextAreaElement>(null);
    const [actionSetName, setActionSetName] = useState("" as string);
    const OnInit = async () => {
        const actionSetResult = await executeAction<ExecuteGetActionSetArgs, ActionSet>(serverAPI, initActionSet, initAction, { content_id: contentId });
        if (actionSetResult === null) {
            return;
        }
        const setName = actionSetResult.Content.SetName;
        
        const fileDataResult = await executeAction<ExecuteGetActionSetArgs, FilesData>(serverAPI, setName, "GetContent", { content_id: contentId });
        if (fileDataResult === null) {
            return;
        }
        const res = fileDataResult.Content.Files;
       
        if (res.length > 0) {
            setSelectedBat(res[0] as FileData);
        }
        setBatData(res);
        setActionSetName(setName);
    };

    useEffect(() => {
        OnInit();
    }, []);
    return (
        <>
            <style>
                {`
        .${batEditorRootClass}.GenericConfirmDialog {
            width: 100% !important,
            height: 100% !important,
        }
    `} </style>
            <ModalRoot
                className={batEditorRootClass}
                bAllowFullSize={true}
               
                bAllowFullSizeMobile={true}
                closeModal={closeModal}
            >
                <ScrollPanelGroup
                  
                    focusable={false}
                    style={{ margin: "0px" }}>
                    <Focusable
                        style={{ background: "inherit" }}>

                        <Focusable

                            onSecondaryActionDescription="Save bat files"
                            onSecondaryButton={async () => {
                                const result = await executeAction<ExecuteGetActionSetArgs, SaveRefresh>( //* will SaveContent always return this type? if so remove the check below, if not put all the possibities here
                                    serverAPI,
                                    actionSetName,
                                    "SaveContent",
                                    {
                                        content_id: contentId,
                                        inputData: batData
                                    }
                                );
                                if (result === null) {
                                    return;
                                }
                                if (result.Type === "Refresh") { //remove check if this is the only type
                                    const tmp = result.Content;
                                    if (tmp.Refresh) {
                                        refreshParent();
                                    }
                                }
                                //Router.Navigate("/game/" + tabindex + "/" + shortname)
                                closeModal();
                            }}
                            onCancel={() => closeModal()}
                            onCancelActionDescription="Go back to Game Details"
                        >
                            <PanelSection title={"Configuration: " + contentId}>
                                {batData.length > 0 && (
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
                                            <Dropdown rgOptions={batData.map((bat) => {
                                                return { data: bat.Id, label: bat.Path };
                                            })}
                                                selectedOption={batData[0].Id}
                                                onChange={(e: any) => {
                                                    const temp = batData.find((bat) => bat.Id == e.data);
                                                    setSelectedBat(temp as FileData);

                                                }} />
                                        </Focusable>
                                        <Focusable
                                            focusableIfNoChildren={true}
                                            noFocusRing={true}
                                            onFocusCapture={() => (focusRef && focusRef.current != null) && focusRef.current.focus()
                                            }>
                                            <textarea
                                                ref={focusRef}
                                                style={{ width: "calc( 100% - 10px )", height: "200px " }}
                                                value={selectedBat.Content}
                                                onChange={(e) => {
                                                    const newContent = e.target.value;
                                                    setSelectedBat(prevSelectedBat => ({ ...prevSelectedBat, Content: newContent }));

                                                    setBatData(prevBatData => {
                                                        const newData = [...prevBatData];
                                                        const batIndex = newData.findIndex(bat => bat.Id === selectedBat.Id);
                                                        if (batIndex !== -1) {
                                                            newData[batIndex] = { ...newData[batIndex], Content: newContent };
                                                        }
                                                        return newData;
                                                    });
                                                }} />
                                        </Focusable>
                                    </Focusable>
                                )}
                            </PanelSection>
                        </Focusable>

                    </Focusable>
                </ScrollPanelGroup>
            </ModalRoot>
        </>
    );
};
