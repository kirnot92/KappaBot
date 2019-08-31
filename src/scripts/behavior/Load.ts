import HandlerResult from "../HandlerResult";
import FileProcedure from "../Procedure/Procedure";
import { IBehavior } from "./IBehavior";

export class Load implements IBehavior
{
    command: string;
    channelId: string;

    constructor(command: string, channelId: string)
    {
        this.command = command;
        this.channelId = channelId;
    }

    IsValid(): boolean
    {
        return true;
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
