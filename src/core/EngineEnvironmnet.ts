import Global from "./global";
import Application from "./application";
import {Client} from "discord.js";
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

        console.log("Bot Ready");
        Global.Client.SendMessage(Secret.DefaultChannelId, SystemMessage.RebootCompleted);

        this.application = new Application();
        this.application.Initialize(Global.System);
    }

    static async CreateClient(): Promise<Client>
    {
        var client = new Client();
        await client.login(Secret.Token);

        return client;
    }
}
