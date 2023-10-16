import React, { VFC, useState } from "react";
import { ValueType, Section, KeyValuePair } from "./Types";
import { ButtonItem, Focusable, PanelSectionRow } from "decky-frontend-lib";
import { RiArrowDownSFill, RiArrowUpSFill } from "react-icons/ri";
import { FieldEditor } from "./FieldEditor";
export const SectionEditor: VFC<{
  section: Section;
  updateHelpText: (helpText: KeyValuePair) => void;
  modeLevel: number;
  onChange: (section: Section) => void;
}> = ({ section, updateHelpText, modeLevel, onChange }) => {
  const [name, setName] = useState(section.Name);
  const [description, setDescription] = useState(section.Description);
  const [options, setOptions] = useState(section.Options);
  const [collapsed, setCollapsed] = useState<boolean>(true);

  const handleOptionChange = (index: number, option: KeyValuePair) => {
    const newOptions = [...options];
    newOptions[index] = option;
    setOptions(newOptions);
    onChange({ ...section, Options: newOptions });
  };

  return (
    <PanelSectionRow
      style={{ display: "flex", flexDirection: "column", gap: "1em" }}
    >
      <Focusable>
        <ButtonItem
          label={`[${section.Name}]`}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <RiArrowDownSFill /> : <RiArrowUpSFill />}
        </ButtonItem>
      </Focusable>
      {!collapsed && (
        <>
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
          })}
        </>
      )}
    </PanelSectionRow>
  );
};
