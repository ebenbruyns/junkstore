import {
    SliderField,
    TextField, ToggleField,
    Dropdown, Button, ButtonItem,
    showContextMenu, Menu, MenuItem, Focusable, PanelSectionRow, DialogButton
} from "decky-frontend-lib";
import { VFC, useEffect, useLayoutEffect, useState } from "react";
import { ValueType } from "./Types";
import { KeyValuePair } from "./Types";
import { FaCog } from "react-icons/fa";

type FieldProps = {
    field: KeyValuePair;
    value: any;
    onChange: (newValue: any) => void;
    fieldType: ValueType;
};

const Field: VFC<FieldProps> = ({ field, value, onChange, fieldType }) => {
    const [parentValue, setParentValue] = useState("");
    useEffect(() => {
        if (field.Parents && field.Parents.length > 0) {

            setParentValue("[Parent: " + field.Parents[0].Parent + ", Value: " + field.Parents[0].Value + "]")

        }
    }, [field.Parents]);
    switch (fieldType) {
        case ValueType.Boolean:
            return (
                <ToggleField
                    label={field.Key + " " + parentValue}
                    checked={value === "true"}
                    onChange={(newValue) => onChange(newValue.toString())} />
            );
        case ValueType.Number:
            return (
                <TextField
                    label={field.Key + " " + parentValue}
                    type="number"
                    value={value}
                    onChange={(e) => onChange(e.target.value)} />
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
                    editableValue={true} />
            );
        case ValueType.String:
            return (
                <TextField
                    label={field.Key + " " + parentValue}
                    value={value}
                    onChange={(e) => onChange(e.target.value)} />
            );
        case ValueType.Enum:
            return (
                <div>
                    <span >{field.Key + " " + parentValue}</span>
                    <Dropdown
                        menuLabel={field.Key}
                        selectedOption={value}
                        rgOptions={field.EnumValues.map((enumValue) => ({ data: enumValue.Key, label: enumValue.Key }))}
                        onChange={(e) => onChange(e.data)} /></div>
            );
        default:
            return null;
    }
};



export const FieldEditor: VFC<{
    field: KeyValuePair;
    onChange: (field: KeyValuePair) => void;
    updateHelpText: (field: KeyValuePair) => void;
}> = ({ field, onChange,
    updateHelpText }) => {
        const [value, setValue] = useState(field.Value);
        const [fieldType, setFieldType] = useState(field.Type);

        const handleValueChange = (newValue: any) => {
            setValue(newValue);
            onChange({ ...field, Value: newValue });
        };

        const handleFieldTypeChange = (newFieldType: ValueType) => {
            setFieldType(newFieldType);
        };
        const changeType = (e) => {
            showContextMenu(
                <Menu label="Menu" cancelText="CANCEL" onCancel={() => { }}>
                    <MenuItem onSelected={() => handleFieldTypeChange(ValueType.Boolean)}>Boolean</MenuItem>
                    <MenuItem onSelected={() => handleFieldTypeChange(ValueType.Number)}>Number</MenuItem>

                    {(field.Min !== 0 && field.Max !== 0 && field.Min < field.Max) && (
                        <MenuItem onSelected={() => handleFieldTypeChange(ValueType.Range)}>Range</MenuItem>
                    )}
                    <MenuItem onSelected={() => handleFieldTypeChange(ValueType.String)}>String</MenuItem>
                    {field.EnumValues && field.EnumValues.length > 0 && (
                        <MenuItem onSelected={() => handleFieldTypeChange(ValueType.Enum)}>List</MenuItem>
                    )}
                </Menu>,
                e.currentTarget ?? window
            )
        };
        //
        return (
            <PanelSectionRow style={{ display: "flex", flexDirection: "row" }}>
                <Focusable style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <Focusable
                        style={{ width: "400px", marginLeft: "20px" }}
                        onFocus={() => {
                            updateHelpText(field);
                        }}
                    >
                        <Field
                            field={field}
                            value={value}
                            onChange={handleValueChange}
                            fieldType={fieldType}
                        />
                    </Focusable>
                    <ButtonItem
                        onClick={changeType}
                        onOKButton={changeType}
                        bottomSeperator="none"
                        style={{
                            width: "40px",
                            height: "40px",
                            minWidth: "40px",
                            maxHeight: "40px",
                            minHeight: "40px",
                            margin: "auto",
                            position: "relative",

                        }}
                    >
                        <FaCog
                            style={{
                                position: "absolute",
                                left: "50%",
                                top: "50%",
                                transform: "translate(-50%,-50%)",
                            }}
                        />
                    </ButtonItem>
                </Focusable>
            </PanelSectionRow>
        );
    };