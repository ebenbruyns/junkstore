import { SteamSpinner, quickAccessMenuClasses } from "decky-frontend-lib";
import { VFC } from "react";

const spinnerContainer = 'spinner-container';

export const Loading: VFC = () => {
    return (
        <>
            <style>{`
                .${spinnerContainer} .loadingthrobber_ContainerBackground_2ngG3 {
                    background: unset;
                }
                .${quickAccessMenuClasses.TabGroupPanel} .spinner-container {
                    position: absolute;
                    width: -webkit-fill-available;
                    height: -webkit-fill-available;
                    padding-bottom: 16px;
                }
                .${quickAccessMenuClasses.TabGroupPanel} .spinner-container .loadingthrobber_Medium_39-WT{
                    width: 110px;
                    height: 110px;
                }
                .spinner-container {
                    width: 100%;
                    height: 100%;
                }
                .${spinnerContainer} .loadingthrobber_LoadingStatus_3rAIy {
                    display: none;
                }
            `}</style>
            <div className={spinnerContainer} >
                <SteamSpinner/>
            </div>
        </>
    );
};
