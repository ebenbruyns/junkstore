import { Focusable, ServerAPI, useParams } from "decky-frontend-lib";
import { useState, useEffect, VFC } from "react";
import GameDisplay from "./GameDisplay";
import { GameDetails } from "./Types";

export const GameDetailsPage: VFC<{ serverAPI: ServerAPI; }> = ({ serverAPI }) => {
    const [gameData, setGameData] = useState({} as GameDetails);
    const { shortname } = useParams<{ shortname: string; }>();
    useEffect(() => {
        onInit();
    }, []);
    const onInit = async () => {
        serverAPI.callPluginMethod<{}, GameDetails>("get_game_details", { shortname: shortname }).then(data => {
            setGameData(data.result as GameDetails);
        });
    };
    return (
        <div style={{ margin: "50px", color: "white" }}>

            <Focusable>
                <GameDisplay
                    name={gameData.Name}
                    description={gameData.Description}
                    releaseDate={gameData.ReleaseDate}
                    developer={gameData.Developer}
                    images={gameData.Images}
                    publisher={gameData.Publisher}
                    source={gameData.Source}
                    genre={gameData.Genre}
                    installer={() => {
                        serverAPI.callPluginMethod<{}, string>("install_game", { shortname: gameData.ShortName }).then(data => {
                            console.log(data.result);
                            SteamClient.Apps.AddShortcut(gameData.Name, "", "", "");
                        });
                    }}
                />
            </Focusable>
        </div>
    );
};

