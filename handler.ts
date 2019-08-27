import {AnyChannel} from "./typeExtension";
import File from "./file"

export default class CommandHandler
{
    private cachedFileList: string = ""
    private needToRefresh: boolean = true

    public async Handle(channel: AnyChannel, args: string[])
    {
        var command = args[0];
        if (!this.HasValue(command))
        {
            this.DefaultHelp(channel)
        }
        else if (command == "등록" && this.HasValue(args[1], args[2]))
        {
            await this.Save(channel, args[1], args.slice(2).join(' '))
        }
        else if (command == "목록")
        {
            await this.GetList(channel)
        }
        else if (command == "삭제" && this.HasValue(args[1]))
        {
            await this.Delete(channel, args[1])
        }
        else if (command == "언제" && this.HasValue(args[1]))
        {
            await this.Date(channel, args[1])
        }
        else
        {
            var path = this.GetPath(command)
            if (await File.IsExists(path)) 
            {
                await this.Load(channel, command)
            }
            else { this.DefaultHelp(channel) }
        }
    }

    private async GetList(channel: AnyChannel)
    {
        if (this.needToRefresh)
        {
            var files = await File.ReadDir('./commands/')
            var arr = new Array<string>()

            files.forEach(element => arr.push(element.replace('.txt', '')))
            this.cachedFileList = arr.join(', ')
            this.needToRefresh = false

            channel.send(this.cachedFileList)
        }
        else
        {
            channel.send(this.cachedFileList)
        }
    }

    private GetPath(command: string): string
    {
        return "./commands/" + command + ".txt"
    }

    private GetOldPath(command: string, order: number): string
    {
        return "./commandsOld/" + command + order + ".txt"
    }

    private async Delete(channel: AnyChannel, command: string)
    {
        var path = this.GetPath(command)
        if (await File.IsExists(path))
        {
            await this.ArchiveCommand(command)
            await File.Delete(path)
        }

        channel.send("갓파파")
        this.needToRefresh = true
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

    private async Save(channel: AnyChannel, title: string, content: string)
    {
        var path = this.GetPath(title)
        if (await File.IsExists(path))
        {
            await this.ArchiveCommand(title)
        }

        await File.Write(path, content)

        channel.send("갓파파")
        this.needToRefresh = true
    }

    private async Load(channel: AnyChannel, command: string)
    {
        var path = this.GetPath(command)
        var content = await File.ReadFile(path, "utf8")

        if(content.startsWith("https://") && content.endsWith(".png"))
        {
            channel.send("", {files: [content]})
        }
        else
        {
            channel.send(content)
        }
    }

    private async Date(channel: AnyChannel, command: string)
    {
        var path = this.GetPath(command)
        var date = await File.GetCreatedDate(path)
        channel.send("["+command+"]: " +date.toLocaleDateString("ko-kr")+" " + date.toTimeString()+"에 등록된 명령어입니다.")
    }

    private DefaultHelp(channel: any)
    {
        var help = "기본 명령어\n$등록 [이름] [내용]\n$삭제 [이름]\n$목록\n$언제 [이름]"
        channel.send(help)
    }

    private HasValue(...values: string[]): boolean
    {
        for (var i = 0; i < values.length; ++i)
        {
            var value = values[i];
            if (value == null || value.length == 0)
            {
                return false;
            }
        }
        return true;
    }
}