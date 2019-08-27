const ConsoleLog = console.log
import * as Secret from './secret.json'
import * as Config from './config.json'
import * as Playing from './playing.json'
import {Client, Message as MessageContainer} from "discord.js"
import CommandHandler from "./handler"
import BackgroundJob from "./backgroundJob"

class DiscordBot
{
    private bot : Client
    private commandHandler: CommandHandler
    private currentStatus: number = 0
    private statusList: Array<string>

    constructor()
    {
        this.bot = new Client()
        this.bot.on('message', (msg) => this.OnMessage(msg))
        this.bot.on('ready', this.OnReady)
        this.commandHandler = new CommandHandler()

        this.statusList = new Array<string>()
        Playing.Message.forEach((elem: string) =>
        {
            this.statusList.push(elem)
        })
    }

    public async Login()
    {
        await this.bot.login(Secret.Token)
        await this.SetNextStatus()

        BackgroundJob.Run(() =>
        {
           this.SetNextStatus()
        }, BackgroundJob.HourInterval)
    }

    async SetNextStatus()
    {
        this.currentStatus = (this.currentStatus++) % this.statusList.length
        await this.bot.user.setActivity(this.statusList[this.currentStatus], { type: "PLAYING"})
    }

    async OnReady()
    {
        ConsoleLog("Bot Ready")
    }

    async OnMessage(messageContainer: MessageContainer)
    {
        let message = messageContainer.content
        let channel = messageContainer.channel
        let author = messageContainer.author

        if (message.startsWith(Config.Prefix) && !author.bot)
        {
            var args = message.slice(Config.Prefix.length).split(' ')
            var result = await this.commandHandler.Handle(args)

            channel.send(result.Message, result.Options);
        }
    }
}

var discordBot = new DiscordBot()
discordBot.Login()