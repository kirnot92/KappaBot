import Global from "./global";
import Application from "./application";
import Log from "./log";
import {Client} from "discord.js";
import * as Secret from "../json/secret.json";
import * as SystemMessage from "../json/systemMessage.json";

export class KappaEngine
{
    private static application: Application;

    public static async Main()
    {
        Log.Initialize();

        var client = new Client();
        await client.login(Secret.Token);
        Log.Info("Client Logged In");

        Global.Initialize(client);
        Log.Info("GlobalAPI Initialized");

        Global.Client.SendMessage(Secret.DefaultChannelId, SystemMessage.RebootCompleted);

        this.application = new Application();
        this.application.Initialize();
    }
}
