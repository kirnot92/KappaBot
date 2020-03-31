import { IBehavior } from "./IBehavior";
import * as Secret from "../../json/secret.json";
import * as SystemMessage from "../../json/systemMessage.json";
import Global from "../core/global";

export class Reboot implements IBehavior
{
    static isProgress: boolean = false;
    private isAdmin: boolean;
    private channelId: string;

    constructor(authorId: string, channelId: string)
    {
        this.isAdmin = Secret.AdminId == authorId;
        this.channelId = channelId;
    }

    public async Run()
    {
        var result = await this.GetResult();

        Global.Client.SendMessage(this.channelId, result);
    }

    async GetResult(): Promise<string>
    {
        if (Global.System.IsRebootProgress())
        {
            return SystemMessage.RebootOnProgress;
        }

        if (!this.isAdmin)
        {
            return SystemMessage.TooWeak;
        }

        Global.Client.SetActivity(SystemMessage.OnReboot);
        Global.System.Reboot();

        return SystemMessage.StartReboot;
    }
}
