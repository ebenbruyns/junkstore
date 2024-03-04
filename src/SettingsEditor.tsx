import {
    Focusable,
    PanelSection, Dropdown, ModalRootProps,
    ScrollPanelGroup
} from "decky-frontend-lib";
import { VFC, useEffect, useState, useRef } from "react";
import { ValueType, Section, ConfData, KeyValuePair, ActionSet, ContentError, ExecuteGetActionSetArgs } from "./Types/Types";
import { SectionEditor } from "./Components/SectionEditor";
import Logger from "./Utils/logger";
import { EditorProperties } from "./Types/EditorProperties";
import { executeAction } from "./Utils/executeAction";

export interface ErrorModalProps extends ModalRootProps {
    Error: ContentError;

}

// Not used yet, but there are future plans for this.
export const SettingsEditor: VFC<EditorProperties> = ({
    serverAPI, initActionSet, initAction, contentId
}) => {
    const logger = new Logger("SettingsEditor")
    logger.log(`initActionSet: ${initActionSet}, initAction: ${initAction}, contentId: ${contentId}`)
    const [confData, setConfData] = useState({} as ConfData);
    // @ts-ignore
    const focusRef = useRef(null);
    const [modeLevel, setModeLevel] = useState(0 as number);
    const [actionSetName, setActionSetName] = useState("" as string);
    // @ts-ignore
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
    // @ts-ignore
    const [sectionHelpText, setSectionHelpText] = useState("" as string);
    useEffect(() => {
        OnInit();

    }, []);
    const OnInit = async () => {
        const result = await executeAction<ExecuteGetActionSetArgs, ActionSet>(
            serverAPI,
            initActionSet,
            initAction,
            {
                content_id: contentId
            }
        )
        logger.log("OnInit result: ", result)
        if (!result) {
            return;
        }
        
        const setName = result.Content.SetName;
        logger.log("SetName: ", setName)
        setActionSetName(setName);
        const data = await executeAction<ExecuteGetActionSetArgs, ConfData>(
            serverAPI,
            setName,
            "GetContent",
            {
                content_id: contentId
            }
        )
        if (!data) {
            return;
        }

        const res = data.Content 
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
            <ScrollPanelGroup 
                //@ts-ignore
                focusable={false}
            >
                <Focusable style={{ background: "inherit" }}>
                    <Focusable //style={{ display: "flex", marginTop: "0px" }}
                    >
                        <Focusable
                            // style={{
                            //     flex: "1",
                            // }}
                            onSecondaryActionDescription="Save Settings"
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

                            }}
                        // onCancel={(_) => {

                        //     //Router.Navigate("/game/" + tabindex + "/" + shortname)
                        // }}
                        // onCancelActionDescription="Go back to Game Details"
                        >
                            <PanelSection title={"Configuration: "}>
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
                                    selectedOption={modeLevel} />
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

                        </Focusable>

                    </Focusable>
                </Focusable>
            </ScrollPanelGroup>

        </>
    );
};
