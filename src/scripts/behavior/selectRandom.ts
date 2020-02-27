import BehaviorResult from "./behaviorResult";
import FileProcedure from "../procedure/fileProcedure";
import { IBehavior } from "./IBehavior";
import Math from "../extension/mathExtension";

export class SelectRandom implements IBehavior
{
    prefixMessage: string;
    args: string[];

    constructor(args: string)
    {
        this.args = args.split(/\s|\n/);
    }

    async IsValid(): Promise<boolean>
    {
        return this.args.length > 1;
    }

    async Result(): Promise<BehaviorResult>
    {
        // "랜덤" 제외하고 나머지 중에 하나
        var randomIndex = Math.Range(0, this.args.length - 1);
        var result = this.args[randomIndex];

        return new BehaviorResult(result);
    }

    public OnFail(): BehaviorResult
    {
        return FileProcedure.DefaultHelp();
    }
}
