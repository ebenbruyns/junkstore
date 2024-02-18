import { Focusable, ModalPosition, GamepadButton, ScrollPanelGroup, gamepadDialogClasses, scrollPanelClasses } from "decky-frontend-lib";
import { FC, useLayoutEffect, useRef, useState } from "react";

export interface ScrollableWindowProps {
    height: string;
    fadeAmount?: string;
    scrollBarWidth?: string;
    noFooter?: boolean;
}

export const ScrollableWindow: FC<ScrollableWindowProps> = ({ height, fadeAmount, scrollBarWidth, noFooter, children }) => {
    const fade = fadeAmount === undefined || fadeAmount === '' ? '10px' : fadeAmount;
    const barWidth = scrollBarWidth === undefined || scrollBarWidth === '' ? '4px' : scrollBarWidth;
    const [isOverflowing, setIsOverflowing] = useState(false);
    const scrollPanelRef = useRef<HTMLElement>();

    useLayoutEffect(() => {
        const { current } = scrollPanelRef;
        const trigger = () => {
            if (current) {
                const hasOverflow = current.scrollHeight > current.clientHeight;
                setIsOverflowing(hasOverflow);
            }
        };

        if (current) trigger();
    }, [scrollPanelRef, children, height]);

    const panel = (
        <ScrollPanelGroup 
        //@ts-ignore
        ref={scrollPanelRef} focusable={false} style={{ flex: 1, minHeight: 0 }}>
            <Focusable
                //@ts-ignore
                focusable={isOverflowing}
                noFocusRing={true}
                actionDescriptionMap={noFooter ? undefined :
                    {
                        [GamepadButton.DIR_UP]: 'Scroll Up',
                        [GamepadButton.DIR_DOWN]: 'Scroll Down'
                    }
                }
            >
                {children}
            </Focusable>
        </ScrollPanelGroup>
    );

    return (
        <>
            <style>
                {`.modal-position-container .${gamepadDialogClasses.ModalPosition} {
			top: 0;
			bottom: 0;
			padding: 0;
		  }
		  .modal-position-container .${scrollPanelClasses.ScrollPanel}::-webkit-scrollbar {
			display: initial !important;
			width: ${barWidth};
		  }
		  .modal-position-container .${scrollPanelClasses.ScrollPanel}::-webkit-scrollbar-thumb {
			border: 0;
		  }`}
            </style>
            <div
                className='modal-position-container'
                style={{
                    position: 'relative',
                    height: height,
                    WebkitMask: `linear-gradient(to right , transparent, transparent calc(100% - ${barWidth}), white calc(100% - ${barWidth})), linear-gradient(to bottom, transparent, black ${fade}, black calc(100% - ${fade}), transparent 100%)`
                }}>
                {isOverflowing ? (
                    <ModalPosition key={'modal-position'}>

                            {panel}
                    </ModalPosition>
                ) : (
                    <div className={`${gamepadDialogClasses.ModalPosition} ${gamepadDialogClasses.WithStandardPadding} Panel`} key={'modal-position'}>
                        {panel}
                    </div>
                )}
            </div>
        </>
    );
};

interface ScrollableWindowAutoProps extends Omit<ScrollableWindowProps, 'height'> {
	heightPercent?: number;
}

export const ScrollableWindowRelative: FC<ScrollableWindowAutoProps> = ({ heightPercent, ...props }) => {
	return (
		<div style={{ flex: 'auto' }}>
			<ScrollableWindow height={`${heightPercent ?? 100}%`} {...props} />
		</div>
	);
};