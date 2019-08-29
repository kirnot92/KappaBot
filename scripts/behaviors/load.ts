import IBehavior from "./IBehavior";
import HandlerResult from "../handlerResult";
import FileHandler from "../fileHandler";

export default class Load extends IBehavior
{
    fileHandler: FileHandler;
    command: string;
    channelId: string;

    constructor(fileHandler: FileHandler, command: string, channelId: string)
    {
        super();
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
}