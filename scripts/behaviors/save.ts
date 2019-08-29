import IBehavior from "./IBehavior";
import HandlerResult from "../handlerResult";
import FileHandler from "../fileHandler";
import String from "../StringExtension";

export default class Save extends IBehavior
{
    fileHandler: FileHandler;
    args: string[];
    channelId: string;

    constructor(fileHandler: FileHandler, args: string[], channelId: string)
    {
        super();
        this.fileHandler = fileHandler;
        this.args = args;
        this.channelId = channelId;
    }

    public IsValid(): boolean
    {
        return String.HasValue(this.args[0], this.args[1], this.args[2]);
    }

    public async Result(): Promise<HandlerResult>
    {
        return await this.fileHandler.Save(this.channelId, this.args[1], this.args.slice(2).join(' '));
    }
}