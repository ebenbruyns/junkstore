import {
    Focusable,
    PanelSection, Dropdown, ModalRoot, ModalRootProps, 
    quickAccessControlsClasses
} from "decky-frontend-lib";
import { VFC, useEffect, useState, useRef } from "react";
import { ValueType, Section, ConfData, KeyValuePair, ActionSet, ContentError } from "./Types/Types";
import { SectionEditor, sectionEditorFieldContainer } from "./Components/SectionEditor";
// import { Panel, ScrollPanelGroup } from "./Components/Scrollable";
import Logger from "./Utils/logger";
import { EditorProperties } from "./Types/EditorProperties";
import { executeAction } from "./Utils/executeAction";

const confEditorRootClass = 'conf-editor-modal-root';

export interface ErrorModalProps extends ModalRootProps {
    Error: ContentError;

}

export const ConfEditor: VFC<EditorProperties> = ({
    serverAPI, initActionSet, initAction, contentId, closeModal, refreshParent
}) => {
    const logger = new Logger("ConfEditor")
    logger.log(`initActionSet: ${initActionSet}, initAction: ${initAction}, contentId: ${contentId}`)
    const [confData, setConfData] = useState({} as ConfData);
    const focusRef = useRef(null);
    const [modeLevel, setModeLevel] = useState(0 as number);
    const [actionSetName, setActionSetName] = useState("" as string);
    const [helpText, setHelpText] = useState({
        Key: "",
        Description: "",
        DefaultValue: "",
        Value: "",
        Type: ValueType.String,
        Min: 0,
        ModeLevel: 0,
        Max: 100,
        Parents: [],
        EnumValues: [],
    } as KeyValuePair);
    const [sectionHelpText, setSectionHelpText] = useState("" as string);
    useEffect(() => {
        OnInit();

    }, []);
    const OnInit = async () => {
        const result = await executeAction(
            serverAPI,
            initActionSet,
            initAction,
            {
                content_id: contentId
            }
        )
        logger.log("OnInit result: ", result)

        const setName = (result.Content as ActionSet).SetName;
        logger.log("SetName: ", setName)
        setActionSetName(setName);
        const data = await executeAction(
            serverAPI,
            setName,
            "GetContent",
            {
                content_id: contentId
            }
        )

        const res = data.Content as ConfData
        setConfData(res);

    }
    const handleSectionChange = (section: Section) => {
        const updatedSections = confData.Sections.map((s) => s.Name === section.Name ? section : s
        );
        setConfData({ ...confData, Sections: updatedSections });
    };
    const updateHelpText = (field: KeyValuePair) => {
        setHelpText(field);
    };
    return (
        <>
            <style>
                {`
            .${confEditorRootClass} {
                padding: 0 !important;
                width: 100% !important;
            }
            .${confEditorRootClass} .${quickAccessControlsClasses.PanelSection} {
                padding: 0 2.8vw;
            }
            .${confEditorRootClass} .${sectionEditorFieldContainer} .gamepaddialog_Field_S-_La {
                margin: 0;
            }
        `} </style>
            <ModalRoot className={confEditorRootClass} closeModal={closeModal}>
                <Focusable
                    style={{ display: "flex", minHeight: '400px' }}
                    onCancel={(_) => {
                        closeModal();
                        //Router.Navigate("/game/" + tabindex + "/" + shortname)
                    }}
                    onCancelActionDescription="Go back to Game Details"
                >
                    <Focusable
                        style={{
                            flex: "5",
                            paddingTop: '20px'
                        }}
                        onSecondaryActionDescription="Save config"
                        onSecondaryButton={async (_) => {
                            logger.log("Saving config: ", confData)
                            const result = await executeAction(serverAPI,
                                actionSetName,
                                "SaveContent",
                                {
                                    content_id: contentId,
                                    inputData: confData
                                });
                            logger.log("Save result: ", result)
                            //Router.Navigate("/game/" + tabindex + "/" + shortname)
                            closeModal();
                        }}
                    >
                        <PanelSection title={"Configuration: "}>
                            <div style={{ marginBottom: '10px'}}>
                                <Dropdown
                                    rgOptions={[
                                        { data: 0, label: "Basic" },
                                        { data: 1, label: "Advanced" },
                                        { data: 2, label: "Expert" },
                                        { data: 3, label: "All" },
                                    ]}
                                    onChange={(e) => {
                                        setModeLevel(e.data);
                                    }}
                                    selectedOption={modeLevel}
                                />
                            </div>
                            {confData.Sections?.map((section) => {
                                if (section && modeLevel >= section.ModeLevel)
                                    return (
                                        <SectionEditor
                                            key={section.Name}
                                            section={section}
                                            modeLevel={modeLevel}
                                            onChange={(updatedSection) => handleSectionChange(updatedSection)}
                                            updateHelpText={(field: KeyValuePair) => {
                                                updateHelpText(field);
                                                setSectionHelpText(section.Description);

                                            }} />
                                    );
                                else
                                    return null;
                            })}
                        </PanelSection>
                        {confData.AutoexecEnabled && confData.Autoexec && (
                            <PanelSection title="[Autoexec]">
                                <Focusable
                                    // @ts-ignore
                                    focusableIfNoChildren={true}
                                    noFocusRing={true}
                                    onFocusCapture={() => {
                                        if (focusRef && focusRef.current != null)
                                            // @ts-ignore
                                            focusRef.current.focus();
                                    }}
                                    onOKButton={() => { }}
                                    onSecondaryActionDescription="Save config"
                                    onSecondaryButton={async (_) => {
                                        logger.log("Saving config: ", confData)
                                        const result = await executeAction(serverAPI,
                                            actionSetName,
                                            "SaveContent",
                                            {
                                                content_id: contentId,
                                                inputData: confData
                                            });
                                        logger.log("Save result: ", result)
                                        if (result.Type === "Refresh") {
                                            const tmp = result.Content as SaveRefresh
                                            if (tmp.Refresh) {
                                                refreshParent()
                                            }
                                        }
                                        //Router.Navigate("/game/" + tabindex + "/" + shortname)
                                        closeModal();
                                    }}
                                    onCancel={(_) => {
                                        closeModal();
                                        //Router.Navigate("/game/" + tabindex + "/" + shortname)
                                    }}
                                    onCancelActionDescription="Go back to Game Details"
                                >

                                    <textarea
                                        className=""
                                        ref={focusRef}
                                        style={{ width: "100%", height: "200px" }}
                                        value={confData.Autoexec}
                                        onChange={(e) => {
                                            setConfData({ ...confData, Autoexec: e.target.value });
                                        }} />
                                </Focusable>
                            </PanelSection>
                        )}
                    </Focusable>
                    <div
                        style={{
                            flex: '4',
                            background: '#02000b8a'
                        }}
                    >
                        <Focusable
                            onActivate={() => {
                                // WIP
                                // showModal(
                                //   <DetailsModal
                                //     sectionHelpText={sectionHelpText}
                                //     helpText={helpText}
                                //   />
                                // );
                            }}
                            style={{
                                minHeight: 0,
                                position: "sticky",
                                height: "fit-content",
                                top: "40px",
                                margin: '0 20px'
                            }}
                            // @ts-ignore
                            focusable={true}
                            noFocusRing={false}
                        >
                            <h3 style={{ margin: 0, marginBottom: '5px' }}>{sectionHelpText}</h3>
                            <div>{helpText.Description}</div>
                            {helpText.EnumValues &&
                                helpText.EnumValues.map((enumValue) => (
                                    <div>
                                        {enumValue.Key} {enumValue.Description}
                                    </div>
                                ))}
                        </Focusable>
                    </div>
                </Focusable>
            </ModalRoot>
        </>
    );
};
