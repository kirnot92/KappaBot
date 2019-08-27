import File from "./file"
import HandlerResult from './handlerResult';
import String from './StringExtension';

export default class CommandHandler
{
    private cachedFileList: string = ""
    private needToRefresh: boolean = true

    public async Handle(args: string[]): Promise<HandlerResult>
    {
        var command = args[0];

        if (!String.HasValue(command))
        {
            return this.DefaultHelp()
        }
        if (command == "등록" && String.HasValue(args[1], args[2]))
        {
            return await this.Save(args[1], args.slice(2).join(' '))
        }
        if (command == "목록")
        {
            return await this.GetList()
        }
        if (command == "삭제" && String.HasValue(args[1]))
        {
            return await this.Delete(args[1])
        }
        if (command == "언제" && String.HasValue(args[1]))
        {
            return await this.Date(args[1])
        }
        if (await File.IsExists(this.GetPath(command))) 
        {
            return await this.Load(command)
        }

        return this.DefaultHelp()
    }

    private async GetList(): Promise<HandlerResult>
    {
        if (this.needToRefresh)
        {
            var files = await File.ReadDir('./commands/')
            var arr = new Array<string>()

            files.forEach(element => arr.push(element.replace('.txt', '')))
            this.cachedFileList = arr.join(', ')
            this.needToRefresh = false

            return new HandlerResult(this.cachedFileList);
        }
        else
        {
            return new HandlerResult(this.cachedFileList);
        }
    }

    private async Delete(command: string): Promise<HandlerResult>
    {
        var path = this.GetPath(command)
        if (await File.IsExists(path))
        {
            await this.ArchiveCommand(command)
            await File.Delete(path)
        }

        this.needToRefresh = true
        return new HandlerResult("갓파파");
    }

    private async ArchiveCommand(command: string)
    {
        var path = this.GetPath(command)
        var content = await File.ReadFile(path, "utf8")
        var order = 0

        while (await File.IsExists(this.GetOldPath(command, order)))
        {
            order++
        }

        var oldPath = this.GetOldPath(command, order)
        await File.Write(oldPath, content)
    }

    private async Save(title: string, content: string): Promise<HandlerResult>
    {
        var path = this.GetPath(title)
        if (await File.IsExists(path))
        {
            await this.ArchiveCommand(title)
        }

        await File.Write(path, content)

        this.needToRefresh = true
        return new HandlerResult("갓파파");
    }

    private async Load(command: string): Promise<HandlerResult>
    {
        var path = this.GetPath(command)
        var content = await File.ReadFile(path, "utf8")

        if (content.startsWith("https://") && content.endsWith(".png"))
        {
            this.needToRefresh = true
            return new HandlerResult("", {files: [content]});
        }
        else
        {
            return new HandlerResult(content);
        }
    }

    private async Date(command: string)
    {
        var path = this.GetPath(command)
        var date = await File.GetCreatedDate(path)
        var content = "["+command+"]: " +date.toLocaleDateString("ko-kr")+" " + date.toTimeString()+"에 등록된 명령어입니다."

        return new HandlerResult(content);
    }

    private DefaultHelp(): HandlerResult
    {
        var content = "기본 명령어\n$등록 [이름] [내용]\n$삭제 [이름]\n$목록\n$언제 [이름]\n$[이름]"
        return new HandlerResult(content);
    }

    private GetPath(command: string): string
    {
        return "./commands/" + command + ".txt"
    }

    private GetOldPath(command: string, order: number): string
    {
        return "./commandsOld/" + command + order + ".txt"
    }
}