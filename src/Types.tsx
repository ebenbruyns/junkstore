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
  exe: string;
  options: string;
  workingdir: string;
}

export interface BatData {
  id: number;
  gameId: number;
  Path: string;
  Content: string;
}


export interface ProgressUpdate {
  Percentage: number;
  // progress_current: string;
  // progress_total: string;
  // running_time: string;
  // eta: string;
  // downloaded_size: number;
  // written_size: number;
  // cache_usage: number;
  // active_tasks: number;
  // download_speed_raw: number;
  // download_speed_decompressed: number;
  // disk_write_speed: number;
  // disk_read_speed: number;
  // file_size_mb: number;
  // remaining_mb: number;
  // total_size: number;
  Description: string;
}
export interface SectionEditorProps {
  section: Section;
  onChange: (section: Section) => void;
}
