import CommandRepository from "../procedure/commandRepository";
import String from "../extension/stringExtension";
import CommandContext from "./commandContext";
import Global from "../core/global";
import { IBehavior } from "./IBehavior";
import { LogicHalt } from "../core/assert";
import * as Command from "../../json/command.json"
import KappaScript from "../kappaScript/parser";

export class LoadToDM implements IBehavior
{
    command: string;
    channelId: string;
    userId: string;

    constructor(command: string, channelId: string, userId: string)
    {
        this.command = command;
        this.channelId = channelId;
        this.userId = userId;

        var hasValue = String.HasValue([this.command], Command.내용디엠으로.ArgCount);
        if (!hasValue)
        {
            LogicHalt.InvaildUsage(Command.내용디엠으로.Key);
        }
    }

    public async Run()
    {
        var result = await this.GetResult();
        var message = KappaScript.Run(result.Message);

        Global.Client.SendDirectMessage(this.userId, message, result.Options);
    }


    async GetResult(): Promise<CommandContext>
    {
        var isExists = await CommandRepository.IsExists(this.channelId, this.command);
        if (isExists)
        {
            // 있는 명령어라면 바로 로드함
            return await CommandRepository.Load(this.channelId, this.command);
        }

        // 없는 명령어면 비슷한 걸 찾아본다
        var similar = await CommandRepository.FindSimilar(this.channelId, this.command);
        if (similar == null)
        {
            // 시스템 명령어는 입력했지만 검색어를 찾지 못하는 경우이므로, LogicHalt.CommandNotFound()보다는 search.ts와 같은 메시지를 DM 보내도록 처리.  
            return new CommandContext("비슷한 명령어를 찾을 수 없습니다. 목록을 확인해보세요")
        }

        // 비슷한게 있으면 그걸 리턴함
        // 뭔 메세지로 보정했는지 prefix를 달아준다
        var prefixMessage = "[$"+ similar +"]\n";
        var context = await CommandRepository.Load(this.channelId, similar);
        context.Message = prefixMessage + context.Message;
        return context;
    }
}