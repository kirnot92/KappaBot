const Console = console;
const setting = require('./setting.json');
import {Client, Message, TextChannel, DMChannel, GroupDMChannel } from "discord.js";
import File from "./file";
File.Initialize();

const prefix = "+";

class DiscordBot
{
    private bot : Client;
    private cachedFileList: string;
    private needToRefresh: boolean;

    constructor()
    {
        let self = this;
        self.bot = new Client()
        self.bot.on('message', (msg) => this.OnMessage(msg));
        self.bot.on('ready', this.OnReady);
        this.cachedFileList = ".";
        this.needToRefresh = true;
    }

    async OnReady()
    {
        Console.log("Bot Ready");
    }

    public Login()
    {
        let self = this;
        self.bot.login(setting.Token);
    }

    async OnMessage(messageContainer: Message)
    {
        let message = messageContainer.content;
        let channel = messageContainer.channel;
        let author = messageContainer.author;

        if (message.startsWith(prefix) && !author.bot)
        {
            var args = message.slice(prefix.length).split(' ');
            var handler = await this.GetHandler(channel, args);
            handler();
        }
    }

    async GetHandler(channel: TextChannel | DMChannel | GroupDMChannel, args: string[]) : Promise<Function>
    {
        switch(args[0])
        {
            case "등록":
                return async () => await this.Save(channel, args[1], args.slice(2).join(' '));
            case "목록":
                return async () => await this.GetList(channel);
            case "삭제":
                return async () => await this.Delete(channel, args[1]);
            default:
                if (await File.IsExists(this.GetPath(args[0])))
                {
                    return async () => await this.Load(channel, args[0]);
                }
                else { return () => this.DefaultHelp(channel); }
        }
    }

    private async GetList(channel: TextChannel | DMChannel | GroupDMChannel)
    {
        if (this.needToRefresh)
        {
            var files = await File.ReadDir('./commands/');

            var arr = new Array<string>();
            files.forEach(element =>
            {
                arr.push(element.replace('.txt', ''));
            });
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

var discordBot = new DiscordBot();
discordBot.Login();


