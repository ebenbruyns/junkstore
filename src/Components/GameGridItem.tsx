// Define the game image

import { Focusable, ServerAPI, showModal } from "decky-frontend-lib";
import { VFC, useState } from 'react';
import { GameData } from '../Types/Types';
import { GameDetailsItem } from './GameDetailsItem';

interface GameGridItemProps {
    gameData: GameData;
    imgAreaWidth: string;
    imgAreaHeight: string;
    serverAPI: ServerAPI;
    initActionSet: string;
    initAction: string;
    noName?: boolean;
}

const GameGridItem: VFC<GameGridItemProps> = ({ gameData, imgAreaWidth, imgAreaHeight, serverAPI, initActionSet, initAction, noName }) => {
    const [isFocused, setIsFocused] = useState(false);

    const src = gameData.Images.length > 0 ? gameData.Images[0] : "";

    return (
        <div>
            <div style={{ width: imgAreaWidth, height: imgAreaHeight, display: 'flex', alignItems: 'center' }}>
                <Focusable
                    key={gameData.ID}
                    style={{ position: 'relative', flex: 'auto' }}
                    onActivate={() => {
                        showModal(<GameDetailsItem serverAPI={serverAPI} shortname={gameData.ShortName} initActionSet={initActionSet} initAction={initAction} />);
                        //Router.CloseSideMenus();
                        //Router.Navigate("/game/" + tabindex + "/" + game.ShortName);
                    }}
                    onOKActionDescription="Show details"
                    onGamepadFocus={() => setIsFocused(true)}
                    onGamepadBlur={() => setIsFocused(false)}
                >
                    <img className={'libraryassetimage_Image_24_Au'} style={{ height: '100%' }} src={src} />
                    {isFocused && (
                        <img
                            style={{
                                filter: 'saturate(3) brightness(200%) blur(50px)',
                                zIndex: '-99',
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                top: '0',
                                left: '0'
                            }}
                            src={src}
                        />
                    )}
                </Focusable >
            </div>
            <div style={{ padding: '6px 1px 0', fontSize: '13px', textAlign: 'center', color: '#c2c0c0' }}>
                {gameData.Name}
            </div>
        </div>
    );
};
export default GameGridItem;
