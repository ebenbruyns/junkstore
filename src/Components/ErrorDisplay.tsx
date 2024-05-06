import { ContentError } from "../Types/Types";

export const ErrorDisplay = ({ error }: { error: ContentError; }) => {
    return (
        <div>
           
            <div>ActionSet: {error.ActionSet}</div>
            <div>ActionName:{error.ActionName}</div>

            <div>Message: {error.Message}</div>
            <div dangerouslySetInnerHTML={{ __html: error.Data }}></div>
           
        </div>
    );
};
