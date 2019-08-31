import HandlerResult from "../handlerResult";
import String from '../stringExtension';
import FileHandler from "../fileHandler";
import { IBehavior } from "./IBehavior";

export class Save implements IBehavior
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

    public IsValid(): boolean
    {
        return String.HasValue(this.args[0], this.args[1], this.args[2]);
    }

    public async Result(): Promise<HandlerResult>
    {
        return await this.fileHandler.Save(this.channelId, this.args[1], this.args.slice(2).join(' '));
    }

    public OnFail(): HandlerResult
    {
        return this.fileHandler.DefaultHelp();
    }
}
