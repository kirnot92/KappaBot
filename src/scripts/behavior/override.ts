import String from "../extension/stringExtension";
import FileProcedure from "../procedure/fileProcedure";
import Global from "../core/global";
import { IBehavior } from "./IBehavior";
import * as Command from "../../json/command.json";
import * as SystemMessage from "../../json/systemMessage.json";

export class Override implements IBehavior
{
    args: string[];
    channelId: string;
    isSystemCommand: boolean;

    constructor(args: string, channelId: string)
    {
        this.args = String.Slice([args], /\s|\n/, Command.덮어쓰기.ArgCount-1);
        this.channelId = channelId;
    }

    public async Run()
    {
        var result = await this.GetResult();

        Global.Client.SendMessage(this.channelId, result);
    }

    async GetResult(): Promise<string>
    {
        var hasValues = String.HasValue(this.args, Command.덮어쓰기.ArgCount);
        if (!hasValues)
        {
            // 이거 여기있는게 이상한데
            return FileProcedure.DefaultHelpString();
        }

        var isValid = await FileProcedure.IsValidCommand(this.channelId, this.args[0]);
        if (!isValid)
        {
            return "없는 커맨드입니다.";
        }

        await FileProcedure.Save(this.channelId, this.args[0], this.args[1]);

        return SystemMessage.Comfirmed;
    }
}
