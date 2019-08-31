import BehaviorResult from "./behaviorResult";
import FileProcedure from "../procedure/fileProcedure";
import { IBehavior } from "./IBehavior";

export class GetList implements IBehavior
{
    channelId: string;
    
    constructor(channelId: string)
    {
        this.channelId = channelId;
    }

    async IsValid(): Promise<boolean>
    {
        return true;
    }

    async Result(): Promise<BehaviorResult>
    {
        return await FileProcedure.GetList(this.channelId);
    }

    public OnFail(): BehaviorResult
    {
        return FileProcedure.DefaultHelp();
    }
}
