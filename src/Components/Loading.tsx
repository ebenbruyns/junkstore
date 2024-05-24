import { SteamSpinner, joinClassNames, quickAccessMenuClasses } from "decky-frontend-lib";
import { VFC } from "react";
import { steamSpinnerClasses } from '../staticClasses';

const spinnerContainer = 'spinner-container';
const flexSpinner = 'spinner-flex';

export const Loading: VFC<{flex?: boolean}> = ({flex}) => {
    return (
        <>
            <style>{`
                .${spinnerContainer} .${steamSpinnerClasses.ContainerBackground} {
                    background: unset;
                }
                .${quickAccessMenuClasses.TabGroupPanel} .${spinnerContainer}{
                    position: absolute;
                    width: -webkit-fill-available;
                    height: -webkit-fill-available;
                    padding-bottom: 16px;
                }
                .${quickAccessMenuClasses.TabGroupPanel} .${spinnerContainer} .${steamSpinnerClasses.Medium}{
                    width: 110px;
                    height: 110px;
                }
                .${spinnerContainer} {
                    width: 100%;
                    height: 100%;
                }
                .${spinnerContainer}.${flexSpinner} .${steamSpinnerClasses.Medium} {
                    flex: 1;
                    height: 100%;
                    width: auto;
                }
                .${spinnerContainer}.${flexSpinner} .${steamSpinnerClasses.SpinnerLoaderContainer} {
                    height: 100%;
                }
                .${spinnerContainer} .${steamSpinnerClasses.LoadingStatus} {
                    display: none;
                }
            `}</style>
            <div className={joinClassNames(spinnerContainer, flex ? flexSpinner : '')} >
                <SteamSpinner/>
            </div>
        </>
    );
};
