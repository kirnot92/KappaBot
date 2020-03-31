import SystemAPI from "./systemAPI";
import Global from "./global";
import Math from "../scripts/extension/mathExtension";
import String from "../scripts/extension/stringExtension";
import BackgroundJob from "../scripts/backgroundJob";
import BehaviorFactory from "../scripts/behavior/behaviorFactory";
import {Message} from "discord.js";
import {User} from "discord.js";
import {Channel} from "../scripts/extension/typeExtension";
import * as Playing from "../json/playing.json";
import * as Config from "../json/config.json";

export default class Application
{
    // 실제 사용자용 로직이 들어가는 클래스
    // Global 초기화 이후 불리므로 Global 쓸 수 있음
    // 상태도 가질 수 있다

    private currentActivityIndex: number = 0
    private activityList: Array<string>

    public Initialize(systemAPI: SystemAPI)
    {
        // 그냥 this.OnMessage를 넘기면 함수 내부의 this 참조가 고장난다
        // 그래서 람다로 한 번 더 감싸서 보내줘야 함...
        systemAPI.AddMessageListener((msg) => this.OnMessage(msg));
        this.InitializeActivity();
    }

    InitializeActivity()
    {
        this.activityList = new Array<string>();
        Playing.Message.forEach((elem: string) => { this.activityList.push(elem); });
        this.currentActivityIndex = Math.Range(0, this.activityList.length - 1);

        BackgroundJob.Run(async () =>
        {
            await this.SetNextActivitymessage();
        }, BackgroundJob.HourInterval);
    }

    async SetNextActivitymessage()
    {
        // 명령어 호출용 prefix를 달아서 호출 방법을 안내하게 하는 목적
        var currentActivity = Config.Prefix + this.activityList[this.currentActivityIndex];
        await Global.Client.SetActivity(currentActivity);
        this.currentActivityIndex = (this.currentActivityIndex + 1) % this.activityList.length;
    }

    async OnMessage(message: Message)
    {
        var content = message.content;
        var attachments = message.attachments.array();
        if (attachments.length != 0)
        {
            content = content + " " + attachments[0].url;
        }

        await this.HandleMessage(content, message.channel, message.author);
    }

    async HandleMessage(message: string, channel: Channel, author: User)
    {
        if (message.startsWith(Config.Prefix) && !author.bot)
        {
            var prefixRemoved = message.slice(Config.Prefix.length);
            var args = String.Slice([prefixRemoved], /\s|\n/, 1);
            var command = args[0];
            var others = args[1];

            var behavior = BehaviorFactory.Create(command, others, author.id, channel.id);

            // behavior가 직접 채널에 메세지를 쏘는 구조로 되어있다
            // 메세지를 리턴받아서 처리하는 방안을 고려해봤지만
            // Behavior 안에서 코드 시나리오가 완결되는 형태가 더 좋아보여서 이렇게 함
            await behavior.Run();
        }
    }
}