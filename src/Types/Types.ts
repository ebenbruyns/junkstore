
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
export interface ConfData extends Content {
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
export interface GameDetails extends Content {
  Name: string;
  Description: string;
  ApplicationPath: string;
  ManualPath: string;
  RootFolder: string;
  DatabaseID: string;
  ConfigurationPath: string;
  Images: string[];
  ShortName: string;
  SteamClientID: string;
  HasDosConfig: boolean;
  HasBatFiles: boolean;
  Editors: EditorAction[];
}
export interface EditorAction {
  Type: string;
  InitActionId: string;
  Title: string;
  Description: string;
  ContentId: string;
}
// Define the grid container
export interface GameDataList extends Content {
  Games: GameData[];
}
export interface GameData {
  ID: number;
  Name: string;
  Images: string[];
  ShortName: string;
  SteamClientID: string;
}
export interface LaunchOptions extends Content {
  Exe: string;
  Options: string;
  WorkingDir: string;
}
export interface FilesData extends Content {
  Files: FileData[];
}
export interface FileData {
  Id: number;
  GameId: number;
  Path: string;
  Content: string;
}


export interface ProgressUpdate extends Content {
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
// export interface ActionSetContent extends Content {
//   ActionSet: ActionSet;

export interface ActionSet extends Content {
  SetName: string;
  Actions: MenuActions[];
}
export interface MenuActions extends Content {
  ActionId: string;
  Title: string;
  Type: string;
}

export interface ContentResult {
  Type: string;
  Content?: Content;
}
export interface Content { }

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
  ActionSet: string;
  ActionName: string;
}

export interface StoreContent extends Content {
  Panels: Panel[];
}
export interface Panel {
  Title: string;
  Type: string;
  Actions: MenuActions[];
}

