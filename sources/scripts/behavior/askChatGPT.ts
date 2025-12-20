import CommandRepository from "../procedure/commandRepository";
import CommandContext from "./commandContext";
import Global from "../core/global";
import { IBehavior } from "./IBehavior";
import { MessageContext, UserMemory, UserMemoryItem } from "../type/types";
import { PartialUser, User } from "discord.js";

export class AskChatGPT implements IBehavior
{
    command: string;
    channelId: string;
    messageHistory: MessageContext[];
    author: User|PartialUser;

    constructor(command: string, author: User|PartialUser, channelId: string, messageHistory: MessageContext[])
    {
        this.author = author;
        this.channelId = channelId;
        this.messageHistory = messageHistory;
    }

    public async Run()
    {
        const msgs = await Global.Client.SendMessage(this.channelId, "잠시만 기다려주세요! 생각 중이에요!");

        let instructions = (await this.GetPrompt()).Message;
        instructions += "input은 최근 대화를 포함하고 있습니다. 마지막 input이 사용자의 질문이며, 나머지는 이전 기록임을 참고하여 답변을 작성하세요.\n";
        instructions += "input은 각 유저의 식별자를 포함하여 JSON 형식으로 기술됩니다.\n";

        const response = await Global.ChatGPT.Request(instructions, "medium", this.messageHistory);
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
        const isLocalReadMeExists =  await CommandRepository.IsExists(this.channelId, Global.Constants.ReadMeFileName);
        if (isLocalReadMeExists)
        {
            return await CommandRepository.Load(this.channelId, Global.Constants.ReadMeFileName);
        }

        const isGlobalReadMeExists = await CommandRepository.IsExists(Global.Constants.MemoryChannelId, Global.Constants.ReadMeFileName);
        if (isGlobalReadMeExists)
        {
            // 있는 명령어라면 바로 로드함
            return await CommandRepository.Load(Global.Constants.MemoryChannelId, Global.Constants.ReadMeFileName);
        }

        return new CommandContext("");
    }
}
