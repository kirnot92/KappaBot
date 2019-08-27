import Schedule, { RecurrenceRule, JobCallback, Job } from "node-schedule";
import File from "./file";
import Dictionary from "./dictionary";
import CommandHandler from "./handler"
import {Client, Channel, MessageOptions, TextChannel } from 'discord.js'

export default class ScheduleHandler
{
    commandHandler: CommandHandler
    onRunning: Dictionary<string, Schedule.Job> = new Dictionary<string, Schedule.Job>()
    client: Client

    constructor(fileHandler: CommandHandler, client: Client)
    {
        this.commandHandler = fileHandler;
        this.client = client;
    }

    public Parse(day: string): number
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

    public async LoadSchedule()
    {
        var fileNames = await File.ReadDir("./schedule/")

        for (var i=0; i < fileNames.length; ++i)
        {
            var fileName = fileNames[i].replace('.txt', '');
            var identifier, day, hour, others = fileName.split('.');
            var channelId = identifier;
            var command = await File.ReadFile('./schedule/' +fileName, "utf8");

            var jobCreater = await this.GetJobCreater(identifier, day, hour, command);
            jobCreater.Create(() =>
            {
                var msg = this.commandHandler.Handle(["$" + command], identifier)
                var channel = this.client.channels.get(channelId);
                var textChannel = (channel as TextChannel)
                textChannel.send(msg)
            })
        }
    }

    public GetRule(day: string, hour: string): RecurrenceRule
    {
        var rule = new Schedule.RecurrenceRule();
        rule.dayOfWeek =  this.Parse(day);
        rule.hour = parseInt(hour);
        rule.minute = 0
        return rule
    }

    public async AddJob(identifier: string, day: string, hour: string, command: string): Promise<JobCreater>
    {
        var path = "./schedule/" + identifier + "." + day + "." + hour
        await File.Write(path, command)

        return await this.GetJobCreater(identifier, day, hour, command);
    }

    public async GetJobCreater(identifier: string, day: string, hour: string, command: string): Promise<JobCreater>
    {
        var path = "./schedule/" + identifier + "." + day + "." + hour

        if (this.onRunning.ContainsKey(path))
        {
            var scheduleJob = this.onRunning.MustGet(path)
            scheduleJob.cancel()
        }

        var rule = this.GetRule(day, hour)
        return new JobCreater(rule, (job:Schedule.Job)=>
        {
            this.onRunning.Add(path, job);
        })
    }
}

export class JobCreater
{
    rule: RecurrenceRule
    onCreate: (job: Schedule.Job) => void

    constructor(rule: RecurrenceRule, onCreate: (job:Schedule.Job) => void)
    {
        this.rule = rule;
        this.onCreate = onCreate;
    }

    public Create(func: Function)
    {
        var job = Schedule.scheduleJob(this.rule, () => func());
        this.onCreate(job);
    }
}