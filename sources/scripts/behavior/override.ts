import String from "../extension/stringExtension";
import CommandRepository from "../procedure/commandRepository";
import Global from "../core/global";
import { IBehavior } from "./IBehavior";
import { LogicHalt } from "../core/assert";
import * as Command from "../../json/command.json";
import * as SystemMessage from "../../json/systemMessage.json";
import { MessageAttachment } from "discord.js";

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
        var isExists = await CommandRepository.IsExists(this.channelId, this.args[0]);
        if (!isExists)
        {
            return "없는 커맨드입니다.";
        }

        if (CommandRepository.IsSystemCommand(this.args[0]))
        {
            return SystemMessage.IsSystemMessage;
        }

        var urls = new Array<string>();
        for (var attachment of this.attachments)
        {
            // 필요하다면 attachment.size 검사 (나중에)
            urls.push(attachment.url);
        }

        await CommandRepository.Save(this.channelId, this.args[0], this.args[1], urls);

        return SystemMessage.Comfirmed;
    }
}
