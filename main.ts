const ConsoleLog = console.log;
const setting = require('./setting.json');
import {Client, Message } from "discord.js";
import CommandHandler from "./handler";

const prefix = "$";

class DiscordBot
{
    private bot : Client;
    private commandHandler: CommandHandler;

    constructor()
    {
        this.bot = new Client()
        this.bot.on('message', (msg) => this.OnMessage(msg));
        this.bot.on('ready', this.OnReady);
        this.commandHandler = new CommandHandler();
    }

    public Login()
    {
        let self = this;
        self.bot.login(setting.Token);
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

        if (message.startsWith(prefix) && !author.bot)
        {
            var args = message.slice(prefix.length).split(' ');
            await this.commandHandler.Handle(channel, args);
        }
    }
}

var discordBot = new DiscordBot();
discordBot.Login();