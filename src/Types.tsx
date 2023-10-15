export interface EnumStrings {
  Key: string;
  Description: string;
}
export interface ParentValue {
  Parent: string;
  Value: string;
}
export interface KeyValuePair {
  Key: string;
  Value: string;
  DefaultValue: string;
  Description: string;
  Type: ValueType;
  Min: number;
  Max: number;
  ModeLevel: number;
  Parents: ParentValue[];
  EnumValues: EnumStrings[];
}
export interface Section {
  Name: string;
  ModeLevel: number;
  Description: string;
  Options: KeyValuePair[];
}
export interface ConfData {
  Sections: Section[];
  Autoexec: string;
}
export enum ValueType {
  Number = "Number",
  Range = "Range",
  String = "String",
  Enum = "Enum",
  Boolean = "Boolean",
}
export interface GameDetails {
  Name: string;
  Description: string;
  ApplicationPath: string;
  ManualPath: string;
  Publisher: string;
  RootFolder: string;
  Source: string;
  DatabaseID: string;
  Genre: string;
  ConfigurationPath: string;
  Developer: string;
  ReleaseDate: string;
  Images: string[];
  ShortName: string;
}
// Define the grid container

export interface GameData {
  id: number;
  name: string;
  images: string[];
  shortname: string;
}
