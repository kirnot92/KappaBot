import * as path from "path"
import File from "../promisifier/file"
import Dictionary from "../collection/dictionary";
import * as Command from "../../json/command.json";
import Levenshtein from "./levenshtein";
import CommandContext from "../behavior/commandContext";
import Web from "./web";

const ROOT = path.resolve(__dirname, "..", "..", "..")
const COMMANDS = path.join(ROOT, "resources", "commands")
const CONTENTS = path.join(ROOT, "resources", "contents")
const COMMANDS_OLD = path.join(ROOT, "resources", "commandsOld")

export default class CommandRepository
{
    static cacheList: Dictionary<string, string> = new Dictionary<string, string>();

    public static async FindCommandBySubString(identifier: string, arg: string): Promise<Array<string>>
    {
        var commands = await this.GetListAsArray(identifier);
        var list = new Array<string>();
        for (var i=0; i<commands.length; ++i)
        {
            var component = commands[i];
            var searchResult = component.search(String.raw`arg`);
            if (searchResult != -1)
            {
                list.push(component);
            }
        }
   
        return list;
    }

    public static async FindCommandBySimiliarity(identifier: string, arg: string): Promise<Array<string>>
    {
        var commands = await this.GetListAsArray(identifier);
        var list = new Array<string>();

        var minDistance = Number.MAX_SAFE_INTEGER;
        for(var i=0; i<commands.length; ++i)
        {
            var component = commands[i];
            var distance = Levenshtein.GetDistance(arg, component);
            if (distance < minDistance)
            {
                minDistance = distance;
                
                // 거리가 1보다 멀고 50% 이상 틀렸으면 너무 잘못 친걸로 간주한다
                var length = component.length;
                var isAcceptableDistance = minDistance <= 1;

                var isAcceptableErrorRate = length != 0 ? (minDistance / length) <= 0.5 : false;
                if (isAcceptableDistance && isAcceptableErrorRate)
                {
                    list.push(component);
                }
            }
        }

        var last = list.length > 3 ? 3 : list.length;

        return list.reverse().slice(0, last);
    }

    public static async FindSimilar(identifier: string, invalidCommand: string): Promise<string>
    {
        // 글자를 모자라게 적은 경우 substring으로 판단
        var substringSearchResult = await this.FindCommandBySubString(identifier, invalidCommand);
        if (substringSearchResult.length != 0)
        {
            return substringSearchResult[0];
        }

        // 자음, 모음을 잘못 쓴 경우 단어 거리를 판단
        var similiaritySearchResult = await this.FindCommandBySimiliarity(identifier, invalidCommand);
        if (similiaritySearchResult.length != 0)
        {
            return similiaritySearchResult[0];
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
            await this.Archive(identifier, command);
            await File.Delete(path);
        }

        var contentsPath = this.GetContentsPath

        this.cacheList.Remove(identifier);
    }

    public static async RemoveLastLine(identifier: string, command: string)
    {
        var path = this.GetPath(identifier, command);

        if (await File.IsExists(path))
        {
            var content = await File.ReadFile(path, "utf8");
            var lines = content.split("\n");

            await this.Archive(identifier, command);

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

        await this.Save(identifier, title, nextContent, new Array<string>());
    }

    public static async Save(identifier: string, title: string, content: string, urls: Array<string>)
    {
        title = title.replace("/", "").replace("\\", "");

        var splited = content.split("\n");
        for(let line of splited)
        {
            if (line.startsWith("https://") && this.HasFileExtension(line))
            {
                urls.push(line);
            }
        }

        await CommandRepository.SaveContents(identifier, title, urls)

        var path = this.GetPath(identifier, title);
        if (await File.IsExists(path))
        {
            await this.Archive(identifier, title)
        }

        await File.Write(path, content);
        this.cacheList.Remove(identifier);
    }

    private static async SaveContents(identifier: string, title: string, contentUrls: Array<string>)
    {
        var folderPath = await this.GetContentsPath(identifier, title);
        if (!await File.IsExists(folderPath))
        {
            await File.MakeDir(folderPath);
        }

        for (var url of contentUrls)
        {
            var splited = url.split("/");
            var fileName = splited.pop();

            await Web.Download(url, path.join(folderPath, fileName));
        }
    }

    public static async Load(identifier: string, command: string): Promise<CommandContext>
    {
        var path = this.GetPath(identifier, command);
        var content = await File.ReadFile(path, "utf8");

        var hasContents = await CommandRepository.IsContentsExists(identifier, command);
        return hasContents
            ? new CommandContext(content, {files: await CommandRepository.GetContents(identifier, command)})
            : new CommandContext(content);
    }

    public static async Date(identifier: string, command: string)
    {
        var path = this.GetPath(identifier, command);
        var date = await File.GetCreatedDate(path);
        var content = "["+command+"]: " +date.toLocaleDateString("ko-kr")+" " + date.toTimeString()+"에 등록된 명령어입니다.";

        return content;
    }

    public static IsSystemCommand(command: string)
    {
        var sysCommands = Object.keys(Command);
        return sysCommands.includes(command);
    }

    public static async IsExists(identifier: string, command: string): Promise<boolean>
    {
        var path = this.GetPath(identifier, command);
        return await File.IsExists(path);
    }

    private static HasFileExtension(content: string): boolean
    {
        var candidates = ["png", "jpg", "jpeg", "gif", "webp", "mp3", "mp4"]
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

    private static async IsContentsExists(identifier: string, command: string): Promise<boolean>
    {
        var path = await CommandRepository.GetContentsPath(identifier, command);
        return await File.IsExists(path);
    }

    private static async GetContents(identifier: string, command: string): Promise<string[]>
    {
        var path = await CommandRepository.GetContentsPath(identifier, command);
        var files = await File.ReadDir(path);

        var arr = new Array<string>();
        for (var fileName of files)
        {
            arr.push(fileName);
        }
        return arr;
    }

    private static async GetContentsPath(identifier: string, command: string): Promise<string>  
    {
        return path.join(CONTENTS, identifier + "." + command);
    }

    private static async Archive(identifier: string, command: string)
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