import {Client, User} from "discord.js";
import {MessageOptions} from "discord.js"
import {RichEmbed} from "discord.js"
import {Attachment} from "discord.js"
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

    public async SendMessage(channelId: string, message: string,  options?: MessageOptions | RichEmbed | Attachment)
    {
        var channel = this.GetChannel(channelId);
        await channel.send(message, options);
    }

    public async SendDirectMessage(userId: string, message: string)
    {
        await this.client.users.get(userId).send(message);
    }

    public SetActivity(message: string)
    {
        this.client.user.setActivity(message, {type: "PLAYING"});
    }

    public GetChannel(channelId: string): Channel
    {
        return (this.client.channels.get(channelId)) as Channel;
    }

    public GetUser(userId: string): User
    {
        return (this.client.users.get(userId)) as User;
    }
}