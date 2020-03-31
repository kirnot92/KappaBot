import String from "../extension/stringExtension";
import CommandRepository from "../procedure/commandRepository";
import Global from "../core/global";
import { IBehavior } from "./IBehavior";
import * as Command from "../../json/command.json";
import * as SystemMessage from "../../json/systemMessage.json";

export class Delete implements IBehavior
{
    args: string[];
    channelId: string;

    constructor(args: string, channelId: string)
    {
        this.args = String.Slice([args], /\s|\n/, Command.삭제.ArgCount-1);
        this.channelId = channelId;
    }

    public async Run()
    {
        var result = await this.GetResult();

        Global.Client.SendMessage(this.channelId, result);
    }

    async GetResult(): Promise<string>
    {
        var hasValue = String.HasValue(this.args, Command.삭제.ArgCount)
        if (!hasValue)
        {
            return CommandRepository.DefaultHelpString();
        }

        var isExists = CommandRepository.IsExists(this.channelId, this.args[0])
        if (!isExists)
        {
            return "없는 커맨드입니다.";
        }

        await CommandRepository.Delete(this.channelId, this.args[0]);

        return SystemMessage.Comfirmed;
    }
}
