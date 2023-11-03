import {
    Focusable,
    PanelSection, ServerAPI, Dropdown, ModalRoot
} from "decky-frontend-lib";
import { VFC, useEffect, useState, useRef } from "react";
import { BatData } from "./Types";
import { Panel, ScrollPanelGroup } from "./Scrollable";


export const BatEditor: VFC<{ serverAPI: ServerAPI; tabindex: number; shortname: string; closeModal?: any; }> = ({
    serverAPI, tabindex, shortname, closeModal
}) => {
    const [batData, setBatData] = useState([{ id: 0, gameId: 0, Path: '', Content: '' }] as BatData[]);
    //const [editorText, setEditorText] = useState("test" as string);
    const [selectedBat, setSelectedBat] = useState({ id: 0, gameId: 0, Content: "", Path: "" } as BatData);
    const focusRef = useRef(null);
    useEffect(() => {
        serverAPI
            .callPluginMethod<{}, {}>("get_game_bats", {
                tabindex: tabindex,
                shortname: shortname,
            })
            .then((data) => {
                setBatData(data.result as BatData[]);
                setSelectedBat(data.result[0] as BatData);
                //setEditorText(data.result[0].Content as string);
            });
    }, []);
    return (
        <>
            <style>
                {`
        .GenericConfirmDialog {
            width: 100% !important,
            height: 100% !important,
        }
    `} </style>
            <ModalRoot bAllowFullSize={true} bAllowFullSizeMobile={true}>
                <ScrollPanelGroup focusable={false} style={{ margin: "0px" }}>
                    <Panel style={{ background: "inherit" }}>

                        <Focusable

                            onSecondaryActionDescription="Save bat files"
                            onSecondaryButton={async (_) => {
                                await serverAPI.callPluginMethod("save_game_bats", {
                                    tabindex: tabindex,
                                    shortname: shortname,
                                    bats: batData,
                                });
                                //Router.Navigate("/game/" + tabindex + "/" + shortname)
                                closeModal();
                            }}
                            onCancel={(_) => {
                                closeModal();
                                //Router.Navigate("/game/" + tabindex + "/" + shortname)
                            }}
                            onCancelActionDescription="Go back to Game Details"
                        >
                            <PanelSection title={"Configuration: " + shortname}>
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
                                            return { data: bat.id, label: bat.Path };
                                        })}
                                            selectedOption={batData[0].id}
                                            onChange={(e: any) => {
                                                const temp = batData.find((bat) => bat.id == e.data);
                                                setSelectedBat(temp as BatData);

                                            }} />
                                    </Focusable>
                                    <Focusable focusableIfNoChildren={true}
                                        noFocusRing={true}
                                        onFocusCapture={(e) => {
                                            if (focusRef && focusRef.current != null)
                                                focusRef.current.focus();
                                        }}>
                                        <textarea
                                            ref={focusRef}
                                            style={{ width: "calc( 100% - 10px )", height: "200px " }}
                                            value={selectedBat.Content}
                                            onChange={(e) => {
                                                const newContent = e.target.value;
                                                setSelectedBat(prevSelectedBat => ({ ...prevSelectedBat, Content: newContent }));

                                                setBatData(prevBatData => {
                                                    const newData = [...prevBatData];
                                                    const batIndex = newData.findIndex(bat => bat.id === selectedBat.id);
                                                    if (batIndex !== -1) {
                                                        newData[batIndex] = { ...newData[batIndex], Content: newContent };
                                                    }
                                                    return newData;
                                                });
                                            }} />
                                    </Focusable>
                                </Focusable>
                            </PanelSection>
                        </Focusable>

                    </Panel>
                </ScrollPanelGroup>
            </ModalRoot>
        </>
    );
};
