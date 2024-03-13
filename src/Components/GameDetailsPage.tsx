import { ServerAPI, useParams } from "decky-frontend-lib";
import { VFC } from "react";
import { GameDetailsItem } from "./GameDetailsItem";

interface GameDetailsPageProperties {
  serverAPI: ServerAPI;
  clearActiveGame: () => void;
}

export const GameDetailsPage: VFC<GameDetailsPageProperties> = ({
  serverAPI,
  clearActiveGame
}) => {

  const { initActionSet, initAction, shortname } = useParams<{
    initActionSet: string;
    initAction: string;
    shortname: string
  }>();
  return (
    <GameDetailsItem serverAPI={serverAPI} shortname={shortname} initActionSet={initActionSet} initAction={initAction} clearActiveGame={clearActiveGame} />
  )
}

