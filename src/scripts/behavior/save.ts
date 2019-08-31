import HandlerResult from "../handlerResult";
import String from '../extension/stringExtension';
import FileProcedure from "../fileHandler";
import { IBehavior } from "./IBehavior";

export class Save implements IBehavior
{
    args: string[];
    channelId: string;

    constructor(args: string[], channelId: string)
    {
        this.args = args;
        this.channelId = channelId;
    }

    public async IsValid(): Promise<boolean>
    {
        return String.HasValue(this.args[0], this.args[1], this.args[2]);
    }

    public async Result(): Promise<HandlerResult>
    {
        return await FileProcedure.Save(this.channelId, this.args[1], this.args.slice(2).join(' '));
    }

    public OnFail(): HandlerResult
    {
        return FileProcedure.DefaultHelp();
    }
}
