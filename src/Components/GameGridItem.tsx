// Define the game image

import { Focusable, ServerAPI, Spinner, showModal } from "decky-frontend-lib";
import { VFC, useState } from 'react';
import { GameData } from '../Types/Types';
import { GameDetailsItem } from './GameDetailsItem';
import { FaGears } from "react-icons/fa6";

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
    const [isImgLoaded, setIsImgLoaded] = useState(false);

    const hasImage = gameData.Images.length > 0;

    return (
        <Focusable style={{ width: imgAreaWidth }}
            onGamepadFocus={() => setIsFocused(true)}
            onGamepadBlur={() => setIsFocused(false)}
            noFocusRing={true}
            onActivate={() => {
                showModal(<GameDetailsItem serverAPI={serverAPI} shortname={gameData.ShortName} initActionSet={initActionSet} initAction={initAction} />);
                //Router.CloseSideMenus();
                //Router.Navigate("/game/" + tabindex + "/" + game.ShortName);
            }}
            onOKActionDescription="Show details"
        >
            <div style={{ height: imgAreaHeight, display: 'flex', alignItems: 'center' }}>
                <div
                    key={gameData.ID}
                    style={{
                        position: 'relative',
                        margin: 'auto',
                        ...(!hasImage || !isImgLoaded ? { width: '100%', height: '100%', display: 'flex' } : {})
                    }}
                >
                    {!hasImage ? <FaGears style={{ alignSelf: 'center', flex: 'auto', height: '40%', color: '#6767675e' }} /> :
                        <>
                            {!isImgLoaded && <Spinner style={{ alignSelf: 'center', flex: 'auto', height: '40%', color: '#676767db' }} />}
                            <img
                                className={'libraryassetimage_Image_24_Au'}
                                style={{
                                    width: 'auto',
                                    height: 'auto',
                                    maxWidth: imgAreaWidth,
                                    maxHeight: imgAreaHeight,
                                    opacity: isImgLoaded ? 1 : 0,
                                    transition: 'opacity 0.5s'
                                }}
                                src={hasImage ? gameData.Images[0] : ""}
                                onLoad={() => setIsImgLoaded(true)}
                            />
                        </>
                    }
                    {isFocused && (
                        <>
                            <img
                                style={{
                                    filter: 'saturate(3) brightness(200%) blur(50px)',
                                    zIndex: '-99',
                                    position: 'absolute',
                                    width: '100%',
                                    height: '100%',
                                    top: '0',
                                    left: '0',
                                    visibility: isImgLoaded ? 'visible' : 'hidden'
                                }}
                                src={hasImage ? gameData.Images[0] : ""}
                            />
                            <div
                                style={{
                                    position: 'absolute',
                                    width: '100%',
                                    height: '100%',
                                    top: '0px',
                                    left: '0px',
                                }}
                                className='focusring_FocusRing_1IZrQ'
                            />
                        </>
                    )}
                </div >
            </div>
            <div style={{ padding: '6px 1px 0', fontSize: '13px', textAlign: 'center', color: '#c2c0c0' }}>
                {gameData.Name}
            </div>
        </Focusable>
    );
};
export default GameGridItem;
