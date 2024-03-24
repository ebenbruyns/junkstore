import { AppDetailsStore } from './steam/AppDetailsStore';

declare global {
    var appDetailsStore: AppDetailsStore;
    var appStore: AppStore;
}

export interface EnumStrings {
  Key: string;
  Description: string;
}
export interface LogFile {
  FileName: string;
  Content: string;
}
export interface ParentValue {
  Parent: string;
  Value: string;
}
export interface KeyValuePair {
  Key: string;
  Label?: string;
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
  Visible?: boolean;
  Name: string;
  ModeLevel: number;
  Description: string;
  Options: KeyValuePair[];
}
export interface ConfData extends ContentType {
  Sections: Section[];
  Autoexec: string;
  AutoexecEnabled?: boolean;
}
export enum ValueType {
  Number = "Number",
  Range = "Range",
  String = "String",
  Enum = "Enum",
  Boolean = "Boolean",
}
export interface GameDetails extends ContentType {
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
export interface ScriptActions extends ContentType {
  Actions: MenuAction[];
}

// Define the grid container
export interface GameDataList extends ContentType {
  NeedsLogin?: string;
  Games: GameData[];
}
export interface GameData {
  ID: number;
  Name: string;
  Images: string[];
  ShortName: string;
  SteamClientID: string;
}
export interface LaunchOptions extends ContentType {
  Exe: string;
  Options: string;
  WorkingDir: string;
  Name: string;
  Compatibility?: boolean;
  CompatToolName?: string;
}
export interface LoginStatus extends ContentType {
  Username: string;
  LoggedIn: boolean;
}
export interface SaveRefresh extends ContentType {
  Saved: boolean;
  Refresh: boolean;
}
export interface FilesData extends ContentType {
  Files: FileData[];
}
export interface SettingsData extends ContentType {
  name: string;
  value: string;
}
export interface FileData {
  Id: number;
  GameId: number;
  Path: string;
  Content: string;
}


export interface ProgressUpdate extends ContentType {
  Percentage: number;
  Description: string;
}
export interface GameImages extends ContentType {
  Grid: string;
  GridH: string;
  Hero: string;
  Logo: string;
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

export interface ActionSet extends ContentType {
  SetName: string;
  Actions: MenuAction[];
}
export interface MenuAction extends ContentType {
  ActionId: string;
  Title: string;
  Type: string;
  InstalledOnly?: boolean;
}

export interface ContentResult<T> {
  Type: string;
  Content: T;
}
export interface ContentType { }

export interface EmptyContent extends ContentType { }

export interface StoreTabsContent extends ContentType {
  Tabs: TabContent[];
}
export interface TabContent {
  Title: string;
  Type: string;
  ActionId: string;
}
export interface ContentError extends ContentType {
  Message: string;
  Data: string;
  ActionSet: string;
  ActionName: string;
}

export interface StoreContent extends ContentType {
  Panels: Panel[];
}
export interface SuccessContent extends ContentType {
  Message: string;
  Title?: string;
  Success?: boolean;
  Toast?: boolean;
}
export interface Panel {
  Title: string;
  Type: string;
  Actions: MenuAction[];
}

export interface ExecuteArgs {
  inputData?: string|FileData[]|ConfData;
}
export interface GetSettingArgs extends ExecuteArgs {
  name: string;
}
export interface SaveSettingsArgs extends GetSettingArgs {
  value: string;
}

export interface ExecuteGetGameDetailsArgs extends ExecuteArgs {
  shortname: string;
}
export interface ExecuteInstallArgs extends ExecuteGetGameDetailsArgs {
  steamClientID: string;
}
export interface ExecuteGetActionSetArgs extends ExecuteArgs {
  content_id: string;
}
export interface ExecuteGetContentArgs extends ExecuteArgs {
  filter?: string;
  installed?: string;
  limited?: string;
}

export interface ExecuteLoginArgs extends ExecuteArgs {
  gameId: string;
  appId: string;
}
export interface ExecuteGetExeActionSetArgs extends ExecuteLoginArgs {
   content_id: string;
}

export interface ExecuteGetFilesDataArgs extends ExecuteLoginArgs {
  SteamClientId: string;
  shortName: string;
}
export interface ExecuteRunBinaryArgs extends ExecuteGetFilesDataArgs {
  GameExe: string;
  AdditionalArguments: boolean;
  CompatToolName: string;
}
