import HandlerResult from "../handlerResult";
import String from '../stringExtension';
import FileHandler from "../fileHandler";
import { IBehavior } from "./IBehavior";

export class Delete implements IBehavior
{
    fileHandler: FileHandler;
    args: string[];
    channelId: string;

    constructor(fileHandler: FileHandler, args: string[], channelId: string)
    {
        this.fileHandler = fileHandler;
        this.args = args;
        this.channelId = channelId;
    }

    IsValid(): boolean
    {
        return String.HasValue(this.args[1]);
    }

    async Result(): Promise<HandlerResult>
    {
        return await this.fileHandler.Delete(this.channelId, this.args[1]);
    }

    public OnFail(): HandlerResult
    {
        return this.fileHandler.DefaultHelp();
    }
}
