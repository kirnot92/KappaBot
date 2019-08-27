import {AnyChannel} from "./typeExtension";
import File from "./file"

export default class CommandHandler
{
    private cachedFileList: string = ""
    private needToRefresh: boolean = true

    public async Handle(channel: AnyChannel, args: string[])
    {
        switch(args[0])
        {
            case "등록":
                await this.Save(channel, args[1], args.slice(2).join(' '))
                break

            case "목록":
                await this.GetList(channel)
                break

            case "삭제":
                await this.Delete(channel, args[1])
                break

            case "언제":
                await this.Date(channel, args[1])
                break

            default:
                var path = this.GetPath(args[0])
                if (await File.IsExists(path)) 
                {
                    await this.Load(channel, args[0])
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
}