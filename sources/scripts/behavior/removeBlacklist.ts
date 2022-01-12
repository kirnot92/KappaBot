import { IBehavior } from "./IBehavior";
import Global from "../core/global";
import BlacklistRepository from "../procedure/blacklistRepository";
import * as SystemMessage from "../../json/systemMessage.json";
import * as Secret from "../../json/secret.json";

export class RemoveBlacklist implements IBehavior
{
    channelId: string;
    targetId: string;
    isAdmin: boolean;

    constructor(args: string, channelId: string, authorId: string)
    {
        this.isAdmin = Secret.AdminId == authorId;
        this.channelId = channelId;
        this.targetId = args.replace(/[\\<>@#&!]/g, "");
    }

    public async Run()
    {
        if (!this.isAdmin)
        {
            await Global.Client.SendMessage(this.channelId, SystemMessage.TooWeak);
            return;
        }

        var user = Global.Client.GetUser(this.targetId);
        if (user == null) { return; }

        await BlacklistRepository.Remove(this.targetId);

        await Global.Client.SendMessage(this.channelId, SystemMessage.Comfirmed);
    }
}