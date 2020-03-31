import String from "../extension/stringExtension";
import FileProcedure from "../procedure/fileProcedure";
import Global from "../core/global";
import { IBehavior } from "./IBehavior";
import * as Command from "../../json/command.json";
import * as SystemMessage from "../../json/systemMessage.json";

export class Register implements IBehavior
{
    args: string[];
    channelId: string;
    isSystemCommand: boolean;

    constructor(args: string, channelId: string)
    {
        this.args = String.Slice([args], /\s|\n/, Command.등록.ArgCount-1);
        this.channelId = channelId;
    }

    public async Run()
    {
        var result = await this.GetResult();

        Global.Client.SendMessage(this.channelId, result);
    }

    async GetResult(): Promise<string>
    {
        var hasValues = String.HasValue(this.args, Command.등록.ArgCount);
        if (!hasValues)
        {
            return FileProcedure.DefaultHelpString();
        }

        var isAlreadyRegistered = await FileProcedure.IsValidCommand(this.channelId, this.args[0]);
        if (isAlreadyRegistered)
        {
            return "이미 등록된 명령어입니다.\n한 줄을 추가하려면 [추가] 명령어를 사용해주세요.";
        }

        if (FileProcedure.IsSystemCommand(this.args[0]))
        {
            return SystemMessage.IsSystemMessage;
        }

        await FileProcedure.AddLine(this.channelId, this.args[0], this.args[1]);

        return SystemMessage.Comfirmed;
    }
}
