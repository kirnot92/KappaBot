import HandlerResult from "../handlerResult";
import FileProcedure from "../fileHandler";
import { IBehavior } from "./IBehavior";

export class GetList implements IBehavior
{
    channelId: string;
    
    constructor(channelId: string)
    {
        this.channelId = channelId;
    }

    IsValid(): boolean
    {
        return true;
    }

    async Result(): Promise<HandlerResult>
    {
        return await FileProcedure.GetList(this.channelId);
    }

    public OnFail(): HandlerResult
    {
        return FileProcedure.DefaultHelp();
    }
}
