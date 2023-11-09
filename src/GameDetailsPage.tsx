import { ServerAPI, useParams } from "decky-frontend-lib";
import { VFC } from "react";
import { GameDetailsItem } from "./GameDetailsItem";

export const GameDetailsPage: VFC<{ serverAPI: ServerAPI }> = ({
  serverAPI,
}) => {

  const { shortname } = useParams<{

    shortname: string
  }>();
  return (
    <GameDetailsItem serverAPI={serverAPI} shortname={shortname} />
  )
}

