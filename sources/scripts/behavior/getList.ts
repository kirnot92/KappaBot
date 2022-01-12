import CommandRepository from "../procedure/commandRepository";
import Global from "../core/global";
import { IBehavior } from "./IBehavior";
import * as SystemMessage from "../../json/systemMessage.json";


export class GetList implements IBehavior
{
    channelId: string;

    constructor(channelId: string)
    {
        this.channelId = channelId;
    }

    public async Run()
    {
        var result = await this.GetResult();

        await Global.Client.SendMessage(this.channelId, result);
    }

    async GetResult(): Promise<string>
    {
        var fileList = await CommandRepository.GetList(this.channelId);
        if (fileList == null)
        {
            return SystemMessage.NothingSaved;
        }

        return fileList;
    }
}
