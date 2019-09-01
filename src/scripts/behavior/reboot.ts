import BehaviorResult from "./behaviorResult";
import { Client } from "discord.js";
import { IBehavior } from "./IBehavior";
import { exec } from "./behaviorFactory";
import * as Secret from "../../json/secret.json";
import * as SystemMessage from "../../json/systemMessge.json";

export class Reboot implements IBehavior
{
    static isProgress: boolean = false;
    private isAdmin: boolean;
    private bot: Client;

    constructor(authorId: string, bot: Client)
    {
        this.bot = bot;
        this.isAdmin = Secret.AdminId == authorId;
    }

    public async IsValid(): Promise<boolean>
    {
        return this.isAdmin && !Reboot.isProgress;
    }

    public async Result(): Promise<BehaviorResult>
    {
        this.bot.user.setActivity(SystemMessage.OnReboot, { type: "PLAYING" });
        Reboot.isProgress = true;
        exec(Secret.RebootSequence);
        return new BehaviorResult(SystemMessage.StartReboot);
    }

    OnFail(): BehaviorResult
    {
        var failReason = Reboot.isProgress ? SystemMessage.RebootOnProgress : SystemMessage.TooWeak;
        return new BehaviorResult(failReason);
    }
}
