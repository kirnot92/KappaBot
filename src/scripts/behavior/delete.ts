import HandlerResult from "../handlerResult";
import String from '../extension/stringExtension';
import FileProcedure from "../fileHandler";
import { IBehavior } from "./IBehavior";

export class Delete implements IBehavior
{
    args: string[];
    channelId: string;

    constructor(args: string[], channelId: string)
    {
        this.args = args;
        this.channelId = channelId;
    }

    async IsValid(): Promise<boolean>
    {
        return String.HasValue(this.args[1]);
    }

    async Result(): Promise<HandlerResult>
    {
        return await FileProcedure.Delete(this.channelId, this.args[1]);
    }

    public OnFail(): HandlerResult
    {
        return FileProcedure.DefaultHelp();
    }
}
