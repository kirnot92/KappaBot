
import HandlerResult from "./handlerResult";
import String from './stringExtension';
import FileHandler from "./fileHandler";
import * as Secret from "../json/secret.json";

export default class BehaviorFactory
{
    static fileHandler: FileHandler = new FileHandler();

    static Create(args: string[], authorId: string, channelId: string)
    {
        switch(args[0])
        {
            case "등록":
                return new Save(this.fileHandler, args, channelId);
            default:
                return new DoNothing();
        }
    }
}

class IBehavior
{
    abstract IsValid(): boolean
    abstract Result(): Promise<HandlerResult>

    OnFail(): HandlerResult
    {
        return new HandlerResult("help메시지");
    }
}

class DoNothing extends IBehavior
{
    IsValid(): boolean
    {
        return false;
    }
    
    async Result(): Promise<HandlerResult>
    {
        return null;
    }
}

class Save extends IBehavior
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

class Reboot extends IBehavior
{
    static isProgress: boolean = false;

    authorId: string

    constructor(authorId: string)
    {
        super();
        this.authorId = authorId;
    }
    
    public IsValid(): boolean
    {
        return this.authorId == Secret.AdminId && Reboot.isProgress;
    }

    public async Result(): Promise<HandlerResult>
    {
        // activity 바꿔야 하는데 이걸 어쩌지
        Reboot.isProgress = true;
        return null;
    }

    OnFail(): HandlerResult
    {
        return new HandlerResult("나는 나보다 약한 자의 명령은 듣지 않는다");
    }
}
