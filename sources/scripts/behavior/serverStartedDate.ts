import Global from "../core/global";
import { IBehavior } from "./IBehavior";

export class ServerStartedDate implements IBehavior
{
    private channelId: string;

    constructor(channelId: string)
    {
        this.channelId = channelId;
    }

    public async Run()
    {
        var date = Global.System.GetServerStartedDate();

        await Global.Client.SendMessage(this.channelId, date);
    }
}