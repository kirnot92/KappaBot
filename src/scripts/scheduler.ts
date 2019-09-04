import { RecurrenceRule, Job, scheduleJob } from "node-schedule";
import File from "../scripts/promisifier/file";
import Dictionary from "../scripts/collection/dictionary";
import BehaviorFactory from "./behavior/behaviorFactory";
import {Client, Channel, MessageOptions, TextChannel } from 'discord.js'

export default class ScheduleHandler
{
    onRunning: Dictionary<string, Job> = new Dictionary<string, Job>();
    client: Client

    constructor(client: Client)
    {
        this.client = client;
    }

    public async 밖에서사용하는경우예제(identifier: string, day: string, hour: string, command: string)
    {
        await this.WriteSchedule(identifier, day, hour, command);
        await this.RegisterSchedule(identifier, day, hour, command);
    }

    public async LoadSchedule() // 부팅 시 한 번 불림
    {
        var fileNames = await File.ReadDir("./schedule/")
        for (var i=0; i < fileNames.length; ++i)
        {
            var fileName = fileNames[i].replace('.txt', '');
            var identifier, day, hour, others = fileName.split('.');
            var command = await File.ReadFile('./schedule/' + fileName, "utf8");
            await this.RegisterSchedule(identifier, day, hour, command);
        }
    }

    public async WriteSchedule(channelId: string, day: string, hour: string, command: string)
    {
        var path = "./schedule/" + channelId + "." + day + "." + hour
        await File.Write(path, command)
    }

    async RegisterSchedule(identifier: string, day: string, hour: string, command: string)
    {
        var jobCreater = await this.GetJobCreater(identifier, day, hour, command);
        jobCreater.Create(async () =>
        {
            var annonymousAuthorId = "-1";
            var behavior = await BehaviorFactory.Create([command], annonymousAuthorId, identifier, this.client);
            var message = await behavior.IsValid() ? await behavior.Result() : behavior.OnFail();

            var channel = (this.client.channels.get(identifier) as TextChannel);
            channel.send(message);
        });
    }

    GetRule(day: string, hour: string): RecurrenceRule
    {
        var rule = new RecurrenceRule();
        rule.dayOfWeek =  this.Parse(day);
        rule.hour = parseInt(hour.replace("시", ""));
        rule.minute = 0
        return rule
    }

    Parse(day: string): number
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
        }
    }

    async GetJobCreater(identifier: string, day: string, hour: string, command: string): Promise<JobCreater>
    {
        var path = "./schedule/" + identifier + "." + day + "." + hour

        if (this.onRunning.ContainsKey(path))
        {
            var scheduleJob = this.onRunning.MustGet(path)
            scheduleJob.cancel()
        }

        var rule = this.GetRule(day, hour)
        return new JobCreater(rule, (job:Job)=>
        {
            this.onRunning.Add(path, job);
        })
    }
}

export class JobCreater
{
    rule: RecurrenceRule
    onCreate: (job: Job) => void

    constructor(rule: RecurrenceRule, onCreate: (job:Job) => void)
    {
        this.rule = rule;
        this.onCreate = onCreate;
    }

    public Create(func: Function)
    {
        var job = scheduleJob(this.rule, () => func());
        this.onCreate(job);
    }
}