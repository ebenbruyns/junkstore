import { ServerAPI, useParams } from "decky-frontend-lib";
import { VFC } from "react";
import { GameDetailsItem } from "./GameDetailsItem";

interface GameDetailsPageProperties {
  serverAPI: ServerAPI;

}

export const GameDetailsPage: VFC<GameDetailsPageProperties> = ({
  serverAPI,
}) => {

  const { initActionSet, initAction, shortname } = useParams<{
    initActionSet: string;
    initAction: string;
    shortname: string
  }>();
  return (
    <GameDetailsItem serverAPI={serverAPI} shortname={shortname} initActionSet={initActionSet} initAction={initAction} />
  )
}

