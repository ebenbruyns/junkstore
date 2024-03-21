import { Section, KeyValuePair } from "../Types/Types";
import { ButtonItem, Focusable, PanelSectionRow } from "decky-frontend-lib";
import { RiArrowDownSFill, RiArrowUpSFill } from "react-icons/ri";
import { FieldEditor } from "./FieldEditor";
import { VFC, useEffect, useState } from "react";

export const sectionEditorFieldRoot = 'section-editor-field-editors';

interface SectionEditorProps {
    section: Section;
    updateHelpText: (helpText: KeyValuePair) => void;
    modeLevel: number;
    onChange: (section: Section) => void;
}

export const SectionEditor: VFC<SectionEditorProps> = ({ section, updateHelpText, modeLevel, onChange }) => {
    // const [name, setName] = useState(section.Name);
    // const [description, setDescription] = useState(section.Description);
    const [options, setOptions] = useState(section.Options);
    const [collapsed, setCollapsed] = useState<boolean>(true);

    const handleOptionChange = (index: number, option: KeyValuePair) => {
        const newOptions = [...options];
        newOptions[index] = option;
        setOptions(newOptions);
        onChange({ ...section, Options: newOptions });
    };
    const OnInit = () => {
        if (section.Visible) {
            setCollapsed(!section.Visible);
        }
    };
    useEffect(() => {
        OnInit();

    }, []);
    return (
        <PanelSectionRow
            //@ts-ignore
            style={{ display: "flex", flexDirection: "column", gap: "1em" }}
        >
            <Focusable style={{ padding: 0 }}>
                <ButtonItem
                    label={`[${section.Name}]`}
                    onClick={() => setCollapsed(!collapsed)}
                >
                    {collapsed ? <RiArrowDownSFill /> : <RiArrowUpSFill />}
                </ButtonItem>
            </Focusable>
            {!collapsed && (
                <div className={sectionEditorFieldRoot} style={{ display: "flex", flexDirection: "column" }}>
                    {options.map((option, index) => {
                        if (modeLevel >= option.ModeLevel)
                            return (
                                <FieldEditor
                                    field={option}
                                    onChange={updatedOption => handleOptionChange(index, updatedOption)}
                                    updateHelpText={field => updateHelpText(field)}
                                />
                            );
                        else
                            return null;
                    })}
                </div>
            )}
        </PanelSectionRow>
    );
};
