import BehaviorResult from "./behaviorResult";
import { IBehavior } from "./IBehavior";
import FileProcedure from "../procedure/fileProcedure";

export class DoNothing implements IBehavior
{
    async IsValid(): Promise<boolean>
    {
        return false;
    }

    async Result(): Promise<BehaviorResult> 
    {
        return null;
    }

    public OnFail(): BehaviorResult
    {
        return FileProcedure.DefaultHelp();
    }
}
