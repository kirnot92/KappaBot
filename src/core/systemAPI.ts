import {Message} from "discord.js";
import {Client} from "discord.js";

export default class SystemAPI
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