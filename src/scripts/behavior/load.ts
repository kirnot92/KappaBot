import HandlerResult from "../handlerResult";
import FileProcedure from "../fileHandler";
import { IBehavior } from "./IBehavior";
import String from "../extension/stringExtension";

export class Load implements IBehavior
{
    command: string;
    channelId: string;

    constructor(args: string[], channelId: string)
    {
        this.command = args[0]
        this.channelId = channelId;
    }

    async IsValid(): Promise<boolean>
    {
        return String.HasValue(this.command) && await FileProcedure.IsValidCommand(this.channelId, this.command);
    }

    async Result(): Promise<HandlerResult>
    {
        return await FileProcedure.Load(this.channelId, this.command);
    }

    public OnFail(): HandlerResult
    {
        return FileProcedure.DefaultHelp();
    }
}
