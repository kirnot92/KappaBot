import HandlerResult from "../handlerResult";
import { IBehavior } from "./IBehavior";
import FileHandler from "../fileHandler";

export class DoNothing implements IBehavior
{
    fileHandler: FileHandler;

    constructor(fileHandler: FileHandler)
    {
        this.fileHandler = fileHandler;
    }

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
        return this.fileHandler.DefaultHelp();
    }
}
