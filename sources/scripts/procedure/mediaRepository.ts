import * as path from "path"
import File from "../promisifier/file"
import Web from "./web";
import { MessageAttachment } from "discord.js";

const ROOT = path.resolve(__dirname, "..", "..", "..")
const MEDIAS_PATH = path.join(ROOT, "resources", "medias")
const MEDIAS_OLD_PATH = path.join(ROOT, "resources", "mediasOld")

export default class MediaRepository
{
    public static async Save(identifier: string, title: string, contentUrls: Array<string>)
    {
        var folderPath = this.GetPath(identifier, title);
        if (!await File.IsExists(folderPath))
        {
            await File.MakeDir(folderPath);
        }
        else
        {
            await MediaRepository.Archive(identifier, title);
            await File.MakeDir(folderPath);
        }

        for (var url of contentUrls)
        {
            var splited = url.split("/");
            var fileName = splited.pop();

            await Web.Download(url, path.join(folderPath, fileName));
        }
    }

    public static async OnCommandDeleted(identifier: string, command: string)
    {
        if (await MediaRepository.HasMedias(identifier, command))
        {
            await this.Archive(identifier, command);
        }
    }

    private static async Archive(identifier: string, command: string)
    {
        var fromPath = this.GetPath(identifier, command);
        var order = 0;

        while (await File.IsExists(this.GetOldPath(identifier, command, order)))
        {
            order = order + 1;
        }

        var toPath = this.GetOldPath(identifier, command, order);
        await File.Rename(fromPath, toPath);
    }

    public static async HasMedias(identifier: string, command: string): Promise<boolean>
    {
        var path = MediaRepository.GetPath(identifier, command);
        return await File.IsExists(path);
    }

    public static async GetMedias(identifier: string, command: string): Promise<string[]>
    {
        var folderPath = MediaRepository.GetPath(identifier, command);
        var files = await File.ReadDir(folderPath);

        var arr = new Array<string>();
        for (var fileName of files)
        {
            arr.push(path.join(folderPath, fileName));
        }
        return arr;
    }

    private static GetPath(identifier: string, command: string): string
    {
        return path.join(MEDIAS_PATH, identifier + "." + command);
    }

    private static GetOldPath(identifier: string, command: string, order: number): string
    {
        return path.join(MEDIAS_OLD_PATH, identifier + "." + command + order);
    }

    public static HasMediaString(content: string): boolean
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

    public static FindMediaUrls(content: string): {urls: Array<string>, others: string}
    {
        var urls = new Array<string>();
        var splited = new Array<string>();
        content.split("\n").forEach(elem => 
        {
            elem.split(" ").forEach(e => 
            {
                splited.push(e);
            });
        });

        for (let line of splited)
        {
            if (line.startsWith("https://") && MediaRepository.HasMediaString(line))
            {
                urls.push(line);
            }
        }
    
        let others = content;
        for (let url of urls)
        {
            others = others.replace(url, "");
        }

        return {urls, others};
    }

    public static GetUrlsFromMediaAttachments(attachments: MessageAttachment[]): Array<string>
    {
        var urls = new Array<string>();
        for (var attachment of attachments)
        {
            // 필요하다면 attachment.size 검사 (나중에)
            urls.push(attachment.url);
        }

        return urls;
    }
}