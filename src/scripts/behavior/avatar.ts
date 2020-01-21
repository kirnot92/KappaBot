import BehaviorResult from "./behaviorResult";
import String from "../extension/stringExtension";
import FileProcedure from "../procedure/fileProcedure";
import { IBehavior } from "./IBehavior";
import * as Command from "../../json/command.json";
import { Client } from "discord.js";

export class Avatar implements IBehavior
{
    args: string[];
    channelId: string;
    bot: Client;
    userTag: string;

    // https://discordjs.guide/miscellaneous/parsing-mention-arguments.html#implementation
    constructor(args: string[], channelId: string, bot: Client)
    {
        this.args = args;
        this.channelId = channelId;
        this.bot = bot;
    }

    async IsValid(): Promise<boolean>
    {
        if (!String.HasValue(this.args, Command.아바타.ArgCount))
        {
            return false;
        }

        var userTagStr = this.args[1];
        if (!(userTagStr.startsWith("<@") && userTagStr.endsWith(">")))
        {
            return false;
        }

        this.userTag = userTagStr.slice(2, -1);

        return true;
    }

    async Result(): Promise<BehaviorResult>
    {
        var user = this.bot.users.get(this.userTag);
        var userName = user.username;
        var avatarURL = this.RemoveAfterQuestionMark(user.displayAvatarURL);

        return new BehaviorResult(userName + "의 프로필", {files: [avatarURL]});
    }

    public OnFail(): BehaviorResult
    {
        return FileProcedure.DefaultHelp();
    }

    RemoveAfterQuestionMark(url: string): string
    {
        var index = String.IndexOf(url, "?");
        if (index != -1)
        {
            return url.substr(0, index);
        }

        return url;
    }
}
