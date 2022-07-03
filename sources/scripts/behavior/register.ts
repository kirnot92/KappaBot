import CommandRepository from "../procedure/commandRepository";
import Global from "../core/global";
import { IBehavior } from "./IBehavior";
import * as Command from "../../json/command.json";
import * as SystemMessage from "../../json/systemMessage.json";
import { MessageAttachment } from "discord.js";
import { SaveHelper } from "./saveHelper";

export class Register implements IBehavior
{
    channelId: string;
    saveHelper: SaveHelper;

    constructor(args: string, attachments: MessageAttachment[], channelId: string)
    {
        this.channelId = channelId;
        this.saveHelper = new SaveHelper(args, attachments, channelId, Command.등록.ArgCount, Command.등록.Key)
    }

    public async Run()
    {
        var result = await this.GetResult();

        await Global.Client.SendMessage(this.channelId, result);
    }

    async GetResult(): Promise<string>
    {
        var command = this.saveHelper.Command;

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
        
        await this.saveHelper.Save();

        return SystemMessage.Comfirmed;
    }
}
