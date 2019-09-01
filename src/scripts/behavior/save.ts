import BehaviorResult from "./behaviorResult";
import String from "../extension/stringExtension";
import FileProcedure from "../procedure/fileProcedure";
import { IBehavior } from "./IBehavior";

export class Save implements IBehavior
{
    args: string[];
    channelId: string;
    isSystemCommand: boolean;

    constructor(args: string[], channelId: string)
    {
        this.args = args;
        this.channelId = channelId;
    }

    public async IsValid(): Promise<boolean>
    {
        var hasValues = String.HasValue(this.args[0], this.args[1], this.args[2]);
        this.isSystemCommand = FileProcedure.IsSystemCommand(this.args[1]);
        return hasValues && !this.isSystemCommand;
    }

    public async Result(): Promise<BehaviorResult>
    {
        return await FileProcedure.Save(this.channelId, this.args[1], this.args[2]);
    }

    public OnFail(): BehaviorResult
    {
        return this.isSystemCommand ? this.CannotRegisterSystemCommand() : FileProcedure.DefaultHelp();
    }

    CannotRegisterSystemCommand(): BehaviorResult
    {
        return new BehaviorResult("시스템 기본 명령어는 등록할 수 없습니다.");
    }
}
