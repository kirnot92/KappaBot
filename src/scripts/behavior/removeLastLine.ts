import BehaviorResult from "./behaviorResult";
import String from "../extension/stringExtension";
import FileProcedure from "../procedure/fileProcedure";
import { IBehavior } from "./IBehavior";
import * as Command from "../../json/command.json";
import * as SystemMessage from "../../json/systemMessage.json";

export class RemoveLastLine implements IBehavior
{
    args: string[];
    channelId: string;
    isSystemCommand: boolean;

    constructor(args: string, channelId: string)
    {
        this.args = String.Slice([args], /\s|\n/, Command.마지막줄삭제.ArgCount-1);
        this.channelId = channelId;
    }

    public async IsValid(): Promise<boolean>
    {
        return String.HasValue(this.args, Command.마지막줄삭제.ArgCount);
    }

    public async Result(): Promise<BehaviorResult>
    {
        return await FileProcedure.RemoveLastLine(this.channelId, this.args[0]);
    }

    public OnFail(): BehaviorResult
    {
        return this.isSystemCommand ? this.CannotRegisterSystemCommand() : FileProcedure.DefaultHelp();
    }

    CannotRegisterSystemCommand(): BehaviorResult
    {
        return new BehaviorResult(SystemMessage.IsSystemMessage);
    }
}
