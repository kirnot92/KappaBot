import BehaviorResult from "./behaviorResult";
import FileProcedure from "../procedure/fileProcedure";
import { IBehavior } from "./IBehavior";
import String from "../extension/stringExtension";
import * as Command from "../../json/command.json";

export class Load implements IBehavior
{
    prefixMessage: string;
    command: string;
    channelId: string;

    constructor(args: string[], channelId: string)
    {
        this.prefixMessage = "";
        this.command = args[0]
        this.channelId = channelId;
    }

    async IsValid(): Promise<boolean>
    {
        var hasValue = String.HasValue([this.command], Command.로드.ArgCount);
        if (!hasValue) { return false; }

        var isValid = await FileProcedure.IsValidCommand(this.channelId, this.command);
        if (isValid) { return true; }

        var similiar = await FileProcedure.거리가_가까운_명령어_찾기(this.channelId, this.command);
        if (similiar.length > 0) 
        {
            this.prefixMessage = "[$"+ similiar +"]\n";
            this.command = similiar;
            return true;
        }
        else
        {
            return false;
        }
    }

    async Result(): Promise<BehaviorResult>
    {
        var result =  await FileProcedure.Load(this.channelId, this.command);
        result.Message = this.prefixMessage + result.Message;
        return result;
    }

    public OnFail(): BehaviorResult
    {
        return FileProcedure.DefaultHelp();
    }
}
