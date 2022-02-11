import Global from "../core/global";
import { IBehavior } from "./IBehavior";
import * as Command from "../../json/command.json"
import Prefix from "../procedure/prefix";

export class Help implements IBehavior
{
    channelId: string;

    constructor(channelId: string)
    {
        this.channelId = channelId;
    }

    public async Run()
    {
        await Global.Client.SendMessage(this.channelId, this.GetDefaultHelp());
    }

    GetDefaultHelp(): string
    {
        var content = "기본 명령어\n";
        var commands = Command as any;
        for (var key in Command)
        {
            if (commands[key].IsHidden) { continue; }
            content = content + Prefix.First + commands[key].Usage + "\n";
        }
        return content;
    }
}
