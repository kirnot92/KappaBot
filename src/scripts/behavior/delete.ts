import String from "../extension/stringExtension";
import FileProcedure from "../procedure/fileProcedure";
import Global from "../core/global";
import { IBehavior } from "./IBehavior";
import * as Command from "../../json/command.json";
import * as SystemMessage from "../../json/systemMessage.json";

export class Delete implements IBehavior
{
    args: string[];
    channelId: string;

    constructor(args: string, channelId: string)
    {
        this.args = String.Slice([args], /\s|\n/, Command.삭제.ArgCount-1);
        this.channelId = channelId;
    }

    public async Run()
    {
        var result = await this.GetResult();

        Global.Client.SendMessage(this.channelId, result);
    }

    async GetResult(): Promise<string>
    {
        var hasValue = String.HasValue(this.args, Command.삭제.ArgCount)
        if (!hasValue)
        {
            return FileProcedure.DefaultHelpString();
        }

        var isValid = FileProcedure.IsValidCommand(this.channelId, this.args[0])
        if (!isValid)
        {
            return "없는 커맨드입니다.";
        }

        await FileProcedure.Delete(this.channelId, this.args[0]);

        return SystemMessage.Comfirmed;
    }
}
