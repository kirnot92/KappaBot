import CommandRepository from "../procedure/commandRepository";
import String from "../extension/stringExtension";
import CommandContext from "./commandContext";
import Global from "../core/global";
import { IBehavior } from "./IBehavior";
import { LogicHalt } from "../core/assert";
import * as Command from "../../json/command.json"


export class Search implements IBehavior
{
    command: string;
    channelId: string;

    constructor(command: string, channelId: string)
    {
        this.command = command;
        this.channelId = channelId;

        var hasValue = String.HasValue([this.command], Command.검색.ArgCount);
        LogicHalt.ShowDefaultMessageIfFalse(hasValue);
    }

    public async Run()
    {
        var result = await this.GetResult();

        await Global.Client.SendMessage(this.channelId, result.Message, result.Options);
    }

    async GetResult(): Promise<CommandContext>
    {
        // 글자를 모자라게 적은 경우 substring으로 판단
        var substringSearchResult = await CommandRepository.FindCommandBySubString(this.channelId, this.command);
        if (substringSearchResult.length > 0)
        {
            var str = "[" + this.command + "] 단어를 포함하는 명령어 목록입니다.\n";
            str += substringSearchResult.join(", ");
            return new CommandContext(str);
        }

        // 자음, 모음을 잘못 쓴 경우 단어 거리를 판단
        var similiaritySearchResult = await CommandRepository.FindCommandBySimiliarity(this.channelId, this.command);
        if (similiaritySearchResult.length > 0)
        {
            var str = "[" + this.command + "] 에 발음이 가까운 명령어 목록입니다.\n";
            str += similiaritySearchResult.join(", ");
            return new CommandContext(str);
        }

        return new CommandContext("비슷한 명령어를 찾을 수 없습니다. 목록을 확인해보세요.");
    }
}
