const ConsoleLog = console.log
import * as Secret from './json/secret.json'
import * as Config from './json/config.json'
import * as Playing from './json/playing.json'
import {Client, Message as MessageContainer} from "discord.js"
import CommandHandler from "./scripts/handler"
import BackgroundJob from "./scripts/backgroundJob"
import {AnyChannel} from "./scripts/typeExtension"
import {Reboot} from "./scripts/reboot";

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
        this.bot.on('ready', () => this.OnReady())
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
        this.currentStatus = (this.currentStatus + 1) % this.statusList.length
        await this.bot.user.setActivity(this.statusList[this.currentStatus], { type: "PLAYING"})
    }

    async OnReady()
    {
        ConsoleLog("Bot Ready")
        var channel = this.bot.channels.get(Secret.DefaultChannelId);
        var textChannel = channel as AnyChannel;
        textChannel.send("갓파봇 부팅되었습니다")
    }

    async OnMessage(messageContainer: MessageContainer)
    {
        var message = messageContainer.content
        var channel = messageContainer.channel
        var author = messageContainer.author

        if (message.startsWith(Config.Prefix) && !author.bot)
        {
            if (message == "$재부팅")
            {
                Reboot();
            }
            else
            {
                var args = message.slice(Config.Prefix.length).split(' ')
                var result = await this.commandHandler.Handle(args, channel)
                channel.send(result.Message, result.Options);
            }
        }
    }
}

var discordBot = new DiscordBot()
discordBot.Login()