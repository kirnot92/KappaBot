import {Client, Guild, User} from "discord.js";
import {Message, MessageOptions} from "discord.js"
import {Channel} from "../extension/typeExtension";

export default class ClientAPI
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

    public async SendMessage(channelId: string, message: string,  options?: MessageOptions)
        : Promise<Array<Message>>
    {
        var channel = await this.GetChannel(channelId);
        return await this.SendInternal(channel, message, options);
    }

    public async SendDirectMessage(userId: string, message: string,  options?: MessageOptions)
        : Promise<Array<Message>>
    {
        var dmChannel = await this.client.users.createDM(userId);
        return await this.SendInternal(dmChannel, message, options);
    }
   
    public async SendInternal(
        channel: Channel,
        message: string,
        options: MessageOptions): Promise<Array<Message>>
    {
        var msgs = new Array<Message>();

        if (options != null)
        {
            await channel.send(options);
        }
        
        var remains = message;
        do
        {
            // 2000 넘는 메세지는 전송이 안 되서 쪼개서 보낸다.
            var msgStr = remains.slice(0, 1500)
            remains = remains.slice(1500);
            var msg = await channel.send(msgStr);
            msgs.push(msg);
        } while (remains.length != 0);

        return msgs;
    }

    public SetActivity(message: string)
    {
        this.client.user.setActivity(message, {type: "PLAYING"});
    }

    public async GetChannel(channelId: string): Promise<Channel>
    {
        return await (this.client.channels.fetch(channelId)) as Channel;
    }

    public async GetUser(userId: string): Promise<User>
    {
        return await (this.client.users.fetch(userId)) as User;
    }

    public GetGuild(guildId: string): Guild
    {
        return this.client.guilds.cache.get(guildId);
    }
}