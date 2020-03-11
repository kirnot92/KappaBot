import BehaviorResult from "./behaviorResult";
import String from "../extension/stringExtension";
import FileProcedure from "../procedure/fileProcedure";
import { IBehavior } from "./IBehavior";
import * as Command from "../../json/command.json";

export class Delete implements IBehavior
{
    args: string[];
    channelId: string;

    constructor(args: string, channelId: string)
    {
        this.args = String.Slice([args], /\s|\n/, Command.삭제.ArgCount-1);
        this.channelId = channelId;
    }

    async IsValid(): Promise<boolean>
    {
        return String.HasValue(this.args, Command.삭제.ArgCount)
            && FileProcedure.IsValidCommand(this.channelId, this.args[0]);
    }

    async Result(): Promise<BehaviorResult>
    {
        return await FileProcedure.Delete(this.channelId, this.args[0]);
    }

    public OnFail(): BehaviorResult
    {
        return FileProcedure.DefaultHelp();
    }
}
