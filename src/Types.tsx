
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
  SteamClientID: string;
  HasDosConfig: boolean;
  HasBatFiles: boolean
}
// Define the grid container

export interface GameData {
  ID: number;
  Name: string;
  Images: string[];
  ShortName: string;
  SteamClientID: string;
}
export interface LaunchOptions {
  Exe: string;
  Options: string;
  WorkingDir: string;
}

export interface BatData {
  Id: number;
  GameId: number;
  Path: string;
  Content: string;
}


export interface ProgressUpdate {
  Percentage: number;
  Description: string;
}
export interface SectionEditorProps {
  section: Section;
  onChange: (section: Section) => void;
}
export interface GameData {
  id: number;
  name: string;
  image: string;
  shortname: string;
}
export interface ActionSet {
  SetName: string;
  Actions: MenuActions[];
}export interface MenuActions {
  ActionId: string;
  Title: string;
  Type: string;
}

export interface ContentResult {
  Type: string;
  Content?: Content;
}
export interface Content { }
export interface StoreContent extends Content {
  Panels: Panel[];
}
export interface StoreTabsContent extends Content {
  Tabs: TabContent[];
}
export interface TabContent {
  Title: string;
  Type: string;
  ActionId: string;
}
export interface ContentError extends Content {
  Message: string;
  Data: string;
}
export interface GameDataContent extends Content {
  Games: GameData[];
}
export interface LaunchOptionsContent extends Content {
  LaunchOptions: LaunchOptions;
}
export interface GameDetailsContent extends Content {
  Details: GameDetails;
}
export interface Panel {
  Title: string;
  Type: string;
  Actions: MenuActions[];
}

