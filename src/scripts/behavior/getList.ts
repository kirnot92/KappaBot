import FileProcedure from "../procedure/fileProcedure";
import Global from "../../core/global";
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

        Global.Client.SendMessage(this.channelId, result);
    }

    async GetResult(): Promise<string>
    {
        var fileList = await FileProcedure.GetList(this.channelId);;
        if (fileList == null)
        {
            return SystemMessage.NothingSaved;
        }

        return fileList;
    }
}
