import {
  ServerAPI,
  useParams,

} from "decky-frontend-lib";
import { VFC } from "react";
import { ConfEditor } from "./ConfEditor";

export const ConfEditorPage: VFC<{ serverAPI: ServerAPI }> = ({
  serverAPI,
}) => {

  const {
    // @ts-ignore
    initActionSet,
    // @ts-ignore
    initAction,
    contentId } = useParams<{
      initActionSet: string;
      initAction: string;
      contentId: string
    }>();
  return (
    <ConfEditor serverAPI={serverAPI} initAction="" initActionSet="" contentId={contentId} />

  )
}


