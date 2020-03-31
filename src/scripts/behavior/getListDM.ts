import CommandRepository from "../procedure/commandRepository";
import Global from "../core/global";
import { IBehavior } from "./IBehavior";
import * as SystemMessage from "../../json/systemMessage.json";

export class GetListDM implements IBehavior
{
    channelId: string;
    userId: string;

    constructor(channelId: string, userId: string)
    {
        this.channelId = channelId;
        this.userId = userId;
    }

    public async Run()
    {
        var result = await this.GetResult();

        Global.Client.SendDirectMessage(this.userId, result);
    }

    async GetResult(): Promise<string>
    {      
        var fileList = await CommandRepository.GetList(this.channelId);;
        if (fileList == null)
        {
            return SystemMessage.NothingSaved;
        }

        return "<#" + this.channelId + ">에 저장된 명령어 목록입니다.\n"+ fileList;
    }
}
