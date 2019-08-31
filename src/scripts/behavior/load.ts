import HandlerResult from "../handlerResult";
import FileHandler from "../fileHandler";
import { IBehavior } from "./IBehavior";

export class Load implements IBehavior
{
    fileHandler: FileHandler;
    command: string;
    channelId: string;
    constructor(fileHandler: FileHandler, command: string, channelId: string)
    {
        this.fileHandler = fileHandler;
        this.command = command;
        this.channelId = channelId;
    }

    IsValid(): boolean
    {
        return true;
    }

    async Result(): Promise<HandlerResult>
    {
        return await this.fileHandler.Load(this.channelId, this.command);
    }

    public OnFail(): HandlerResult
    {
        return this.fileHandler.DefaultHelp();
    }
}
