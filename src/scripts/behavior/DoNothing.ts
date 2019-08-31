import HandlerResult from "../HandlerResult";
import { IBehavior } from "./IBehavior";
import FileProcedure from "../Procedure/File";

export class DoNothing implements IBehavior
{
    IsValid(): boolean
    {
        return false;
    }

    async Result(): Promise<HandlerResult> 
    {
        return null;
    }

    public OnFail(): HandlerResult
    {
        return FileProcedure.DefaultHelp();
    }
}
