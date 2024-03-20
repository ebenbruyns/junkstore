import { SteamSpinner, quickAccessMenuClasses } from "decky-frontend-lib";
import { VFC } from "react";
import { steamSpinnerClasses } from '../staticClasses';

const spinnerContainer = 'spinner-container';

export const Loading: VFC = () => {
    return (
        <>
            <style>{`
                .${spinnerContainer} .${steamSpinnerClasses.ContainerBackground} {
                    background: unset;
                }
                .${quickAccessMenuClasses.TabGroupPanel} .spinner-container {
                    position: absolute;
                    width: -webkit-fill-available;
                    height: -webkit-fill-available;
                    padding-bottom: 16px;
                }
                .${quickAccessMenuClasses.TabGroupPanel} .spinner-container .${steamSpinnerClasses.Medium}{
                    width: 110px;
                    height: 110px;
                }
                .spinner-container {
                    width: 100%;
                    height: 100%;
                }
                .${spinnerContainer} .${steamSpinnerClasses.LoadingStatus} {
                    display: none;
                }
            `}</style>
            <div className={spinnerContainer} >
                <SteamSpinner/>
            </div>
        </>
    );
};
