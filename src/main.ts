import * as Secret from "./json/secret.json";
import * as Config from "./json/config.json";
import * as Playing from "./json/playing.json";
import * as SystemMessge from "./json/systemMessge.json";
import {Client, Message as MessageContainer, User} from "discord.js";
import BackgroundJob from "./scripts/backgroundJob";
import {AnyChannel} from "./scripts/extension/typeExtension";
import BehaviorFactory from "./scripts/behavior/behaviorFactory";
import Math from "./scripts/extension/mathExtension";
import String from "./scripts/extension/stringExtension";

class DiscordBot
{
    private bot : Client
    private currentStatus: number = 0
    private statusList: Array<string>

    constructor()
    {
        this.bot = new Client();
        this.bot.on("message", async (msg) => await this.OnMessage(msg));
        this.bot.on("ready", async () => await this.OnReady());

        this.statusList = new Array<string>();
        Playing.Message.forEach((elem: string) =>
        {
            this.statusList.push(elem);
        });
        this.currentStatus = Math.Range(0, this.statusList.length);
    }

    public async Login()
    {
        await this.bot.login(Secret.Token);

        BackgroundJob.Run(async () =>
        {
            await this.SetNextStatus();
        }, BackgroundJob.HourInterval);
    }

    async SetNextStatus()
    {
        await this.bot.user.setActivity(this.statusList[this.currentStatus], { type: "PLAYING"});
        this.currentStatus = (this.currentStatus + 1) % this.statusList.length;
    }

    async OnReady()
    {
        console.log("Bot Ready");
        var defaultChannel = (this.bot.channels.get(Secret.DefaultChannelId) as AnyChannel);
        defaultChannel.send(SystemMessge.RebootCompleted);
    }

    async OnMessage(container: MessageContainer)
    {
        try
        {
            this.HandleMessage(container.content, container.channel, container.author);
        }
        catch (e)
        {
            container.channel.send("Exception 발생: " + e);
        }
    }

    async HandleMessage(message: string, channel: AnyChannel, author: User)
    {
        if (message.startsWith(Config.Prefix) && !author.bot)
        {
            var args = String.Slice([message.slice(Config.Prefix.length)], /\s|\n/, 2);
            var behavior = await BehaviorFactory.Create(args, author.id, channel.id, this.bot);
            var result = await behavior.IsValid() ? await behavior.Result() : behavior.OnFail();
            channel.send(result.Message, result.Options);
        }
    }
}

var discordBot = new DiscordBot()
discordBot.Login()