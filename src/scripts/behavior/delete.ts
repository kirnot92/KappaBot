import String from "../extension/stringExtension";
import CommandRepository from "../procedure/commandRepository";
import Global from "../core/global";
import { IBehavior } from "./IBehavior";
import { LogicHalt } from "../core/assert";
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

        var hasValue = String.HasValue(this.args, Command.삭제.ArgCount);
        if (!hasValue)
        {
            LogicHalt.InvaildUsage(Command.삭제.Key);
        }
    }

    public async Run()
    {
        var result = await this.GetResult();

        await Global.Client.SendMessage(this.channelId, result);
    }

    async GetResult(): Promise<string>
    {
        var isExists = await CommandRepository.IsExists(this.channelId, this.args[0])
        if (!isExists)
        {
            return this.args[0] + "은 없는 명령어입니다."
                + "명령어를 찾으시려면 [검색] 명령어를 사용해주세요.";
        }

        await CommandRepository.Delete(this.channelId, this.args[0]);

        return SystemMessage.Comfirmed;
    }
}
