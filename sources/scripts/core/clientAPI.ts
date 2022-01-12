import {Client, User} from "discord.js";
import {MessageOptions} from "discord.js"
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
    {
        var channel = await this.GetChannel(channelId);
        await this.SendInternal(message, options, async (msg, option) => { await channel.send(msg) });
    }

    public async SendDirectMessage(userId: string, message: string,  options?: MessageOptions)
    {
        var user = await this.client.users.fetch(userId);

        await this.SendInternal(message, options, async (msg, option) => { await user.send(msg) });
    }
   
    public async SendInternal(
        message: string,
        options: MessageOptions,
        sendFunc: (msg: string, options?: MessageOptions) => {})
    {
        // 2000 넘는 메세지는 전송이 안 되서 쪼개서 보낸다.
        // file같은 options가 있는 경우, 한 번은 보내게 만든다
        var remains = message;

        while (remains.length != 0 || options != null)
        {
            var msg = remains.slice(0, 1500)
            remains = remains.slice(1500);
            await sendFunc(msg, options);

            options = null;
        }
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
}