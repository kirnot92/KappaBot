import HandlerResult from "../handlerResult";
import String from '../Extension/StringExtension';
import FileProcedure from "../Procedure/Procedure";
import { IBehavior } from "./IBehavior";

export class Date implements IBehavior
{
    args: string[];
    channelId: string;

    constructor(args: string[], channelId: string)
    {
        this.args = args;
        this.channelId = channelId;
    }

    IsValid(): boolean
    {
        return String.HasValue(this.args[1]);
    }

    async Result(): Promise<HandlerResult>
    {
        return await FileProcedure.Date(this.channelId, this.args[1]);
    }

    public OnFail(): HandlerResult
    {
        return FileProcedure.DefaultHelp();
    }
}
