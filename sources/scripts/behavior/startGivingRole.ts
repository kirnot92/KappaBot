import Global from "../core/global";
import EmojiRoleRepository from "../procedure/emojiRoleRepository";
import LatestEmojiRoleMessage from "../procedure/LatestEmojiRoleMessage";
import { IBehavior } from "./IBehavior";

export class StartGivingRole implements IBehavior
{
    guildId: string;
    channelId: string;

    constructor(guildId: string, channelId: string)
    {
        this.guildId = guildId;
        this.channelId = channelId;
    }

    public async Run()
    {
        var emojiRoles = await EmojiRoleRepository.GetRoles(this.guildId);
        var guild = Global.Client.GetGuild(this.guildId);
        if (guild == null)
        {
            return;
        }
        
        var str = ""
        for (var elem of emojiRoles)
        {
            var emoji = guild.emojis.cache.find(e => e.name == elem.emoji);
            if (emoji == null)
            {
                str += "> " + elem.emoji + " -> " + elem.role + "\n";
            }
            else
            {
                str += "> <:" + emoji.name + ":" + emoji.id + "> -> " + elem.role + "\n";
            }
        }

        var msgs = await Global.Client.SendMessage(this.channelId, str);
        var msg = msgs[0];
        
        for (var elem of emojiRoles)
        {
            var emoji = guild.emojis.cache.find(e => e.name == elem.emoji);
            if (emoji == null)
            {
                await msg.react(elem.emoji);
            }
            else
            {
                await msg.react(emoji);
            }
        }

        LatestEmojiRoleMessage.Regist(this.guildId, this.channelId, msg.id);
    }
}
