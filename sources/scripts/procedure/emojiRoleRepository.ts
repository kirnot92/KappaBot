import * as path from "path"
import File from "../promisifier/file"
import Dictionary from "../collection/dictionary";

const ROOT = path.resolve(__dirname, "..", "..", "..")
const EMOJIROLES = path.join(ROOT, "resources", "emojiRoles")

export default class EmojiRoleRepository
{
    public static async Add(guildId: string, emoji: string, role: string)
    {
        if (!(await File.IsExists(EMOJIROLES)))
        {
            File.MakeDir(EMOJIROLES);
        }

        var path = this.GetPath(guildId, emoji);
        await File.Write(path, role);
    }

    private static GetPath(guildId: string, emoji: string): string
    {
        return path.join(EMOJIROLES, guildId + "." + emoji + ".txt");
    }

    public static async Remove(guildId: string, emoji: string)
    {
        var path = this.GetPath(guildId, emoji);
        if (await File.IsExists(path))
        {
            await File.Delete(path);
        }
    }

    public static async HasRole(guildId: string, emoji: string): Promise<boolean>
    {
        var path = this.GetPath(guildId, emoji);
        return await File.IsExists(path);
    }

    public static async GetRole(guildId: string, emoji: string): Promise<string>
    {
        var path = this.GetPath(guildId, emoji);
        var content = await File.ReadFile(path, "utf8");
        return content;
    }

    public static async GetRoles(guildId: string): Promise<Array<{emoji: string, role: string}>>
    {
        var emojis = new Array<{emoji: string, role: string}>();
        var files = await File.ReadDir(EMOJIROLES);
        
        for (const elem of files)
        {
            var splited = elem.replace(".txt", "").split(".");
            if (splited[0] == guildId)
            {
                var role = await this.GetRole(guildId, splited[1])
                emojis.push({emoji: splited[1], role: role});
            }
        }
        return emojis;
    }
}

