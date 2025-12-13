import CommandRepository from "../procedure/commandRepository";
import CommandContext from "./commandContext";
import Global from "../core/global";
import { IBehavior } from "./IBehavior";
import { MessageContext } from "../type/types";
import { PartialUser, User } from "discord.js";

export class AskChatGPT implements IBehavior
{
    command: string;
    channelId: string;
    messageHistory: MessageContext[];

    constructor(command: string, author: User|PartialUser, channelId: string, messageHistory: MessageContext[])
    {
        //messageHistory.push({"role":"user", content: `${author.username}:${command}`});
        this.channelId = channelId;
        this.messageHistory = messageHistory;
    }

    public async Run()
    {
        var msgs = await Global.Client.SendMessage(this.channelId, "잠시만 기다려주세요! 생각 중이에요!");

        var instructions = (await this.GetPrompt()).Message + "input은 최근 대화를 포함하고 있습니다. 마지막 input이 사용자의 질문이며, 나머지는 이전 기록임을 참고하여 답변을 작성하세요.";
        var response = await Global.ChatGPT.Request(instructions, this.messageHistory);
        if (response.length < 2000)
        {
            msgs[0].edit(response);
        }
        else
        {
            msgs[0].delete();
            await Global.Client.SendMessage(this.channelId, response);
        }
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
