import String from "../extension/stringExtension";
import CommandRepository from "../procedure/commandRepository";
import Global from "../core/global";
import { IBehavior } from "./IBehavior";
import { LogicHalt } from "../core/assert";
import * as Command from "../../json/command.json";
import * as SystemMessage from "../../json/systemMessage.json";
import { MessageAttachment } from "discord.js";
import MediaRepository from "../procedure/mediaRepository";

export class Register implements IBehavior
{
    args: string[];
    channelId: string;
    isSystemCommand: boolean;
    attachments: MessageAttachment[];

    constructor(args: string, attachments: MessageAttachment[], channelId: string)
    {
        this.args = String.Slice([args], /\s|\n/, Command.등록.ArgCount-1);
        this.channelId = channelId;
        this.attachments = attachments;

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
        var command = this.args[0]
        var content = this.args[1];

        var isAlreadyRegistered = await CommandRepository.IsExists(this.channelId, command);
        if (isAlreadyRegistered)
        {
            return "이미 등록된 명령어입니다.\n"
                 + "한 줄을 추가하려면 [추가] 명령어를 사용해주세요.\n"
                 + "내용을 새로 작성하려면 [덮어쓰기] 명령어를 사용해주세요.";
        }

        if (CommandRepository.IsSystemCommand(command))
        {
            return SystemMessage.IsSystemMessage;
        }
        
        var urls = MediaRepository.GetUrlsFromMediaAttachments(this.attachments);
        var result = MediaRepository.FindMediaUrls(content);
        result.urls.forEach(url => urls.push(url));

        await CommandRepository.Save(this.channelId, command, result.others, urls);
        await MediaRepository.Save(this.channelId, command, urls);

        return SystemMessage.Comfirmed;
    }
}
