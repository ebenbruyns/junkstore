import { SteamSpinner } from "decky-frontend-lib";
import { VFC } from "react";

const spinnerContainer = 'spinner-container';

export const Loading: VFC = () => {
    return (
        <>
            <style>{`
                .${spinnerContainer} .loadingthrobber_ContainerBackground_2ngG3 {
                    background: unset;
                }
            `}</style>
            <div className={spinnerContainer} style={{ height: '100%', width: '100%' }}>
                <SteamSpinner/>
            </div>
        </>
    );
};
