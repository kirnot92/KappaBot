import * as path from "path"
import File from "../promisifier/file"
import BehaviorResult from "../behavior/behaviorResult";
import Dictionary from "../collection/dictionary";
import * as Command from "../../json/command.json";
import * as SystemMessage from "../../json/systemMessge.json";

const ROOT = path.resolve(__dirname, "..", "..", "..")
const COMMANDS = path.join(ROOT, "commands")
const COMMANDS_OLD = path.join(ROOT, "commandsOld")

export default class FileProcedure
{
    // TODO 목록 채널별로 캐싱하게 하자. 파일 목록 늘어나면 점점 느려질 듯
    // 캐싱 필요할 땐 그냥 키를 지워버리면 됨
    static cacheList: Dictionary<string, string> = new Dictionary<string, string>();

    public static async GetList(identifier: string): Promise<BehaviorResult>
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
            return new BehaviorResult(SystemMessage.NothingSaved);
        }

        return new BehaviorResult(fileList);
    }

    public static async Delete(identifier: string, command: string): Promise<BehaviorResult>
    {
        var path = this.GetPath(identifier, command)
        if (await File.IsExists(path))
        {
            await this.ArchiveCommand(identifier, command)
            await File.Delete(path)
        }

        return new BehaviorResult(SystemMessage.Comfirmed);
    }


    public static async Save(identifier: string, title: string, content: string): Promise<BehaviorResult>
    {
        title = title.replace("/", "").replace("\\", "");

        var path = this.GetPath(identifier, title)
        if (await File.IsExists(path))
        {
            await this.ArchiveCommand(identifier, title)
        }

        await File.Write(path, content)

        return new BehaviorResult(SystemMessage.Comfirmed);
    }

    public static async Load(identifier: string, command: string): Promise<BehaviorResult>
    {
        var path = this.GetPath(identifier, command)
        var content = await File.ReadFile(path, "utf8")

        if (content.startsWith("https://") && this.IsImageExtension(content))
        {
            return new BehaviorResult("", {files: [content]});
        }
        else
        {
            return new BehaviorResult(content);
        }
    }

    public static async Date(identifier: string, command: string)
    {
        var path = this.GetPath(identifier, command)
        var date = await File.GetCreatedDate(path)
        var content = "["+command+"]: " +date.toLocaleDateString("ko-kr")+" " + date.toTimeString()+"에 등록된 명령어입니다."

        return new BehaviorResult(content);
    }

    public static DefaultHelp()
    {
        var content = "기본 명령어\n"
        var commands = Command as any;
        for (var key in Command)
        {
            if (commands[key].IsAdminCommand) { continue; }
            content = content + commands[key].Usage + "\n";
        }
        return new BehaviorResult(content);
    }

    public static IsSystemCommand(command: string)
    {
        var sysCommands = Object.keys(Command);
        return sysCommands.includes(command)
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