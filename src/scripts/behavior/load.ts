import FileProcedure from "../procedure/fileProcedure";
import String from "../extension/stringExtension";
import CommandContext from "./commandContext";
import Global from "../core/global";
import { IBehavior } from "./IBehavior";
import * as Command from "../../json/command.json"

export class Load implements IBehavior
{
    command: string;
    channelId: string;

    constructor(command: string, channelId: string)
    {
        this.command = command;
        this.channelId = channelId;
    }

    public async Run()
    {
        var result = await this.GetResult();

        Global.Client.SendMessage(this.channelId, result.Message, result.Options);
    }

    async GetResult(): Promise<CommandContext>
    {
        var hasValue = String.HasValue([this.command], Command.로드.ArgCount);
        if (!hasValue)
        {
            return new CommandContext(FileProcedure.DefaultHelpString());
        }

        var isValid = await FileProcedure.IsValidCommand(this.channelId, this.command);
        if (isValid)
        {
            // 있는 명령어라면 바로 로드함
            return await FileProcedure.Load(this.channelId, this.command);
        }

        // 없는 명령어면 비슷한 걸 찾아본다
        var similar = await FileProcedure.FindSimilarCommand(this.channelId, this.command);
        if (similar == null)
        {
            // 없으면 기본 명령어
            return new CommandContext(FileProcedure.DefaultHelpString());
        }

        // 비슷한게 있으면 그걸 리턴함
        // 뭔 메세지로 보정했는지 prefix를 달아준다
        var prefixMessage = "[$"+ similar +"]\n";
        var context = await FileProcedure.Load(this.channelId, similar);
        context.Message = prefixMessage + context.Message;
        return context;
    }
}
