import Global from "./scripts/core/global";
import Application from "./scripts/core/application";
import Log from "./scripts/core/log";
import {Client} from "discord.js";
import * as Secret from "./json/secret.json";
import * as SystemMessage from "./json/systemMessage.json";
import WaitFor from "./scripts/core/waitFor";

class KappaEngine
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

        await Global.Client.SendMessage(Secret.DefaultChannelId, SystemMessage.RebootCompleted);

        this.application = new Application();
        this.application.Initialize();

        await this.MainLoop();
    }

    private static async MainLoop()
    {
        while (true)
        {
            await this.application.Update();
            await WaitFor.Seconds(1);
        }
    }
}

KappaEngine.Main();
