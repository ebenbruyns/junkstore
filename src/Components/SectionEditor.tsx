import { Section, KeyValuePair } from "../Types/Types";
import { ButtonItem, Focusable, PanelSectionRow } from "decky-frontend-lib";
import { RiArrowDownSFill, RiArrowUpSFill } from "react-icons/ri";
import { FieldEditor } from "./FieldEditor";
import { VFC, useEffect, useState } from "react";

export const sectionEditorRootClass = 'section-editor-root';
export const sectionEditorFieldContainer = 'section-editor-field-editors';

export const SectionEditor: VFC<{
  section: Section;
  updateHelpText: (helpText: KeyValuePair) => void;
  modeLevel: number;
  onChange: (section: Section) => void;
}> = ({ section, updateHelpText, modeLevel, onChange }) => {
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
      setCollapsed(!section.Visible)
    }
  }
  useEffect(() => {
    OnInit();

  }, []);
    return (
        <div className={sectionEditorRootClass}>
            <PanelSectionRow
                //@ts-ignore
                style={{ display: "flex", flexDirection: "column", gap: "1em" }}
            >
                <style>
                    {`
                    .${sectionEditorRootClass} .DialogInputLabelGroup {
                margin-bottom: 0;
            }
        `}
                </style>
                <Focusable>
                    <ButtonItem
                        label={`[${section.Name}]`}
                        onClick={() => setCollapsed(!collapsed)}
                    >
                        {collapsed ? <RiArrowDownSFill /> : <RiArrowUpSFill />}
                    </ButtonItem>
                </Focusable>
                {!collapsed && (
                    <div className={sectionEditorFieldContainer} style={{ display: "flex", flexDirection: "column", gap: "1em" }}>
                        {options.map((option, index) => {
                            if (modeLevel >= option.ModeLevel)
                                return (
                                    <FieldEditor
                                        field={option}
                                        onChange={(updatedOption) =>
                                            handleOptionChange(index, updatedOption)
                                        }
                                        updateHelpText={(field: KeyValuePair) => {
                                            updateHelpText(field);
                                        }}
                                    />
                                );
                            else
                                return null;
                        })}
                    </div>
                )}
            </PanelSectionRow>
        </div>
    );
};
