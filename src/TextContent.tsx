import { DialogBody, DialogControlsSection } from "decky-frontend-lib";
import { VFC } from "react";


export const TextContent: VFC<{ content: string; }> = ({ content }) => {
    return (
        <DialogBody>
            <DialogControlsSection style={{ height: "calc(100%)" }}>
                {content}
            </DialogControlsSection>
        </DialogBody>
    );
};
