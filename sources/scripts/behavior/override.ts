import String from "../extension/stringExtension";
import CommandRepository from "../procedure/commandRepository";
import Global from "../core/global";
import { IBehavior } from "./IBehavior";
import { LogicHalt } from "../core/assert";
import * as Command from "../../json/command.json";
import * as SystemMessage from "../../json/systemMessage.json";
import { MessageAttachment } from "discord.js";
import MediaRepository from "../procedure/mediaRepository";

export class Override implements IBehavior
{
    args: string[];
    channelId: string;
    isSystemCommand: boolean;
    attachments: MessageAttachment[];

    constructor(args: string, attachments: MessageAttachment[], channelId: string)
    {
        this.args = String.Slice([args], /\s|\n/, Command.덮어쓰기.ArgCount-1);
        this.channelId = channelId;
        this.attachments = attachments;

        var hasValue = String.HasValue(this.args, Command.덮어쓰기.ArgCount);
        if (!hasValue)
        {
            LogicHalt.InvaildUsage(Command.덮어쓰기.Key);
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

        var isExists = await CommandRepository.IsExists(this.channelId, command);
        if (!isExists)
        {
            return "없는 커맨드입니다.";
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
