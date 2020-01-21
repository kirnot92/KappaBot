import * as Secret from "./json/secret.json";
import * as Config from "./json/config.json";
import * as Playing from "./json/playing.json";
import * as SystemMessage from "./json/systemMessage.json";
import {Client, Message as MessageContainer, User} from "discord.js";
import BackgroundJob from "./scripts/backgroundJob";
import {AnyChannel} from "./scripts/extension/typeExtension";
import BehaviorFactory from "./scripts/behavior/behaviorFactory";
import Math from "./scripts/extension/mathExtension";
import String from "./scripts/extension/stringExtension";

class DiscordBot
{
    private bot : Client
    private currentActivityIndex: number = 0
    private activityList: Array<string>

    constructor()
    {
        this.bot = new Client();
        this.bot.on("message", async (msg) => await this.OnMessage(msg));
        this.bot.on("ready", async () => await this.OnReady());

        this.activityList = new Array<string>();
        Playing.Message.forEach((elem: string) =>
        {
            this.activityList.push(elem);
        });
        this.currentActivityIndex = Math.Range(0, this.activityList.length - 1);
    }

    public async Login()
    {
        await this.bot.login(Secret.Token);

        BackgroundJob.Run(async () =>
        {
            await this.SetNextActivitymessage();
        }, BackgroundJob.HourInterval);
    }

    async SetNextActivitymessage()
    {
        // 명령어 호출용 prefix를 달아서 호출 방법을 안내하게 하는 목적
        var currentActivity = Config.Prefix + this.activityList[this.currentActivityIndex];
        await this.bot.user.setActivity(currentActivity, { type: "PLAYING"});
        this.currentActivityIndex = (this.currentActivityIndex + 1) % this.activityList.length;
    }

    async OnReady()
    {
        console.log("Bot Ready");
        var defaultChannel = (this.bot.channels.get(Secret.DefaultChannelId) as AnyChannel);
        defaultChannel.send(SystemMessage.RebootCompleted);
    }

    async OnMessage(container: MessageContainer)
    {
        try
        {
            var content = container.content;
            var attachments = container.attachments.array();
            if (attachments.length != 0)
            {
                content = content + " " + attachments[0].url;
            }

            this.HandleMessage(content, container.channel, container.author);
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
            await channel.send(result.Message, result.Options);
        }
    }
}

var discordBot = new DiscordBot()
discordBot.Login()