import Global from "../core/global";
import { IBehavior } from "./IBehavior";
import EmojiRoleRepository from "../procedure/emojiRoleRepository";
import * as SystemMessage from "../../json/systemMessage.json";
import * as Secret from "../../json/secret.json";

export class RemoveRole implements IBehavior
{
    guildId: string;
    channelId: string;
    emoji: string;

    constructor(guildId: string, channelId: string, args: string)
    {
        this.guildId = guildId;
        this.channelId = channelId;
        
        var emojiRaw = args[0];
        var isCustomEmoji = (new RegExp("^<\\:.+\\:\\d+>")).exec(emojiRaw) != null;

        if (isCustomEmoji)
        {
            var matched = emojiRaw.match(":(\\d+)>");
            if (matched != null)
            {
                this.emoji = matched[1];
            }
            else
            {
                this.emoji = emojiRaw;
            }
        }
        else
        {
            this.emoji = emojiRaw;
        }
    }

    public async Run()
    {
        var result = await this.GetResult();

        await Global.Client.SendMessage(this.channelId, result);
    }
    
    async GetResult(): Promise<string>
    {
        if (!await EmojiRoleRepository.HasRole(this.guildId, this.emoji))
        {
            return "no role registered";
        }

        await EmojiRoleRepository.Remove(this.guildId, this.emoji);
        return SystemMessage.Comfirmed;
    }
}