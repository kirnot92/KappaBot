import * as path from "path"
import File from "./file"
import HandlerResult from "./handlerResult";
import Dictionary from "./dictionary";

const ROOT = path.resolve(__dirname, "..", "..")
const COMMANDS = path.join(ROOT, "commands")
const COMMANDS_OLD = path.join(ROOT, "commandsOld")

export default class FileHandler
{
    // TODO 목록 채널별로 캐싱하게 하자. 파일 목록 늘어나면 점점 느려질 듯
    // 캐싱 필요할 땐 그냥 키를 지워버리면 됨
    cacheList: Dictionary<string, string> = new Dictionary<string, string>();

    public async GetList(identifier: string): Promise<HandlerResult>
    {
        var files = await File.ReadDir(COMMANDS)
        var arr = new Array<string>()

        files.forEach(element =>
            {
                if (element.includes(identifier))
                {
                    arr.push(element.replace(".txt", "").replace(identifier + ".", ""))
                }
            })

        var fileList = arr.join(", ");
        if (fileList.length == 0)
        {
            return new HandlerResult("이 채널에 등록된 명령어가 없습니다.")
        }

        return new HandlerResult(fileList);
    }

    public async Delete(identifier: string, command: string): Promise<HandlerResult>
    {
        var path = this.GetPath(identifier, command)
        if (await File.IsExists(path))
        {
            await this.ArchiveCommand(identifier, command)
            await File.Delete(path)
        }

        return new HandlerResult("갓파파");
    }


    public async Save(identifier: string, title: string, content: string): Promise<HandlerResult>
    {
        title = title.replace("/", "").replace("\\", "");

        var path = this.GetPath(identifier, title)
        if (await File.IsExists(path))
        {
            await this.ArchiveCommand(identifier, title)
        }

        await File.Write(path, content)

        return new HandlerResult("갓파파");
    }

    public async Load(identifier: string, command: string): Promise<HandlerResult>
    {
        var path = this.GetPath(identifier, command)
        var content = await File.ReadFile(path, "utf8")

        if (content.startsWith("https://") && this.IsImageExtension(content))
        {
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
        var candidates = ["png", "jpg", "jpeg", "gif", "webp"]
        for (var i = 0; i < candidates.length; ++i)
        {
            if (content.toLowerCase().endsWith(candidates[i]))
            {
                return true;
            }
        }
        return false;
    }

    private GetPath(identifier: string, command: string): string
    {
        return path.join(COMMANDS, identifier + "." + command + ".txt")
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
        return path.join(COMMANDS_OLD, identifier + "." + command + order + ".txt")
    }
}