import Global from "./global";
import Log from "./log";
import Math from "../extension/mathExtension";
import String from "../extension/stringExtension";
import BackgroundJob from "./backgroundJob";
import BehaviorFactory from "../behavior/behaviorFactory";
import { MessageReaction, Message, TextChannel, ThreadChannel, ThreadChannelTypes, PartialMessageReaction, PartialUser, ReactionEmoji, Guild, MessageAttachment } from "discord.js";
import { GuildEmoji, GuildMember, User } from "discord.js";
import { CommandNotFoundError, InvaildUsageError  } from "./assert";
import * as Playing from "../../json/playing.json";
import * as Command from "../../json/command.json";
import * as Secret from "../../json/secret.json";
import BlacklistRepository from "../procedure/blacklistRepository";
import EmojiRoleRepository from "../procedure/emojiRoleRepository";
import Prefix from "../procedure/prefix";
import { AskChatGPT } from "../behavior/askChatGPT";
import {MessageContext} from "../type/types";
import { MemoryCollect, MemoryCollectRunner } from "../behavior/memoryCollect";
import CommandRepository from "../procedure/commandRepository";

export default class Application
{
    // 실제 사용자용 로직이 들어가는 클래스
    // Global 초기화 이후 불리므로 Global 쓸 수 있음
    // 상태도 가질 수 있다

    private currentActivityIndex: number = 0
    private activityList: Array<string>
    private memoryCollectRunner: MemoryCollectRunner;

    public Initialize()
    {
        // 그냥 this.OnMessage를 넘기면 함수 내부의 this 참조가 고장난다
        // 그래서 람다로 한 번 더 감싸서 보내줘야 함...
        Global.System.AddMessageListener((msg) =>  this.OnChannelMessage(msg));
        Global.System.AddMessageListener((msg) =>  this.OnDirectMessage(msg));
        Global.System.AddMessageReactionAdd((msg, user) => this.OnMessageReactionAdd(msg, user));
        Global.System.AddMessageReactionRemove((msg, user) => this.OnMessageReactionRemove(msg, user));
        this.InitializeActivity();

        Log.Info("Application Initialized");
        this.memoryCollectRunner = new MemoryCollectRunner();
    }

    public async Update(): Promise<void>
    {
        // do nothing
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
        var currentActivity = Prefix.First + this.activityList[this.currentActivityIndex];
        await Global.Client.SetActivity(currentActivity);
        this.currentActivityIndex = (this.currentActivityIndex + 1) % this.activityList.length;
    }

    async OnMessageReactionAdd(msgReaction: MessageReaction|PartialMessageReaction, user: User|PartialUser)
    {
        var origMessage = msgReaction.message;
        var channelType = origMessage.channel.type;
        var author = origMessage.author;
        if ((author != null && !author.bot) || user.bot)
        {
            return;
        }

        if (channelType == "GUILD_TEXT"
            || channelType == "GUILD_NEWS_THREAD"
            || channelType ==  "GUILD_PUBLIC_THREAD" 
            || channelType == "GUILD_PRIVATE_THREAD")
        {
            var emoji = msgReaction.emoji;
            var guild = origMessage.guild;
            await this.HandleReaction(emoji, guild, user, true);
        }
    }

    async OnMessageReactionRemove(msgReaction: MessageReaction|PartialMessageReaction, user: User|PartialUser)
    {
        var origMessage = msgReaction.message;
        var channelType = origMessage.channel.type;

        if ((origMessage.author != null && !origMessage.author.bot) || user.bot)
        {
            return;
        }

        if (channelType == "GUILD_TEXT"
            || channelType == "GUILD_NEWS_THREAD"
            || channelType ==  "GUILD_PUBLIC_THREAD" 
            || channelType == "GUILD_PRIVATE_THREAD")
        {
            var emoji = msgReaction.emoji;
            var guild = origMessage.guild;
            await this.HandleReaction(emoji, guild, user, false);
        }
    }

    async HandleReaction(emoji: GuildEmoji|ReactionEmoji, guild: Guild|null, user: User|PartialUser, isAdd: boolean)
    {
        if (guild == null || emoji.name == null)
        {
            return;
        }

        if (await EmojiRoleRepository.HasRole(guild.id, emoji.name))
        {
            var member = await guild.members.fetch(user.id) as GuildMember;
            var roleName = await EmojiRoleRepository.GetRole(guild.id, emoji.name);
            var alreadyHasRole = member.roles.cache.find((r: any) => r.name == roleName) != null;
            var role = guild.roles.cache.find((r: any) => r.name == roleName);

            if (role == null)
            {
                return;
            }

            if (isAdd && !alreadyHasRole)
            {
                await member.roles.add(role.id);
            }
            if (!isAdd && alreadyHasRole)
            {
                await member.roles.remove(role.id);
            }
        }
    }

    async OnDirectMessage(message: Message)
    {
    }

