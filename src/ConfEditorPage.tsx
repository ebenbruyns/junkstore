import {
  ServerAPI,
  useParams,

} from "decky-frontend-lib";
import { VFC } from "react";
import { Section } from "./Types";
import { ConfEditor } from "./ConfEditor";

export interface SectionEditorProps {
  section: Section;
  onChange: (section: Section) => void;
}
export const ConfEditorPage: VFC<{ serverAPI: ServerAPI }> = ({
  serverAPI,
}) => {
  const { tabindex, shortname, platform, forkname, version } = useParams<{
    tabindex: number;
    shortname: string;
    platform: string;
    forkname: string;
    version: string;
  }>();
  return (
    <ConfEditor serverAPI={serverAPI} tabindex={tabindex} shortname={shortname} forkname={forkname} platform={platform}

      version={version} />
  )
}


