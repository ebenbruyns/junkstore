import {
    SliderField,
    TextField,
    ToggleField,
    Dropdown,
    Field,
    showContextMenu,
    Menu,
    MenuItem,
    Focusable,
    PanelSectionRow,
    DialogButton,
} from "decky-frontend-lib";
import { VFC, useEffect, useState } from "react";
import { ValueType } from "../Types/Types";
import { KeyValuePair } from "../Types/Types";
import { FaCog } from "react-icons/fa";

export const sectionEditorFieldFlexShrink = 'editor-field-flex-shrink';
export const sectionEditorFieldContainerNumber = 'editor-field-number';

interface FieldProps {
    field: KeyValuePair;
    value: any;
    onChange: (newValue: any) => void;
    fieldType: ValueType;
};

const FieldItem: VFC<FieldProps> = ({ field, value, onChange, fieldType }) => {
    const [parentValue, setParentValue] = useState("");
    useEffect(() => {
        if (field.Parents && field.Parents.length > 0) {
            setParentValue(
                "[Parent: " +
                field.Parents[0].Parent +
                ", Value: " +
                field.Parents[0].Value +
                "]"
            );
        }
    }, [field.Parents]);

    switch (fieldType) {
        case ValueType.Boolean:
            return (
                <ToggleField
                    label={field.Key + " " + parentValue}
                    checked={value === "true"}
                    onChange={(newValue) => onChange(newValue.toString())}

                />
            );
        case ValueType.Number:
            return (
                <Field label={field.Key + " " + parentValue} className={sectionEditorFieldContainerNumber}>
                    <TextField
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        //@ts-ignore
                        type="number"
                    />
                </Field>
            );
        case ValueType.Range:
            return (
                <SliderField
                    label={field.Key + " " + parentValue}
                    value={Number(value)}
                    onChange={(newValue) => onChange(newValue.toString())}
                    min={field.Min}
                    max={field.Max}
                    showValue={true}
                    editableValue={true}
                />
            );
        case ValueType.String:
            return (
                <Field label={field.Key + " " + parentValue} className={sectionEditorFieldFlexShrink} inlineWrap='keep-inline'>
                    <TextField value={value} onChange={(e) => onChange(e.target.value)} />
                </Field>
            );
        case ValueType.Enum:
            return (
                <Field label={field.Key + " " + parentValue} className={sectionEditorFieldFlexShrink} inlineWrap='keep-inline'>
                    <Dropdown
                        menuLabel={field.Key}
                        selectedOption={value}
                        rgOptions={field.EnumValues.map((enumValue) => ({
                            data: enumValue.Key,
                            label: enumValue.Key,
                        }))}
                        onChange={(e) => onChange(e.data)}
                    />
                </Field>
            );
        default:
            return null;
    }
};


interface FieldEditorProps {
    field: KeyValuePair;
    onChange: (field: KeyValuePair) => void;
    updateHelpText: (field: KeyValuePair) => void;
}

export const FieldEditor: VFC<FieldEditorProps> = ({ field, onChange, updateHelpText }) => {
    const [value, setValue] = useState(field.Value);
    const [fieldType, setFieldType] = useState(field.Type);

    const handleValueChange = (newValue: any) => {
        setValue(newValue);
        onChange({ ...field, Value: newValue });
    };

    const handleFieldTypeChange = (newFieldType: ValueType) => {
        setFieldType(newFieldType);
    };
    const changeType = (e: any) => {
        showContextMenu(
            <Menu label="Menu" cancelText="CANCEL" onCancel={() => { }}>
                <MenuItem onSelected={() => handleFieldTypeChange(ValueType.Boolean)}>
                    Boolean
                </MenuItem>
                <MenuItem onSelected={() => handleFieldTypeChange(ValueType.Number)}>
                    Number
                </MenuItem>
                {field.Min !== 0 && field.Max !== 0 && field.Min < field.Max && (
                    <MenuItem onSelected={() => handleFieldTypeChange(ValueType.Range)}>
                        Range
                    </MenuItem>
                )}
                <MenuItem onSelected={() => handleFieldTypeChange(ValueType.String)}>
                    String
                </MenuItem>
                {field.EnumValues && field.EnumValues.length > 0 && (
                    <MenuItem onSelected={() => handleFieldTypeChange(ValueType.Enum)}>
                        List
                    </MenuItem>
                )}
            </Menu>,
            e.currentTarget ?? window
        );
    };

    return (
        <PanelSectionRow>
            <Focusable
                style={{
                    display: "flex",
                    gap: "15px",
                    alignItems: "center",
                    padding: '0'
                }}
                //@ts-ignore
                resetNavOnEntry={true}
            >
                <Focusable style={{ flex: 'auto' }} onFocus={() => updateHelpText(field)}>
                    <FieldItem
                        field={field}
                        value={value}
                        onChange={handleValueChange}
                        fieldType={fieldType}
                    />
                </Focusable>
                <DialogButton
                    style={{
                        width: '48px',
                        minWidth: '48px',
                        padding: 'initial',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '36px'
                    }}
                    onClick={changeType}
                >
                    <FaCog />
                </DialogButton>
            </Focusable>
        </PanelSectionRow>
    );
};
