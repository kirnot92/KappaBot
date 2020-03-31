import ClientAPI from "./clientAPI";
import SystemAPI from "./systemAPI";
import {Client} from "discord.js";

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

