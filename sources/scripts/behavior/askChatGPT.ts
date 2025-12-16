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
        //messageHistory.push({"role":"user", content: `${author.username}:${command}`});
        this.author = author;
        this.channelId = channelId;
        this.messageHistory = messageHistory;
    }

    public async Run()
    {
        const fileName = `user_${this.author.id}.memory.json`;
        let memoryDataStr = "";
        if (await CommandRepository.IsExists(Global.Constants.MemoryChannelId, fileName))
        {
            memoryDataStr = (await CommandRepository.Load(Global.Constants.MemoryChannelId, fileName)).Message;
        }

        const msgs = await Global.Client.SendMessage(this.channelId, "잠시만 기다려주세요! 생각 중이에요!");

        let instructions = (await this.GetPrompt()).Message;
        instructions += "input은 최근 대화를 포함하고 있습니다. 마지막 input이 사용자의 질문이며, 나머지는 이전 기록임을 참고하여 답변을 작성하세요.\n";
        if (memoryDataStr != "")
        {
            instructions += "다음은 사용자에 대한 메모리 데이터입니다. 이를 활용하여 답변을 작성하세요.";
            const memoryData =  JSON.parse(memoryDataStr) as UserMemory;
            instructions += this.ConvertUserMemoryToMD(memoryData);
        }

        const response = await Global.ChatGPT.Request(instructions, this.messageHistory);
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

    private ConvertUserMemoryToMD(data: UserMemory): string
    {
        let r = "";
        r += `\n# Memory (updated: ${data.updated_at})\n`
        r += this.ConvertSectionToMD("Facts", data.items.facts);
        r += this.ConvertSectionToMD("Constraints", data.items.constraints);
        r += this.ConvertSectionToMD("Preferences", data.items.preferences);
        r += this.ConvertSectionToMD("Projects", data.items.projects);
        return r;
    }

    private ConvertSectionToMD(sectionName: string, section: UserMemoryItem[]): string
    {
        let r = "";
        if (section.length > 0)
        {
            r += `\n## ${sectionName}\n`;
            for (const item of section)
            {
                r += `- [${item.confidence} Confidence] ${item.text}\n`;
            }
        }
        return r;
    }
}
