import * as path from "path"
import File from "../promisifier/file"

const ROOT = path.resolve(__dirname, "..", "..", "..")
const BLACKLIST = path.join(ROOT, "blackList")

export default class BlacklistRepository
{
    public static async Add(userId: string)
    {
        if (!(await File.IsExists(BLACKLIST)))
        {
            File.MakeDir(BLACKLIST);
        }

        var path = this.GetPath(userId);
        await File.Write(path, "");
    }

    public static async Remove(userId: string)
    {
        var path = this.GetPath(userId);
        if (await File.IsExists(path))
        {
            await File.Delete(path);
        }
    }

    public static async IsBlackList(userId: string): Promise<boolean>
    {
        var path = this.GetPath(userId);
        return await File.IsExists(path);
    }

    private static GetPath(userId: string): string
    {
        return path.join(BLACKLIST, userId + ".txt");
    }  
}