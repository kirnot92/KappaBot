import * as Utill from "util";
import * as FileRaw from 'fs';

export default class File
{
    private static isExists: (path: string) => Promise<boolean>;
    private static readFile: (path: string, encoding: string) => Promise<string>;
    private static readDir: (path: string) => Promise<string[]>;
    private static delete: (path: string) => Promise<void>;
    private static write: (path: string, content: string) => Promise<void>;

    // 이게 없다는게 말이 되냐
    // static constructor() { }

    public static async Initialize()
    {
        this.isExists = Utill.promisify(FileRaw.exists);
        this.readFile = Utill.promisify<string, string, string>(FileRaw.readFile);
        this.readDir = Utill.promisify<string, string[]>(FileRaw.readdir);
        this.delete = Utill.promisify<string>(FileRaw.unlink);
        this.write = Utill.promisify<string, string>(FileRaw.writeFile);
    }

    public static async IsExists(path: string)
    {
        return await this.isExists(path);
    }

    public static async ReadFile(path: string, encoding: string)
    {
        return await this.readFile(path, encoding);
    }

    public static async ReadDir(path: string)
    {
        return await this.readDir(path);
    }

    public static async Delete(path: string)
    {
        return await this.delete(path);
    }

    public static async Write(path: string, content: string)
    {
        return await this.write(path, content);
    }
}