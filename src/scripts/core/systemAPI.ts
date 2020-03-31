import {Message, User} from "discord.js";
import {Client} from "discord.js";
import * as Secret from "../../json/secret.json";
import Assert from "./assert.js";
import Log from "./log";


export default class SystemAPI
{
    private isRebootProgress: boolean = false;
    private messageHandlers: Array<(msg: Message) => Promise<void>>;
    private serverStartedDate: string;

    private client: Client = null;
    constructor(client: Client)
    {
        this.messageHandlers = new Array<(msg: Message) => Promise<void>>();
        this.client = client;
        this.client.on("message", async (msg) => await this.OnMessage(msg))
        this.serverStartedDate = Date().toString();

        Log.Info("Server Started At " + this.serverStartedDate);
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

    public Reboot()
    {
        Assert.IsFalse(this.isRebootProgress);

        this.isRebootProgress = true;

        var cmd = require("child_process").exec;
        cmd(Secret.RebootSequence, (err: any, stdout: any, stderr: any) =>
        {
            if (err)
            {
                // client 가지고 있으니까 직접 채널을 가져오게 하자
                // 여기서 Global.Client를 가져오는 건 좀 찜찜함
                var admin = this.client.users.get(Secret.AdminId) as User;
                admin.send("재부팅이 실패했습니다. ```" + err.stack + "```");
                this.isRebootProgress = false;
            }
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
}