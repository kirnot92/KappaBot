import { RecurrenceRule, Job, scheduleJob } from "node-schedule";
import * as Path from "path"
import File from "../scripts/promisifier/file";
import Dictionary from "../scripts/collection/dictionary";
import BehaviorFactory from "./behavior/behaviorFactory";
import {Client, Channel, MessageOptions, TextChannel } from "discord.js"
import String from "../scripts/extension/stringExtension";

const ROOT = Path.resolve(__dirname, "..", "..", "..")
const SCHEDULE_PATH = Path.join(ROOT, "schedule")

export default class ScheduleHandler
{
    onRunning: Dictionary<string, Job> = new Dictionary<string, Job>();
    client: Client

    constructor(client: Client)
    {
        this.client = client;
    }

    public async LoadSchedule() // 부팅 시 한 번 불림
    {
        var fileNames = await File.ReadDir(SCHEDULE_PATH);

        for (var i=0; i < fileNames.length; ++i)
        {
            var fileName = fileNames[i];
            var filePath = Path.join(SCHEDULE_PATH, fileName);
            var command = await File.ReadFile(filePath, "utf8");
            
            var identifier, day, hour, others = fileName.replace(".txt","").split(".");
            await this.RegisterSchedule(identifier, day, hour, command);
        }
    }

    async WriteSchedule(channelId: string, dayRaw: string, hourRaw: string, command: string)
    {
        var day = this.ParseDayOfWeek(dayRaw);
        var hour = this.ParseHour(hourRaw);
        var path = this.GetPath(channelId, day, hour);

        this.RegisterSchedule(channelId, day, hour, command);
       
        await File.Write(Path.join(SCHEDULE_PATH, path), command);
    }

    public RegisterSchedule(channelId: string, day: number, hour: number, command: string)
    {
        var rule = this.CreateRule(day, hour);

        var job = scheduleJob("* * * * *", async () =>
        {
            this.OnSchedule(channelId, command);
        });

        var path = this.GetPath(channelId, day, hour);
        
        if (this.onRunning.ContainsKey(path))
        {
            var runningJob = this.onRunning.MustGet(path);
            runningJob.cancel();
        }

        this.onRunning.Add(path, job);
    }

    async OnSchedule(channelId: string, command: string)
    {
        var annonymousAuthorId = "-1";
        var behavior = await BehaviorFactory.Create([command], annonymousAuthorId, channelId, this.client);
        var message = await behavior.IsValid() ? await behavior.Result() : behavior.OnFail();

        var channel = (this.client.channels.get(channelId) as TextChannel);
        channel.send(message);
        // 흑흑 샌드까지 되는데
    }

    GetPath(channelId: string, day: number, hour: number): string
    {
        return String.Join(".", channelId, day.toString(), hour.toString());
    }


    CreateRule(day: number, hour: number): RecurrenceRule
    {
        var rule = new RecurrenceRule();
        if (day != -1)
        {
            rule.dayOfWeek = day;
        }
        rule.hour = hour;
        //rule.minute = 0; 테스트로 임시

        return rule;
    }

    ParseDayOfWeek(day: string): number
    {
        switch(day)
        {
            case "월요일": return 1;
            case "화요일": return 2;
            case "수요일": return 3;
            case "목요일": return 4;
            case "금요일": return 5;
            case "토요일": return 6;
            case "일요일": return 7;
            case "월": return 1;
            case "화": return 2;
            case "수": return 3;
            case "목": return 4;
            case "금": return 5;
            case "토": return 6;
            case "일": return 7;
            case "매일": return -1;
        }
    }

    ParseHour(hour: string): number
    {
        return parseInt(hour.replace("시", ""));
    }
}