    async OnChannelMessage(message: Message)
    {
        if (message.channel.type == "GUILD_TEXT"
            || message.channel.type == "GUILD_NEWS_THREAD"
            || message.channel.type ==  "GUILD_PUBLIC_THREAD" 
            || message.channel.type == "GUILD_PRIVATE_THREAD")
        {
            var content = message.content;
            var channelId = message.channel.id;
            var guildId = message.guildId;

            if (Prefix.IsCallChatGPT(content))
            {
                await this.HandleChatGPT(message);
            }
            else
            {
                var attachments = Array.from(message.attachments.values());
                await this.HandleMessage(content, attachments, channelId, message.author, guildId);
            }

            if (await CommandRepository.IsExists(channelId, "readme.md"))
            {
                await this.HandleChatCollection(message);
            }
        }
    }

    async HandleChatGPT(message: Message)
    {
        var messages = await this.FetchSortedMessages(message, 50);
        var content = message.content;
        var author = message.author;
        var channelId = message.channel.id;

        try
        {
            var inputs = new Array<MessageContext>();
            for (var msg of messages)
            {
                if (msg.author.bot && msg.author.id == Global.Client.GetMyId())
                {
                    inputs.push({role:"assistant", content: msg.content});
                }
                else
                {
                    inputs.push({role:"user", content: `${msg.author.username}:${msg.content}`});
                }
            }

            const askChatGPTBehavior = new AskChatGPT(content, author, channelId, inputs);
            await askChatGPTBehavior.Run();
        }
        catch (error)
        {
            this.HandleError(error, content, channelId);
        }
    }

    async HandleChatCollection(message: Message)
    {
        var messages = await this.FetchSortedMessages(message, 100);
        var content = message.content;
        var channelId = message.channel.id;

        try
        {
            this.memoryCollectRunner.TryRun(channelId, async () =>
            {
                const memoryCollectBehavior = new MemoryCollect(messages, message, channelId);
                await memoryCollectBehavior.Run();
            });
        }
        catch (error)
        {
            this.HandleError(error, content, channelId);
        }
    }

    async FetchSortedMessages(message: Message, limit: number): Promise<Message<boolean>[]>
    {
        var msgs = await message.channel.messages.fetch({ limit: limit });
        var sorted = ([...msgs.values()].sort((a, b) => a.createdTimestamp - b.createdTimestamp))
        return sorted;
    }

    async HandleMessage(message: string, attachments: MessageAttachment[], channelId: string, author: User|PartialUser, guildId: string|null)
    {
        if (await BlacklistRepository.IsBlackList(author.id))
        {
            return;
        }

        if (Prefix.IsJustBunchOfPrefix(message) && message.length != 1)
        {
            return;
        }

        if (Prefix.IsCommandMessage(message) && !author.bot)
        {
            // $만 입력한 경우
            if (message.length == 1) 
            {
                message = "$도움말";
            }

            var prefixRemoved = message.slice(Prefix.First.length);
            var args = String.Slice([prefixRemoved], /\s|\n/, 1);
            var command = args[0];
            var others = args[1];

            try
            {
                // behavior가 직접 채널에 메세지를 쏘는 구조로 되어있다
                // 메세지를 리턴받아서 처리하는 방안을 고려해봤지만
                // Behavior 안에서 코드 시나리오가 완결되는 형태가 더 좋아보여서 이렇게 함
                // 이렇게 해보니까 결과값을 DM으로 보내기도 편한듯
                var behavior = BehaviorFactory.Create(command, attachments, others, author.id, channelId, guildId);

                await behavior.Run();
            }
            catch (error)
            {
                this.HandleError(error, message, channelId);
            }
        }
    }

    async HandleError(error: any, message: string,  channelId: string)
    {
        if (error instanceof InvaildUsageError)
        {
            var messageInvaildUsageError = error as InvaildUsageError;
            var key = messageInvaildUsageError.Key;

            await Global.Client.SendMessage(channelId, this.GetUsageHelp(key));
        }
        else if (error instanceof CommandNotFoundError)
        {   
            var msg = "명령어를 찾지 못했습니다. '" + Prefix.First + "도움말'을 입력해보세요.";

            await Global.Client.SendMessage(channelId, msg);
        }
        else
        {
            var channelTag = "<#" + channelId + ">";
            var msg =  channelTag + "에서 에러가 발생했습니다.\n메세지: " + message + "\n```" + error.stack + "```";

            await Global.Client.SendDirectMessage(Secret.AdminId, msg);
        }
    }

    GetDefaultHelp(): string
    {
        var content = "기본 명령어\n";
        var commands = Command as any;
        for (var key in Command)
        {
            if (commands[key].IsHidden) { continue; }
            content = content + Prefix.First + commands[key].Usage + "\n";
        }
        return content;
    }

    GetUsageHelp(key: string): string
    {
        var commands = Command as any;
        var command = commands[key];
        return key + " 명령어의 사용법입니다.\n" +  Prefix.First + command.Usage;
    }
}