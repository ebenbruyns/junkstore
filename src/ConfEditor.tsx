import {
    Focusable,
    PanelSection, Dropdown, ModalRoot, ModalRootProps,
    quickAccessControlsClasses,
    gamepadDialogClasses
} from "decky-frontend-lib";
import { VFC, useEffect, useState, useRef } from "react";
import { ValueType, Section, ConfData, KeyValuePair, ActionSet, ContentError, SaveRefresh, ExecuteGetActionSetArgs } from "./Types/Types";
import { SectionEditor, sectionEditorFieldRoot } from "./Components/SectionEditor";
import Logger from "./Utils/logger";
import { EditorProperties } from "./Types/EditorProperties";
import { executeAction } from "./Utils/executeAction";
import { sectionEditorFieldContainerNumber, sectionEditorFieldFlexShrink } from './Components/FieldEditor';

const confEditorRootClass = 'conf-editor-modal-root';

export interface ErrorModalProps extends ModalRootProps {
    Error: ContentError;

}

export const ConfEditor: VFC<EditorProperties> = ({
    serverAPI, initActionSet, initAction, contentId, closeModal, refreshParent
}) => {
    const logger = new Logger("ConfEditor");
    logger.log(`initActionSet: ${initActionSet}, initAction: ${initAction}, contentId: ${contentId}`);
    const [confData, setConfData] = useState<ConfData>();
    const focusRef = useRef<HTMLTextAreaElement>(null);
    const [modeLevel, setModeLevel] = useState<number>(0);
    const [actionSetName, setActionSetName] = useState<string>("");
    const [helpText, setHelpText] = useState<KeyValuePair>({
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
    });
    const [sectionHelpText, setSectionHelpText] = useState<string>();
    useEffect(() => {
        OnInit();

    }, []);
    const OnInit = async () => {
        const actionSetResult = await executeAction<ExecuteGetActionSetArgs, ActionSet>(
            serverAPI,
            initActionSet,
            initAction,
            {
                content_id: contentId
            }
        );

        logger.log("OnInit result: ", actionSetResult);
        if (!actionSetResult) {
            closeModal();
            return;
        }

        const setName = actionSetResult.Content.SetName;
        logger.log("SetName: ", setName);

        const configDataResult = await executeAction<ExecuteGetActionSetArgs, ConfData>( //supposedly here we know that this action will return this type of Content
            serverAPI,
            setName,
            "GetContent",
            {
                content_id: contentId
            }
        );

        if (!configDataResult) {
            closeModal();
            return;
        }

        setActionSetName(setName);
        setConfData(configDataResult.Content);

    };
    const handleSectionChange = (section: Section) => {
        if (!confData) {
            return;
        }
        const updatedSections = confData.Sections.map((s) => s.Name === section.Name ? section : s); //as per type def Sections should always be defined

        setConfData({ ...confData, Sections: updatedSections });
    };
    const updateHelpText = (field: KeyValuePair) => {
        setHelpText(field);
    };
    return (
        <>
            {confEditorStyle}
            <ModalRoot className={confEditorRootClass} closeModal={closeModal}>
                <Focusable
                    style={{ display: "flex", minHeight: '400px' }}
                    onCancel={() => closeModal()}
                    onCancelActionDescription="Go back to Game Details"
                >
                    <Focusable
                        style={{
                            flex: "5",
                            paddingTop: '20px'
                        }}
                        onSecondaryActionDescription="Save config"
                        onSecondaryButton={async () => {
                            logger.log("Saving config: ", confData);
                            const result = await executeAction(serverAPI,
                                actionSetName,
                                "SaveContent",
                                {
                                    content_id: contentId,
                                    inputData: confData
                                });

                            logger.log("Save result: ", result);
                            // if (!result) {
                            //     closeModal();
                            //     return;
                            // }
                            //Router.Navigate("/game/" + tabindex + "/" + shortname)
                            closeModal();
                        }}
                    >
                        <PanelSection title="Configuration: ">
                            <div style={{ marginBottom: '10px' }}>
                                <Dropdown
                                    rgOptions={[
                                        { data: 0, label: "Basic" },
                                        { data: 1, label: "Advanced" },
                                        { data: 2, label: "Expert" },
                                        { data: 3, label: "All" },
                                    ]}
                                    onChange={(e) => setModeLevel(e.data)}
                                    selectedOption={modeLevel}
                                />
                            </div>
                            {confData?.Sections?.map((section) => {
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
                        {confData?.AutoexecEnabled && confData?.Autoexec && (
                            <PanelSection title="[Autoexec]">
                                <Focusable
                                    noFocusRing={true}
                                    onFocusCapture={() => (focusRef && focusRef.current != null) && focusRef.current.focus()}
                                    onActivate={() => { }}
                                    onSecondaryActionDescription="Save config"
                                    onSecondaryButton={async () => {
                                        logger.log("Saving config: ", confData);
                                        const result = await executeAction<ExecuteGetActionSetArgs, SaveRefresh /*| SomeOtherContentPossibility */>( //pass multiple possible Content types with a union
                                            serverAPI,
                                            actionSetName,
                                            "SaveContent",
                                            {
                                                content_id: contentId,
                                                inputData: confData
                                            });
                                        logger.log("Save result: ", result);
                                        if (!result) {
                                            closeModal();
                                            return;
                                        }
                                        if (result.Type === "Refresh") {
                                            const tmp = result.Content; //if some other possibilties then you can cast here
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
                                    <textarea
                                        className=""
                                        ref={focusRef}
                                        style={{ width: "100%", height: "200px" }}
                                        value={confData.Autoexec}
                                        onChange={(e) => setConfData({ ...confData, Autoexec: e.target.value })}
                                    />
                                </Focusable>
                            </PanelSection>
                        )}
                    </Focusable>
                    <div
                        style={{
                            flex: '4',
                            background: '#02000b8a',
                            borderRadius: 'var(--round-radius-size)'
                        }}
                    >
                        <Focusable
                            onActivate={() => { }}
                            style={{
                                minHeight: 0,
                                position: "sticky",
                                height: "fit-content",
                                top: "40px",
                                margin: '0 20px'
                            }}
                            noFocusRing={false}
                        >
                            <h4 style={{ margin: 0, marginBottom: '5px', textTransform: 'uppercase' }}>{sectionHelpText}</h4>
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

const confEditorStyle = <style>
    {`
    .${confEditorRootClass} {
        padding: 0 !important;
        width: 100% !important;
    }
    .${confEditorRootClass} .${quickAccessControlsClasses.PanelSection} {
        padding: 0 2.8vw;
    }
    .${confEditorRootClass} .${sectionEditorFieldRoot} .${gamepadDialogClasses.Field} {
        margin: 0;
    }
    .${confEditorRootClass} .${sectionEditorFieldRoot} .${gamepadDialogClasses.FieldLabelRow} {
        height: 40px;
    }
    .${confEditorRootClass} .${sectionEditorFieldFlexShrink} .${gamepadDialogClasses.FieldLabel} {
        flex: 0 1 auto;
    }
    .${confEditorRootClass} .${sectionEditorFieldFlexShrink} .${gamepadDialogClasses.FieldChildrenWithIcon} {
        flex: auto;
    }
    .${confEditorRootClass} .${sectionEditorFieldFlexShrink} .${gamepadDialogClasses.DropDownControlButtonContents}>:first-child {
        overflow: hidden;
    }
    .${confEditorRootClass} .${sectionEditorFieldFlexShrink} .${gamepadDialogClasses.FieldChildrenInner}>:first-child {
        max-width: 140px;
        min-width: 80px;
        margin-left: auto;
    }
    .${confEditorRootClass} .${gamepadDialogClasses.DropDownControlButtonContents}>svg {
        min-width: 1em;
    }
    .${confEditorRootClass} .${sectionEditorFieldContainerNumber} .${gamepadDialogClasses.FieldChildrenInner} {
        width: 80px;
    }
    `}
</style>;