import String from "../extension/stringExtension";
import FileProcedure from "../procedure/fileProcedure";
import Global from "../core/global";
import { IBehavior } from "./IBehavior";
import * as Command from "../../json/command.json";
import * as SystemMessage from "../../json/systemMessage.json";

export class RemoveLastLine implements IBehavior
{
    args: string[];
    channelId: string;
    isSystemCommand: boolean;

    constructor(args: string, channelId: string)
    {
        this.args = String.Slice([args], /\s|\n/, Command.마지막줄삭제.ArgCount-1);
        this.channelId = channelId;
    }

    public async Run()
    {
        var result = await this.GetResult();

        await Global.Client.SendMessage(this.channelId, result);
    }

    async GetResult(): Promise<string>
    {
        if (String.HasValue(this.args, Command.마지막줄삭제.ArgCount))
        {
            return FileProcedure.DefaultHelpString();
        }

        var isValid = await FileProcedure.IsValidCommand(this.channelId, this.args[0]);
        if (!isValid)
        {
            return "없는 커맨드입니다.";
        }

        await FileProcedure.RemoveLastLine(this.channelId, this.args[0]);

        return SystemMessage.Comfirmed;
    }
}
