import * as Secret from './json/secret.json';
import * as Config from './json/config.json';
import * as Playing from './json/playing.json';
import {Client, Message as MessageContainer, Message} from "discord.js";
import BackgroundJob from "./scripts/backgroundJob";
import {AnyChannel} from "./scripts/extension/typeExtension";
import BehaviorFactory from "./scripts/behavior/behaviorFactory";

class DiscordBot
{
    private bot : Client
    private currentStatus: number = 0
    private statusList: Array<string>

    constructor()
    {
        this.bot = new Client();
        this.bot.on('message', async (msg) => await this.OnMessage(msg));
        this.bot.on('ready', async () => await this.OnReady());

        this.statusList = new Array<string>();
        Playing.Message.forEach((elem: string) =>
        {
            this.statusList.push(elem);
        });
    }

    public async Login()
    {
        await this.bot.login(Secret.Token);
        await this.SetNextStatus();

        BackgroundJob.Run(() =>
        {
           this.SetNextStatus();
        }, BackgroundJob.HourInterval);
    }

    async SetNextStatus()
    {
        this.currentStatus = (this.currentStatus + 1) % this.statusList.length;
        await this.bot.user.setActivity(this.statusList[this.currentStatus], { type: "PLAYING"});
    }

    async OnReady()
    {
        console.log("Bot Ready");
        var defaultChannel = (this.bot.channels.get(Secret.DefaultChannelId) as AnyChannel);
        defaultChannel.send("갓파봇 부팅되었습니다. 갓파파~");
    }

    async OnMessage(container: MessageContainer)
    {
        var message = container.content;
        var channel = container.channel;
        var author = container.author;

        if (message.startsWith(Config.Prefix) && !author.bot)
        {
            var args = message.slice(Config.Prefix.length).split(' ');
            var behavior = await BehaviorFactory.Create(args, author.id, channel.id, this.bot);
            var result = await behavior.IsValid() ? await behavior.Result() : behavior.OnFail();
            channel.send(result.Message, result.Options);
        }
    }
}

var discordBot = new DiscordBot()
discordBot.Login()