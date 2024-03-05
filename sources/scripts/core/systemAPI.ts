import {MessageReaction, Message, User, PartialMessageReaction, PartialUser, TextBasedChannel} from "discord.js";
import {Client} from "discord.js";
import * as Secret from "../../json/secret.json";
import LatestEmojiRoleMessage from "../procedure/LatestEmojiRoleMessage";
import Assert from "./assert.js";
import Log from "./log";

export default class SystemAPI
{
    private isRebootProgress: boolean = false;
    private messageHandlers: Array<(msg: Message) => Promise<void>>;
    private messageReactionAddHandlers: Array<(msgReaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => Promise<void>>;
    private messageReactionRemoveHandlers: Array<(msgReaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => Promise<void>>;
    private serverStartedDate: string;

    private client: Client;
    constructor(client: Client)
    {
        this.messageHandlers = new Array<(msg: Message) => Promise<void>>();
        this.messageReactionAddHandlers = new Array<(msgReaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => Promise<void>>();
        this.messageReactionRemoveHandlers = new Array<(msgReaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => Promise<void>>();

        this.client = client;
        this.client.on("ready", async () => await this.OnReady());
        this.client.on("messageCreate", async (msg) => {await this.OnMessage(msg)});
        this.client.on("messageReactionAdd", async (msgReaction, user) => {await this.OnMessageReactionAdd(msgReaction, user)});
        this.client.on("messageReactionRemove", async (msgReaction, user) => {await this.OnMessageReactionRemove(msgReaction, user)});
        this.serverStartedDate = Date().toString();

        Log.Info("Server Started At " + this.serverStartedDate);
    }

    async OnReady()
    {
        var guilds = this.client.guilds.cache.values();
        
        for (var guild of guilds)
        {
            var data = await LatestEmojiRoleMessage.TryRead(guild.id);
            if (data != null)
            {
                var channel = await this.client.channels.fetch(data.channelId) as TextBasedChannel;
                await channel.messages.fetch(data.msgId);
            }
        }
    }

    async OnMessage(message: Message)
    {
        // 이걸 한 번 리스트로 감싸고 별도로 등록하는 이유는
        // OnMessage 하나밖에 없으면 거기에서 계속 코드가 자라나게 됨
        // 메세지가 도착하는 순간에 하는 일들을 분리하기 위해 리스트로 감싼다

        // 또한 이렇게 핸들러 구현이 별도로 있는 경우에는,
        // 그 핸들러에 대고 시스템에서 자체적인 message를 보내거나 하는 것이 가능함
        // 시스템이 스스로에게 메세지를 보내는 기능을 하고싶어서 이렇게 분리함

        this.messageHandlers.forEach(async (handler) =>
        {
            await handler(message);
        })
    }

    public AddMessageListener(handler: (msg: Message) => Promise<void>)
    {
        this.messageHandlers.push(handler);
    }

    async OnMessageReactionAdd(msgReaction: MessageReaction | PartialMessageReaction, user: User | PartialUser)
    {
        this.messageReactionAddHandlers.forEach(async (handler) =>
        {
            await handler(msgReaction, user);
        })
    }

    public AddMessageReactionAdd(handler: (msgReaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => Promise<void>)
    {
        this.messageReactionAddHandlers.push(handler);
    }

    async OnMessageReactionRemove(msgReaction: MessageReaction | PartialMessageReaction, user: User | PartialUser)
    {
        this.messageReactionRemoveHandlers.forEach(async (handler) =>
        {
            await handler(msgReaction, user);
        })
    }

    public AddMessageReactionRemove(handler: (msgReaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => Promise<void>)
    {
        this.messageReactionRemoveHandlers.push(handler);
    }

    public Reboot()
    {
        Assert.IsFalse(this.isRebootProgress);

        this.isRebootProgress = true;

        this.TerminalCommand(Secret.RebootSequence, "재부팅이 실패했습니다.");
    }

    public TerminalCommand(str: string, errorMsg: string)
    {
        var cmd = require("child_process").exec;
        cmd(str, (err: any, stdout: any, stderr: any) =>
        {
            // client 가지고 있으니까 직접 채널을 가져오게 하자
            // 여기서 Global.Client를 가져오는 건 좀 찜찜함
            this.client.users.fetch(Secret.AdminId).then(user =>
            {
                if (err)
                {
                    user.send(errorMsg + " ```" + err.stack + "```");
                    this.isRebootProgress = false;
                }
                else
                {
                    // 이거 보내주면 출력 잘 나오나? 일단 시험삼아 넣음
                    user.send("Success. " + stdout);
                }
            });
        });
    }

    public IsRebootProgress(): boolean
    {
        return this.isRebootProgress;
    }

    public GetServerStartedDate(): string
    {
        return this.serverStartedDate;
    }

    public AddGivingRoleMessageId(msgId: string)
    {

    }
}