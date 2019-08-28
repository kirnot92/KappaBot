import HandlerResult from './handlerResult';
import String from './stringExtension';
import FileHandler from "./fileHandler";

export default class CommandHandler
{
    fileHandler: FileHandler = new FileHandler()

    public async Handle(args: string[], channelId: string): Promise<HandlerResult>
    {
        var command = args[0];

        if (!String.HasValue(command))
        {
            return this.DefaultHelp()
        }
        if (command == "등록" && String.HasValue(args[1], args[2]))
        {
            return await this.fileHandler.Save(channelId, args[1], args.slice(2).join(' '))
        }
        if (command == "목록")
        {
            return await this.fileHandler.GetList(channelId)
        }
        if (command == "삭제" && String.HasValue(args[1]))
        {
            return await this.fileHandler.Delete(channelId, args[1])
        }
        if (command == "언제" && String.HasValue(args[1]))
        {
            return await this.fileHandler.Date(channelId, args[1])
        }
        if (command == "재부팅")
        {
            this.RebootProcess()
        }
        if (await this.fileHandler.IsValidCommand(channelId, command)) 
        {
            return await this.fileHandler.Load(channelId, command)
        }

        return this.DefaultHelp()
    }

    private DefaultHelp(): HandlerResult
    {
        var content = "기본 명령어\n$등록 [이름] [내용]\n$삭제 [이름]\n$목록\n$언제 [이름]\n$[이름]"
        return new HandlerResult(content);
    }

    RebootProcess()
    {
        var cmd = require('node-cmd');
        cmd.get('cd /home/Bot/Kappabot', (err: any, data: any, stderr: any) => { console.log(data) });
        cmd.get('git pull', (err: any, data: any, stderr: any) => { console.log(data) });
    }
}