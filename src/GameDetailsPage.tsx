import { ServerAPI, useParams } from "decky-frontend-lib";
import { VFC } from "react";
import { GameDetailsItem } from "./GameDetailsItem";

export const GameDetailsPage: VFC<{ serverAPI: ServerAPI }> = ({
  serverAPI,
}) => {

  const { tabindex, shortname } = useParams<{
    tabindex: number;
    shortname: string
  }>();
  return (
    <GameDetailsItem serverAPI={serverAPI} tabindex={tabindex} shortname={shortname} />
  )
}

