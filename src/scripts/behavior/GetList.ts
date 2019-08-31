import HandlerResult from "../handlerResult";
import FileHandler from "../fileHandler";
import { IBehavior } from "./IBehavior";

export class GetList implements IBehavior
{
    fileHandler: FileHandler;
    channelId: string;
    constructor(fileHandler: FileHandler, channelId: string)
    {
        this.fileHandler = fileHandler;
        this.channelId = channelId;
    }

    IsValid(): boolean
    {
        return true;
    }

    async Result(): Promise<HandlerResult>
    {
        return await this.fileHandler.GetList(this.channelId);
    }

    public OnFail(): HandlerResult
    {
        return this.fileHandler.DefaultHelp();
    }
}
