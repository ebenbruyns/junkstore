// Define the game image

import { Focusable, Spinner } from "decky-frontend-lib";
import { VFC, useEffect, useRef, useState } from 'react';
import { GameData } from '../Types/Types';
import { FaGears } from "react-icons/fa6";

interface GameGridItemProps {
    gameData: GameData;
    imgAreaWidth: string;
    imgAreaHeight: string;
    onClick: () => void;
    noName?: boolean;
}

const GameGridItem: VFC<GameGridItemProps> = ({ gameData, imgAreaWidth, imgAreaHeight, onClick, noName }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isImgLoaded, setIsImgLoaded] = useState(false);
    const [imgError, setImgError] = useState(false);
    const [isInBounds, setIsInBounds] = useState(false);
    const hasImage = gameData.Images.length > 0;
    
    return (
        <Focusable
            key={`item-root-${gameData.ID}`}
            style={{ width: imgAreaWidth, position: 'relative' }}
            onGamepadFocus={() => setIsFocused(true)}
            onGamepadBlur={() => setIsFocused(false)}
            noFocusRing={true}
            onActivate={onClick}
            onOKActionDescription="Show details"
        >
            {!isInBounds ? <ScreenBoundChecker marginBottom='1500px' onEnterBounds={() => setIsInBounds(true)} imgAreaHeight={imgAreaHeight} imgAreaWidth={imgAreaWidth} /> :
                <>
                    <div style={{ height: imgAreaHeight, display: 'flex', alignItems: 'center' }}>
                        <div
                            key={`container-${gameData.ID}`}
                            style={{
                                position: 'relative',
                                margin: 'auto',
                                ...(!hasImage || !isImgLoaded ? { width: '100%', height: '100%', display: 'flex' } : {})
                            }}
                        >
                            {!hasImage || imgError ? <FaGears style={{ alignSelf: 'center', flex: 'auto', height: '30%', color: '#6767675e' }} /> :
                                <>
                                    {!isImgLoaded && <Spinner style={{ alignSelf: 'center', flex: 'auto', height: '25%', color: '#7f7f7f4d' }} />}
                                    <img
                                        key={`img-${gameData.ID}`}
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
                                        onError={() => setImgError(true)}
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
                    {!noName && (
                        <div style={{ padding: '6px 1px 0', fontSize: '13px', textAlign: 'center', color: '#c2c0c0' }}>
                            {gameData.Name}
                        </div>
                    )}
                </>
            }
        </Focusable>
    );
};

interface ScreenBoundCheckerProps extends Pick<GameGridItemProps, 'imgAreaWidth' | 'imgAreaHeight'> {
    onEnterBounds: () => void;
    marginBottom: string;
}

const ScreenBoundChecker: VFC<ScreenBoundCheckerProps> = ({ imgAreaWidth, imgAreaHeight, marginBottom, onEnterBounds }) => {
    const topRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && onEnterBounds(), { root: null, threshold: 0 });
        if (topRef.current) {
          observer.observe(topRef.current);
        }
        return () => { if (topRef.current) {
                         observer.unobserve(topRef.current);
                       } };
    }, []);

    return (
        <>
            <div style={{ height: imgAreaHeight }} />
            <div style={{ width: imgAreaWidth, position: 'absolute', top: `calc(${marginBottom} * -1)`, bottom: '0' }} ref={topRef} />
        </>
    );
};

export default GameGridItem;
