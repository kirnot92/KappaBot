import {TextChannel, DMChannel, GroupDMChannel } from "discord.js";
import File from "./file";
File.Initialize();

export default class CommandHandler
{
    private cachedFileList: string = "";
    private needToRefresh: boolean = true;

    public async Handle(channel: TextChannel | DMChannel | GroupDMChannel, args: string[])
    {
        switch(args[0])
        {
            case "등록":
                await this.Save(channel, args[1], args.slice(2).join(' '));
                break;

            case "목록":
                await this.GetList(channel);
                break;

            case "삭제":
                await this.Delete(channel, args[1]);
                break;

            default:
                var path = this.GetPath(args[0]);
                if (await File.IsExists(path)) 
                {
                    await this.Load(channel, args[0]);
                }
                else { this.DefaultHelp(channel); }
        }
    }

    private async GetList(channel: TextChannel | DMChannel | GroupDMChannel)
    {
        if (this.needToRefresh)
        {
            var files = await File.ReadDir('./commands/');
            var arr = new Array<string>();

            files.forEach(element => arr.push(element.replace('.txt', '')));
            this.cachedFileList = arr.join(', ');
            this.needToRefresh = false;

            channel.send(this.cachedFileList);
        }
        else
        {
            channel.send(this.cachedFileList);
        }
    }

    private GetPath(command: string): string
    {
        return "./commands/" + command + ".txt";
    }

    private async Delete(channel: TextChannel | DMChannel | GroupDMChannel, command: string)
    {
        var path = this.GetPath(command);
        await File.Delete(path);

        channel.send("갓파파");
        this.needToRefresh = true;
    }

    private async Save(channel: TextChannel | DMChannel | GroupDMChannel, title: string, content: string)
    {
        var path = this.GetPath(title);
        await File.Write(path, content);

        channel.send("갓파파");
        this.needToRefresh = true;
    }

    private async Load(channel: any, command: string)
    {
        var path = this.GetPath(command);
        var file = await File.ReadFile(path, "utf8");
        channel.send(file);
    }

    private DefaultHelp(channel: any)
    {
        var help = "기본 명령어\n$등록 [이름] [내용]\n$삭제 [이름]\n$목록";
        channel.send(help);
    }
}