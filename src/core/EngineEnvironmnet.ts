import Global from "./global";
import Application from "./application";
import {Client} from "discord.js";
import {Channel} from "../scripts/extension/typeExtension";
import * as Secret from "../json/secret.json";
import * as SystemMessage from "../json/systemMessage.json";

export class EngineEnvironmnet
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

    static async CreateClient(): Promise<Client>
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
        });

        await client.login(Secret.Token);

        return client;
    }
}
