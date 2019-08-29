import IBehavior from "./IBehavior";
import HandlerResult from "../handlerResult";
import FileHandler from "../fileHandler";

export default class GetList extends IBehavior
{
    fileHandler: FileHandler;
    channelId: string;

    constructor(fileHandler: FileHandler, channelId: string)
    {
        super();
        this.fileHandler = fileHandler;
        this.channelId = channelId;
    }

    IsValid(): boolean
    {
        return true;
    }
    
    async Result(): Promise<HandlerResult>
    {
        return await this.fileHandler.GetList(this.channelId)
    }
}