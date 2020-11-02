import CommandRepository from "../procedure/commandRepository";
import String from "../extension/stringExtension";
import CommandContext from "./commandContext";
import Global from "../core/global";
import { IBehavior } from "./IBehavior";
import { LogicHalt } from "../core/assert";
import * as Command from "../../json/command.json"
import KappaScript from "../kappaScript/parser";

export class LoadDM implements IBehavior
{
    command: string;
    channelId: string;
    userId: string;

    constructor(command: string, channelId: string, userId: string)
    {
        this.command = command;
        this.channelId = channelId;
        this.userId = userId;

    }

    public async Run()  // copied from getListDM.ts
    {
        var result = await this.GetResult();
        var message = KappaScript.Run(result.Message);

        Global.Client.SendDirectMessageWithOptions(this.userId, message, result.Options);
    }


    async GetResult(): Promise<CommandContext>  // copied from load.ts
    {
        var isExists = await CommandRepository.IsExists(this.channelId, this.command);
        if (isExists)
        {
            // 있는 명령어라면 바로 로드함
            return await CommandRepository.Load(this.channelId, this.command);
        }

        // 없는 명령어면 비슷한 걸 찾아본다
        var similar = await CommandRepository.FindSimilar(this.channelId, this.command);
        if (similar == null)
        {
            LogicHalt.CommandNotFound();
        }

        // 비슷한게 있으면 그걸 리턴함
        // 뭔 메세지로 보정했는지 prefix를 달아준다
        var prefixMessage = "[$"+ similar +"]\n";
        var context = await CommandRepository.Load(this.channelId, similar);
        context.Message = prefixMessage + context.Message;
        return context;
    }
}