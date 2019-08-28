import HandlerResult from './handlerResult';
import String from './stringExtension';
import FileHandler from "./fileHandler";
import * as Utill from "util";
import {AnyChannel} from "./typeExtension";

export default class CommandHandler
{
    fileHandler: FileHandler = new FileHandler()

    public async Handle(args: string[], channel: AnyChannel): Promise<HandlerResult>
    {
        var command = args[0];
        var channelId = channel.id;

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
            channel.send("갓파파 재부팅")
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

    private RebootProcess()
    {
        var cmd = require('node-cmd');
        cmd.run("cd /home/Bot/Kappabot");
        cmd.run("git pull")
        cmd.run("tsc -p tsconfig.json")
        cmd.run("forever restartall")
    }
}
