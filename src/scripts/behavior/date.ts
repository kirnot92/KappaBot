import BehaviorResult from "./behaviorResult";
import String from "../extension/stringExtension";
import FileProcedure from "../procedure/fileProcedure";
import { IBehavior } from "./IBehavior";
import * as Command from "../../json/command.json";

export class Date implements IBehavior
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
        return String.HasValue(this.args, Command.언제.ArgCount)  && await FileProcedure.IsValidCommand(this.channelId, this.args[1]);
    }

    async Result(): Promise<BehaviorResult>
    {
        return await FileProcedure.Date(this.channelId, this.args[1]);
    }

    public OnFail(): BehaviorResult
    {
        return FileProcedure.DefaultHelp();
    }
}
