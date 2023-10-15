import { Key, VFC, useState } from "react";
import { ValueType, Section, KeyValuePair } from "./Types";
import { Focusable, PanelSection, PanelSectionRow } from "decky-frontend-lib";
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

  const handleOptionChange = (index: number, option: KeyValuePair) => {
    const newOptions = [...options];
    newOptions[index] = option;
    setOptions(newOptions);
    onChange({ ...section, Options: newOptions });
  };

  //

  return (
    <PanelSection title={"[" + section.Name + "]"}>
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
    </PanelSection>
  );
};
