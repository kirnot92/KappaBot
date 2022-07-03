import CommandRepository from "../procedure/commandRepository";
import Global from "../core/global";
import { IBehavior } from "./IBehavior";
import * as Command from "../../json/command.json";
import * as SystemMessage from "../../json/systemMessage.json";
import { MessageAttachment } from "discord.js";
import { SaveHelper } from "./saveHelper";

export class Override implements IBehavior
{
    channelId: string;
    attachments: MessageAttachment[];

    saveHelper: SaveHelper;

    constructor(args: string, attachments: MessageAttachment[], channelId: string)
    {
        this.saveHelper = new SaveHelper(args, attachments, channelId, Command.덮어쓰기.ArgCount, Command.덮어쓰기.Key)
    }

    public async Run()
    {
        var result = await this.GetResult();

        await Global.Client.SendMessage(this.channelId, result);
    }

    async GetResult(): Promise<string>
    {
        var command = this.saveHelper.Command;

        var isExists = await CommandRepository.IsExists(this.channelId, command);
        if (!isExists)
        {
            return "없는 커맨드입니다.";
        }

        if (CommandRepository.IsSystemCommand(command))
        {
            return SystemMessage.IsSystemMessage;
        }

        await this.saveHelper.Save();

        return SystemMessage.Comfirmed;
    }
}
