import { ButtonItem, ConfirmModal, DialogButton, ServerAPI, ToggleField, showModal } from "decky-frontend-lib";
import { VFC, useState } from "react";
import { resetAchievements } from "./Utils/achievements";


export const Developer: VFC<{ serverAPI: ServerAPI; }> = ({ serverAPI }) => {

    const [logging, setLogging] = useState(localStorage.getItem('enableLogger') === 'true');
    const [firstLaunch, setFirstLaunch] = useState(localStorage.getItem('js_firstlaunch') === 'true');
    const toggleFirstLaunch = async (value: string) => {
        localStorage.setItem('js_firstlaunch', value);
    }
    const toggleLogging = async (value: string) => {
        localStorage.setItem('enableLogger', value);
    }
    return (
        <div>
            <ToggleField
                label="Enable UI Logging"
                checked={logging}
                onChange={(newValue) => toggleLogging(newValue.toString())}


            />
            <ToggleField
                label="Set first Launch"
                checked={firstLaunch}
                onChange={(newValue) => toggleFirstLaunch(newValue.toString())}
            />
            <DialogButton

                onClick={async () => {
                    showModal(<ConfirmModal strTitle="Confirm" strDescription={"Reset all achievements?"} onOK={() => { resetAchievements(); }} />)
                }}
            >
                Reset Achievements
            </DialogButton>
        </div>
    );
};
