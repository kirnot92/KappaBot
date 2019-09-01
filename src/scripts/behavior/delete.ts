import BehaviorResult from "./behaviorResult";
import String from "../extension/stringExtension";
import FileProcedure from "../procedure/fileProcedure";
import { IBehavior } from "./IBehavior";
import * as Command from "../../json/command.json";

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
        return String.HasValue(this.args, Command.삭제.ArgCount);
    }

    async Result(): Promise<BehaviorResult>
    {
        return await FileProcedure.Delete(this.channelId, this.args[1]);
    }

    public OnFail(): BehaviorResult
    {
        return FileProcedure.DefaultHelp();
    }
}
