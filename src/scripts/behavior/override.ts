import String from "../extension/stringExtension";
import CommandRepository from "../procedure/commandRepository";
import Global from "../core/global";
import Assert from "../core/assert";
import { IBehavior } from "./IBehavior";
import * as Command from "../../json/command.json";
import * as SystemMessage from "../../json/systemMessage.json";

export class Override implements IBehavior
{
    args: string[];
    channelId: string;
    isSystemCommand: boolean;

    constructor(args: string, channelId: string)
    {
        this.args = String.Slice([args], /\s|\n/, Command.덮어쓰기.ArgCount-1);
        this.channelId = channelId;

        var hasValue = String.HasValue(this.args, Command.덮어쓰기.ArgCount);
        Assert.ShowDefaultMessageIfFalse(hasValue);
    }

    public async Run()
    {
        var result = await this.GetResult();

        Global.Client.SendMessage(this.channelId, result);
    }

    async GetResult(): Promise<string>
    {
        var isExists = await CommandRepository.IsExists(this.channelId, this.args[0]);
        if (!isExists)
        {
            return "없는 커맨드입니다.";
        }

        await CommandRepository.Save(this.channelId, this.args[0], this.args[1]);

        return SystemMessage.Comfirmed;
    }
}
