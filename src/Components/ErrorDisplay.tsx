import { ContentError } from "../Types/Types";

export const ErrorDisplay = ({ error }: { error: ContentError; }) => {
    return (
        <div>
            <h1>Error</h1>
            <div>ActionSet: {error.ActionSet}</div>
            <div>ActionName:{error.ActionName}</div>

            <div>Message: {error.Message}</div>
            <div>{error.Data}</div>
            <div>If you haven't installed the dependencies you can do so from the about menu.</div>
        </div>
    );
};
