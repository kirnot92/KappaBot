import * as Utill from "util";
import * as FileRaw from 'fs';

export default class File
{
    public static async IsExists(path: string)
    {
        var isExists = Utill.promisify(FileRaw.exists);
        return await isExists(path);
    }

    public static async ReadFile(path: string, encoding: string)
    {
        var readFile = Utill.promisify<string, string, string>(FileRaw.readFile);
        return await readFile(path, encoding);
    }

    public static async ReadDir(path: string)
    {
        var readDir = Utill.promisify<string, string[]>(FileRaw.readdir);
        return await readDir(path);
    }

    public static async Delete(path: string)
    {
        var delFile = Utill.promisify<string>(FileRaw.unlink);
        return await delFile(path);
    }

    public static async Write(path: string, content: string)
    {
        var write = Utill.promisify<string, string>(FileRaw.writeFile);
        return await write(path, content);
    }
}