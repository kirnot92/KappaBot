import BehaviorResult from "./behaviorResult";
import FileProcedure from "../procedure/fileProcedure";
import { IBehavior } from "./IBehavior";
import String from "../extension/stringExtension";
import Math from "../extension/mathExtension";
import * as Command from "../../json/command.json";

export class SelectRandom implements IBehavior
{
    prefixMessage: string;
    args: string[];

    constructor(args: string[])
    {
        this.args = args;
    }

    async IsValid(): Promise<boolean>
    {
        return String.HasValue(this.args, Command.랜덤.ArgCount);
    }

    async Result(): Promise<BehaviorResult>
    {
        // "랜덤" 제외하고 나머지 중에 하나
        var randomIndex = Math.Range(1, this.args.length);
        var result = this.args[randomIndex];

        return new BehaviorResult(result);
    }

    public OnFail(): BehaviorResult
    {
        return FileProcedure.DefaultHelp();
    }
}
