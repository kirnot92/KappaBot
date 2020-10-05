import String from "../extension/stringExtension";
import CommandRepository from "../procedure/commandRepository";
import Global from "../core/global";
import { IBehavior } from "./IBehavior";
import { LogicHalt } from "../core/assert";
import * as Command from "../../json/command.json";
import * as SystemMessage from "../../json/systemMessage.json";

export class Register implements IBehavior
{
    args: string[];
    channelId: string;
    isSystemCommand: boolean;

    constructor(args: string, channelId: string)
    {
        this.args = String.Slice([args], /\s|\n/, Command.등록.ArgCount-1);
        this.channelId = channelId;

        var hasValue = String.HasValue(this.args, Command.등록.ArgCount);
        if (!hasValue)
        {
            LogicHalt.InvaildUsage(Command.등록.Key);
        }
    }

    public async Run()
    {
        var result = await this.GetResult();

        await Global.Client.SendMessage(this.channelId, result);
    }

    async GetResult(): Promise<string>
    {
        var isAlreadyRegistered = await CommandRepository.IsExists(this.channelId, this.args[0]);
        if (isAlreadyRegistered)
        {
            return "이미 등록된 명령어입니다.\n한 줄을 추가하려면 [추가] 명령어를 사용해주세요.";
        }

        if (CommandRepository.IsSystemCommand(this.args[0]))
        {
            return SystemMessage.IsSystemMessage;
        }

        await CommandRepository.AddLine(this.channelId, this.args[0], this.args[1]);

        return SystemMessage.Comfirmed;
    }
}
