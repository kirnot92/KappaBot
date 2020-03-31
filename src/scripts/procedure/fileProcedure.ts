import * as path from "path"
import File from "../promisifier/file"
import Dictionary from "../collection/dictionary";
import * as Command from "../../json/command.json";
import * as Config from "../../json/config.json";
import Levenshtein from "./levenshtein";
import CommandContext from "../behavior/commandContext";

const ROOT = path.resolve(__dirname, "..", "..", "..")
const COMMANDS = path.join(ROOT, "commands")
const COMMANDS_OLD = path.join(ROOT, "commandsOld")

export default class FileProcedure
{
    static cacheList: Dictionary<string, string> = new Dictionary<string, string>();

    public static async FindSimilarCommand(identifier: string, invalidCommand: string): Promise<string>
    {
        var list = await this.GetListAsArray(identifier);

        // 글자를 모자라게 적은 경우 substring으로 판단
        for (var i=0; i<list.length; ++i)
        {
            var component = list[i];
            var searchResult = component.search(invalidCommand);
            if (searchResult != -1)
            {
                return component;
            }
        }

        // 자음, 모음을 잘못 쓴 경우 단어 거리를 판단
        var minDistance = Number.MAX_SAFE_INTEGER;
        var minDistanceCommand = "";
        for(var i=0; i<list.length; ++i)
        {
            var component = list[i];
            var distance = Levenshtein.GetDistance(invalidCommand, component);
            if (distance < minDistance)
            {
                minDistance = distance;
                minDistanceCommand = component;
            }
        }

        // 거리가 1보다 멀고 50% 이상 틀렸으면 너무 잘못 친걸로 간주한다
        var length = minDistanceCommand.length;
        var isAcceptableDistance = minDistance <= 1;

        var isAcceptableErrorRate = length != 0 ? (minDistance / length) <= 0.5 : false;
        if (isAcceptableDistance && isAcceptableErrorRate)
        {
            return minDistanceCommand;
        }
        return null;
    }

    static async GetListAsArray(identifier: string): Promise<Array<string>>
    {
        var files = await File.ReadDir(COMMANDS);

        var arr = new Array<string>();
        files.forEach(element =>
        {
            if (element.includes(identifier))
            {
                arr.push(element.replace(".txt", "").replace(identifier + ".", ""));
            }
        })

        return arr;
    }

    public static async GetList(identifier: string): Promise<string>
    {
        var files = await File.ReadDir(COMMANDS);

        if (!this.cacheList.ContainsKey(identifier))
        {
            var arr = new Array<string>();
            files.forEach(element =>
            {
                if (element.includes(identifier))
                {
                    arr.push(element.replace(".txt", "").replace(identifier + ".", ""));
                }
            })
            this.cacheList.Add(identifier, arr.join(", "));
        }

        var fileList = this.cacheList.MustGet(identifier);
        if (fileList.length == 0)
        {
            return null;
        }

        return fileList;
    }

    public static async Delete(identifier: string, command: string)
    {
        var path = this.GetPath(identifier, command);
        if (await File.IsExists(path))
        {
            await this.ArchiveCommand(identifier, command);
            await File.Delete(path);
        }

        this.cacheList.Remove(identifier);
    }

    public static async RemoveLastLine(identifier: string, command: string)
    {
        var path = this.GetPath(identifier, command);

        if (await File.IsExists(path))
        {
            var content = await File.ReadFile(path, "utf8");
            var lines = content.split("\n");

            await this.ArchiveCommand(identifier, command);

            if (lines.length == 1)
            {
                await File.Delete(path);
            }
            else
            {
                lines.pop();
                var nextContent = lines.join("\n");
                await File.Write(path, nextContent);
            }
        }

        this.cacheList.Remove(identifier);
    }

    public static async AddLine(identifier: string, title: string, content: string)
    {
        var prevContent = "";
        var path = this.GetPath(identifier, title);

        if (await File.IsExists(path))
        {
            prevContent = await File.ReadFile(path, "utf8") + "\n";
        }

        var nextContent = prevContent + content;

        await this.Save(identifier, title, nextContent);
    }

    public static async Save(identifier: string, title: string, content: string)
    {
        title = title.replace("/", "").replace("\\", "");

        var path = this.GetPath(identifier, title);
        if (await File.IsExists(path))
        {
            await this.ArchiveCommand(identifier, title)
        }

        await File.Write(path, content);

        this.cacheList.Remove(identifier);
    }


    public static async Load(identifier: string, command: string): Promise<CommandContext>
    {
        var path = this.GetPath(identifier, command);
        var content = await File.ReadFile(path, "utf8");

        var splited = content.split("\n");
        var files = new Array<string>();

        splited.forEach(line =>
        {
            if (line.startsWith("https://") && this.HasFileExtension(line))
            {
                files.push(line);
            }
        });

        return files.length == splited.length
            ? new CommandContext("", {files})
            : new CommandContext(content);
    }

    public static async Date(identifier: string, command: string)
    {
        var path = this.GetPath(identifier, command);
        var date = await File.GetCreatedDate(path);
        var content = "["+command+"]: " +date.toLocaleDateString("ko-kr")+" " + date.toTimeString()+"에 등록된 명령어입니다.";

        return content;
    }

    public static DefaultHelpString(): string
    {
        var content = "기본 명령어\n";
        var commands = Command as any;
        for (var key in Command)
        {
            if (commands[key].IsAdminCommand) { continue; }
            content = content + Config.Prefix + commands[key].Usage + "\n";
        }
        return content;
    }

    public static IsSystemCommand(command: string)
    {
        var sysCommands = Object.keys(Command);
        return sysCommands.includes(command);
    }

    public static async IsValidCommand(identifier: string, command: string): Promise<boolean>
    {
        var path = this.GetPath(identifier, command);
        return await File.IsExists(path);
    }

    private static HasFileExtension(content: string): boolean
    {
        var candidates = ["png", "jpg", "jpeg", "gif", "webp", "mp3"]
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
        return path.join(COMMANDS, identifier + "." + command + ".txt");
    }

    private static async ArchiveCommand(identifier: string, command: string)
    {
        var path = this.GetPath(identifier, command);
        var content = await File.ReadFile(path, "utf8");
        var order = 0;

        while (await File.IsExists(this.GetOldPath(identifier, command, order)))
        {
            order = order + 1;
        }

        var oldPath = this.GetOldPath(identifier, command, order);
        await File.Write(oldPath, content);
    }

    private static GetOldPath(identifier: string, command: string, order: number): string
    {
        return path.join(COMMANDS_OLD, identifier + "." + command + order + ".txt");
    }
}