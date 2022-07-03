import String from "../extension/stringExtension";
import CommandRepository from "../procedure/commandRepository";
import Global from "../core/global";
import { IBehavior } from "./IBehavior";
import { LogicHalt } from "../core/assert";
import * as Command from "../../json/command.json";
import * as SystemMessage from "../../json/systemMessage.json";
import { MessageAttachment } from "discord.js";
import MediaRepository from "../procedure/mediaRepository";

export class SaveHelper
{
    public Command: string;
    content: string;
    channelId: string;
    isSystemCommand: boolean;
    attachments: MessageAttachment[];

    constructor(args: string,
        attachments: MessageAttachment[], 
        channelId: string,
        argCount: number,
        key: string)
    {
        let splited = String.Slice([args], /\s|\n/, argCount-1);

        this.Command = splited[0]
        this.content = splited[1] === undefined ? "" : splited[1];

        this.channelId = channelId;
        this.attachments = attachments;

        var hasValue = String.HasValue(splited, argCount) || attachments.length != 0;
        if (!hasValue)
        {
            LogicHalt.InvaildUsage(key);
        }
    }

    public async Save()
    {
        var urls = MediaRepository.GetUrlsFromMediaAttachments(this.attachments);
        var result = MediaRepository.FindMediaUrls(this.content);
        result.urls.forEach(url => urls.push(url));

        await CommandRepository.Save(this.channelId, this.Command, result.others, urls);
        await MediaRepository.Save(this.channelId, this.Command, urls);
    }
}
