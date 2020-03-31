
import {Client, Message, User} from "discord.js";
import * as Config from "./json/config.json";
import {MessageOptions, RichEmbed, Attachment} from "discord.js"
import {Channel} from "./scripts/extension/typeExtension";
import * as Secret from "./json/secret.json";
import * as SystemMessage from "./json/systemMessage.json";
import String from "./scripts/extension/stringExtension";
import BehaviorFactory from "./scripts/behavior/behaviorFactory";
import BackgroundJob from "./scripts/backgroundJob";
import * as Playing from "./json/playing.json";
import Math from "./scripts/extension/mathExtension";

class EngineEnvironmnet
{
    private static client: Client;
    private static application: Application;

    public static async Main()
    {
        this.client = await this.CreateClient();

        Global.Initialize(this.client);

        this.application = new Application();
        this.application.Initialize(Global.System);
    }

    private static async CreateClient(): Promise<Client>
    {
        var client = new Client();

        // 여기서는 그냥 client 자체로 하드코딩
        // on ready에 하는거나 login 이후 적는거나 큰 차이는 없지만
        // 기분내기 용도로 on ready에 적음
        client.on("ready", async () =>
        {
            console.log("Bot Ready");
            var defaultChannel = (client.channels.get(Secret.DefaultChannelId)) as Channel;
            defaultChannel.send(SystemMessage.RebootCompleted);
        })

        await client.login(Secret.Token);

        return client;
    }
}

EngineEnvironmnet.Main();

class Application
{
    // 실제 사용자용 로직이 들어가는 클래스
    // Global 초기화 이후 불리므로 Global 쓸 수 있음
    // 상태도 가질 수 있다
   
    private currentActivityIndex: number = 0
    private activityList: Array<string>

    public Initialize(systemAPI: SystemAPI)
    {
        systemAPI.AddMessageListener(this.OnMessage);
        this.InitializeActivity();
    }

    InitializeActivity()
    {
        this.activityList = new Array<string>();
        Playing.Message.forEach((elem: string) => { this.activityList.push(elem); });
        this.currentActivityIndex = Math.Range(0, this.activityList.length - 1);

        BackgroundJob.Run(async () =>
        {
            await this.SetNextActivitymessage();
        }, BackgroundJob.HourInterval);
    }

    async SetNextActivitymessage()
    {
        // 명령어 호출용 prefix를 달아서 호출 방법을 안내하게 하는 목적
        var currentActivity = Config.Prefix + this.activityList[this.currentActivityIndex];
        await Global.Client.SetActivity(currentActivity);
        this.currentActivityIndex = (this.currentActivityIndex + 1) % this.activityList.length;
    }

    async OnMessage(message: Message)
    {
        var content = message.content;
        var attachments = message.attachments.array();
        if (attachments.length != 0)
        {
            content = content + " " + attachments[0].url;
        }

        await this.HandleMessage(content, message.channel, message.author);
    }

    async HandleMessage(message: string, channel: Channel, author: User)
    {
        if (message.startsWith(Config.Prefix) && !author.bot)
        {
            var prefixRemoved = message.slice(Config.Prefix.length);
            var args = String.Slice([prefixRemoved], /\s|\n/, 1);
            var command = args[0];
            var others = args[1];

            // 최종적인 BF의 모양새는...
            // Result를 받지 않고 맨 밑에서 Global.SendMessage 하는 형태
            // 이러려면 channelId를 모두에게서 받아야겠네
            // 이거까지는 ok (보통 다 받고 있으니)
            var behavior = await BehaviorFactory.Create(command, others, author.id, channel.id, null);
            var result = await behavior.IsValid() ? await behavior.Result() : behavior.OnFail();
            await channel.send(result.Message, result.Options);
        }
    }
}

class ClientAPI
{
    // client의 기능을 global하게 제공하기 위한 용도
    // 채널을 얻어오기 위해 client를 가장 밑단까지 내려보내주거나 하는 것을 방지
    // 메세지의 결과를 최상단으로 다시 받아와서 channel.Send 하지 않고,
    // 결과가 나온 순간에 Global.Client.SendMessage 하는 모양새가 나을 것 같아서 이것도 같이 함

    private client: Client = null;
    constructor(client: Client)
    {
        this.client = client;
    }

    public async SendMessage(channel: Channel, message: string,  options?: MessageOptions | RichEmbed | Attachment)
    {
        await channel.send(message, options);
    }
    
    public SetActivity(message: string)
    {
        this.client.user.setActivity(message, {type: "PLAYING"});
    }

    public GetChannel(channelId: string): Channel
    {
        return (this.client.channels.get(channelId)) as Channel;
    }
}

class SystemAPI
{
    private messageHandlers: ((msg: Message) => Promise<void>)[];

    private client: Client = null;
    constructor(client: Client)
    {
        this.client = client;
        this.client.on("message", async (msg) => await this.OnMessage(msg))
    }

    async OnMessage(message: Message)
    {
        this.messageHandlers.forEach(async (handler) =>
        {
            await handler(message);
        })
    }

    public AddMessageListener(handler: (msg: Message) => Promise<void>)
    {
        this.messageHandlers.push(handler);
    }
}

export default class Global
{
    public static Client: ClientAPI = null;
    public static System: SystemAPI = null;

    public static Initialize(client: Client)
    {
        this.Client = new ClientAPI(client);
        this.System = new SystemAPI(client);
    }
}

