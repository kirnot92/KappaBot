import * as Utill from "util"
import * as FileRaw from "fs"
import {PathLike, RmOptions, NoParamCallback} from "fs";

export default class File
{
    public static async MakeDir(path: string)
    {
        var mkdir = Utill.promisify(FileRaw.mkdir);
        return await mkdir(path);
    }

    public static async IsExists(path: string)
    {
        var isExists = Utill.promisify(FileRaw.exists)
        return await isExists(path)
    }

    public static async ReadFile(path: string, encoding: string)
    {
        return FileRaw.readFileSync(path, 'utf8');
    }

    public static async ReadDir(path: string)
    {
        var readDir = Utill.promisify<string, string[]>(FileRaw.readdir)
        return await readDir(path)
    }

    public static async Delete(path: string)
    {
        var delFile = Utill.promisify<string>(FileRaw.unlink)
        return await delFile(path)
    }

    public static async RemoveDir(path: string)
    {
        var removeDir = Utill.promisify(FileRaw.rmdir);
        return await removeDir(path);
    }

    public static async ForceRemove(path: string)
    {
        var rm = Utill.promisify<PathLike, RmOptions, NoParamCallback>(FileRaw.rm);
        return await rm(path, { recursive: true, force: true }, (err: any)=> {} );
    }

    public static async Write(path: string, content: string)
    {
        var write = Utill.promisify<string, string>(FileRaw.writeFile)
        return await write(path, content)
    }

    public static async GetCreatedDate(path: string) : Promise<Date>
    {
        var stats = await this.GetFileStats(path)
        return stats.birthtime
    }

    public static async GetFileStats(path: string): Promise<FileRaw.Stats>
    {
        var stats = Utill.promisify<string, FileRaw.Stats>(FileRaw.stat)   
        return await stats(path)
    }

    public static async Rename(oldPath: string, newPath: string)
    {
        var rename =  Utill.promisify(FileRaw.rename);
        return await rename(oldPath, newPath);
    }
}