import Global from "../core/global";
import { IBehavior } from "./IBehavior";
import * as Command from "../../json/command.json"
import String from "../extension/stringExtension";
import EmojiRoleRepository from "../procedure/emojiRoleRepository";
import * as SystemMessage from "../../json/systemMessage.json";

export class AddRole implements IBehavior
{
    guildId: string;
    channelId: string;
    emoji: string;
    role: string;

    constructor(guildId: string, channelId: string, args: string)
    {
        this.guildId = guildId;
        this.channelId = channelId;
        var splited =  String.Slice([args], /\s|\n/, Command.역할추가.ArgCount-1);
        
        var emojiRaw = splited[0];
        var isCustomEmoji = (new RegExp("^<\\:.+\\:\\d+>")).exec(emojiRaw) != null;

        this.emoji = isCustomEmoji
            ? emojiRaw.match("<:(.+):")[1]
            : emojiRaw;
        this.role = splited[1];
    }

    public async Run()
    {
        var result = await this.GetResult();

        await Global.Client.SendMessage(this.channelId, result);
    }

    async GetResult(): Promise<string>
    {
        if (await EmojiRoleRepository.HasRole(this.guildId, this.emoji))
        {
            return "already used emoji";
        }

        var guild = Global.Client.GetGuild(this.guildId);
        var role = guild.roles.cache.find(r => r.name == this.role);
        if (role == null)
        {
            return "role not founded";
        }

        await EmojiRoleRepository.Add(this.guildId, this.emoji, this.role);
        return SystemMessage.Comfirmed;
    }
}
