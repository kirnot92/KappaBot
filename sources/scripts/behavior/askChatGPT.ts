import CommandRepository from "../procedure/commandRepository";
import CommandContext from "./commandContext";
import Global from "../core/global";
import { IBehavior } from "./IBehavior";

export class AskChatGPT implements IBehavior
{
    command: string;
    channelId: string;

    constructor(command: string, channelId: string)
    {
        this.command = command;
        this.channelId = channelId;
    }

    public async Run()
    {
        var msgs = await Global.Client.SendMessage(this.channelId, "잠시만 기다려주세요! 생각 중이에요!");

        var instructions = (await this.GetPrompt()).Message;
        var response = await Global.ChatGPT.Request(this.command, instructions);
        msgs[0].edit(response);
    }

    async GetPrompt(): Promise<CommandContext>
    {
        var isExists = await CommandRepository.IsExists(this.channelId, "readme.md");
        if (isExists)
        {
            // 있는 명령어라면 바로 로드함
            return await CommandRepository.Load(this.channelId, "readme.md");
        }

        return new CommandContext("");
    }
}
