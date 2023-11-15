import { DialogBody, DialogControlsSection } from "decky-frontend-lib";
import { VFC } from "react";

export const TextContent: VFC<{ content: string }> = ({ content }) => {
    return (
        <DialogBody>
            <DialogControlsSection style={{ height: "calc(100%)" }}>
                {content}
            </DialogControlsSection>
        </DialogBody>
    );
}
export const HtmlContent: VFC<{ content: string }> = ({ content }) => {

    return (
        <DialogBody>
            <DialogControlsSection style={{ height: "calc(100%)" }}>
                <div dangerouslySetInnerHTML={{ __html: content }} />
            </DialogControlsSection>
        </DialogBody>
    );
}


