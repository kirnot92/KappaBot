import File from "./file"
import HandlerResult from './handlerResult';

export default  class FileHandler
{
    private cachedFileList: string = ""
    private needToRefresh: boolean = true
    
    public async GetList(identifier: string): Promise<HandlerResult>
    {
        if (this.needToRefresh)
        {
            var files = await File.ReadDir('./commands/')
            var arr = new Array<string>()

            files.forEach(element =>
                {
                    if (element.includes(identifier))
                    {
                        arr.push(element.replace('.txt', '').replace(identifier + ".", ""))
                    }
                })
            this.cachedFileList = arr.join(', ')
            this.needToRefresh = false

            if (this.cachedFileList.length == 0)
            {
                return new HandlerResult("이 채널에 등록된 명령어가 없습니다.")
            }

            return new HandlerResult(this.cachedFileList);
        }
        else
        {
            return new HandlerResult(this.cachedFileList);
        }
    }

    public async Delete(identifier: string, command: string): Promise<HandlerResult>
    {
        var path = this.GetPath(identifier, command)
        if (await File.IsExists(path))
        {
            await this.ArchiveCommand(identifier, command)
            await File.Delete(path)
        }

        this.needToRefresh = true
        return new HandlerResult("갓파파");
    }


    public async Save(identifier: string, title: string, content: string): Promise<HandlerResult>
    {
        var path = this.GetPath(identifier, title)
        if (await File.IsExists(path))
        {
            await this.ArchiveCommand(identifier, title)
        }

        await File.Write(path, content)

        this.needToRefresh = true
        return new HandlerResult("갓파파");
    }

    public async Load(identifier: string, command: string): Promise<HandlerResult>
    {
        var path = this.GetPath(identifier, command)
        var content = await File.ReadFile(path, "utf8")

        if (content.startsWith("https://") && this.IsImageExtension(content))
        {
            this.needToRefresh = true
            return new HandlerResult("", {files: [content]});
        }
        else
        {
            return new HandlerResult(content);
        }
    }

    public async Date(identifier: string, command: string)
    {
        var path = this.GetPath(identifier, command)
        var date = await File.GetCreatedDate(path)
        var content = "["+command+"]: " +date.toLocaleDateString("ko-kr")+" " + date.toTimeString()+"에 등록된 명령어입니다."

        return new HandlerResult(content);
    }

    public async IsValidCommand(identifier: string, command: string): Promise<boolean>
    {
        var path = this.GetPath(identifier, command);
        return await File.IsExists(path);
    }

    private IsImageExtension(content: string): boolean
    {
        var candidates = ["png", "jpg", "jpeg"]
        for (var i = 0; i < candidates.length; ++i)
        {
            if (content.endsWith(candidates[i]))
            {
                return true;
            }
        }
        return false;
    }

    private GetPath(identifier: string, command: string): string
    {
        return "./commands/" + identifier + "." + command + ".txt"
    }
    
    private async ArchiveCommand(identifier: string, command: string)
    {
        var path = this.GetPath(identifier, command)
        var content = await File.ReadFile(path, "utf8")
        var order = 0

        while (await File.IsExists(this.GetOldPath(identifier, command, order)))
        {
            order = order + 1
        }

        var oldPath = this.GetOldPath(identifier, command, order)
        await File.Write(oldPath, content)
    }

    private GetOldPath(identifier: string, command: string, order: number): string
    {
        return "./commandsOld/" + identifier + "." + command + order + ".txt"
    }
}