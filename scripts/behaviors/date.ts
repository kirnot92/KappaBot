import IBehavior from "./IBehavior";
import HandlerResult from "../handlerResult";
import FileHandler from "../fileHandler";
import String from "../StringExtension";

export default class Date extends IBehavior
{
    fileHandler: FileHandler;
    args: string[];
    channelId: string;

    constructor(fileHandler: FileHandler, args: string[], channelId: string)
    {
        super();
        this.fileHandler = fileHandler;
        this.args = args;
        this.channelId = channelId;
    }

    IsValid(): boolean
    {
        return String.HasValue(this.args[1])
    }
    
    async Result(): Promise<HandlerResult>
    {
        return await this.fileHandler.Date(this.channelId, this.args[1])
    }
}