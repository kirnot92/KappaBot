import BehaviorResult from "./behaviorResult";
import { Client } from "discord.js";
import { IBehavior } from "./IBehavior";
import { exec } from "./behaviorFactory";
import * as Secret from "../../json/secret.json";

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
        this.bot.user.setActivity("재부팅", { type: "PLAYING" });
        Reboot.isProgress = true;
        exec(Secret.RebootSequence);
        return new BehaviorResult("재부팅 프로세스 시작");
    }

    OnFail(): BehaviorResult
    {
        return Reboot.isProgress ? new BehaviorResult("현재 재부팅 진행중입니다") : new BehaviorResult("나는 나보다 약한 자의 명령은 듣지 않는다");
    }
}
