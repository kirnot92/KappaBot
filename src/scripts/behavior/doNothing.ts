import HandlerResult from "../handlerResult";
import { IBehavior } from "./IBehavior";
import FileProcedure from "../fileHandler";

export class DoNothing implements IBehavior
{
    async IsValid(): Promise<boolean>
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
