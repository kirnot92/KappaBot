const ConsoleLog = console.log;
const secret = require('./sercret.json');
const config = require('./config.json');
import {Client, Message } from "discord.js";
import CommandHandler from "./handler";

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
        self.bot.login(secret.Token);
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