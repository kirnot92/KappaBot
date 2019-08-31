import * as path from "path"
import File from "../file"
import HandlerResult from "../HandlerResult";

const ROOT = path.resolve(__dirname, "..", "..", "..")
const COMMANDS = path.join(ROOT, "commands")
const COMMANDS_OLD = path.join(ROOT, "commandsOld")

export default class FileProcedure
{
    public static async GetList(identifier: string): Promise<HandlerResult>
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

    public static async Delete(identifier: string, command: string): Promise<HandlerResult>
    {
        var path = this.GetPath(identifier, command)
        if (await File.IsExists(path))
        {
            await this.ArchiveCommand(identifier, command)
            await File.Delete(path)
        }

        return new HandlerResult("갓파파");
    }


    public static async Save(identifier: string, title: string, content: string): Promise<HandlerResult>
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

    public static async Load(identifier: string, command: string): Promise<HandlerResult>
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

    public static async Date(identifier: string, command: string)
    {
        var path = this.GetPath(identifier, command)
        var date = await File.GetCreatedDate(path)
        var content = "["+command+"]: " +date.toLocaleDateString("ko-kr")+" " + date.toTimeString()+"에 등록된 명령어입니다."

        return new HandlerResult(content);
    }

    public static DefaultHelp()
    {
        var content = "기본 명령어\n$등록 [이름] [내용]\n$삭제 [이름]\n$목록\n$언제 [이름]\n$[이름]"
        return new HandlerResult(content);
    }

    public static async IsValidCommand(identifier: string, command: string): Promise<boolean>
    {
        var path = this.GetPath(identifier, command);
        return await File.IsExists(path);
    }

    private static IsImageExtension(content: string): boolean
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

    private static GetPath(identifier: string, command: string): string
    {
        return path.join(COMMANDS, identifier + "." + command + ".txt")
    }

    private static async ArchiveCommand(identifier: string, command: string)
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

    private static GetOldPath(identifier: string, command: string, order: number): string
    {
        return path.join(COMMANDS_OLD, identifier + "." + command + order + ".txt")
    }
}