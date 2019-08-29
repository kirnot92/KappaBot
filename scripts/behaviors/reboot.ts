import IBehavior from "./IBehavior";
import HandlerResult from "../handlerResult";
import {Client} from "discord.js";
import * as Secret from "../../json/secret.json";
var exec = require('child_process').exec;

export default class Reboot extends IBehavior
{
    static isProgress: boolean = false;
    private isAdmin: boolean;
    private bot: Client;

    constructor(authorId: string, bot: Client)
    {
        super();
        this.bot = bot;
        this.isAdmin = Secret.AdminId == authorId;
    }
    
    public IsValid(): boolean
    {
        return this.isAdmin && Reboot.isProgress;
    }

    public async Result(): Promise<HandlerResult>
    {
        this.bot.user.setActivity("재부팅 중...", {type:"PLAYING"});
        Reboot.isProgress = true;
        exec(Secret.RebootSequence);
        return new HandlerResult("재부팅 프로세스 시작");
    }

    OnFail(): HandlerResult
    {
        return new HandlerResult("나는 나보다 약한 자의 명령은 듣지 않는다");
    }
}
