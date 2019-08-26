const ConsoleLog = console.log;
const secret = require('./secret.json');
const config = require('./config.json');
const playing = require('./playing.json');
import {Client, Message } from "discord.js";
import CommandHandler from "./handler";
import BackgroundJob from "./backgroundJob";

class DiscordBot
{
    private bot : Client;
    private commandHandler: CommandHandler;
    private currentStatus: number = 0;
    private statusList: Array<string>;

    constructor()
    {
        this.bot = new Client()
        this.bot.on('message', (msg) => this.OnMessage(msg));
        this.bot.on('ready', this.OnReady);
        this.commandHandler = new CommandHandler();

        this.statusList = new Array<string>();
        playing.Message.forEach((elem: string) =>
        {
            this.statusList.push(elem);
        });
    }

    public async Login()
    {
        await this.bot.login(secret.Token);
        await this.SetNextStatus();

        BackgroundJob.Run(() =>
        {
           this.SetNextStatus()
        }, BackgroundJob.HourInterval);
    }

    async SetNextStatus()
    {
        this.currentStatus = (this.currentStatus++) % this.statusList.length;
        await this.bot.user.setActivity(this.statusList[this.currentStatus], { type: "PLAYING"});
    }

    async OnReady()
    {
        ConsoleLog("Bot Ready");
    }

    async OnMessage(messageContainer: Message)
    {
        let message = messageContainer.content;
        let channel = messageContainer.channel;
        let author = messageContainer.author;

        if (message.startsWith(config.Prefix) && !author.bot)
        {
            var args = message.slice(config.Prefix.length).split(' ');
            await this.commandHandler.Handle(channel, args);
        }
    }
}

var discordBot = new DiscordBot();
discordBot.Login();