import CommandRepository from "../procedure/commandRepository";
import Global from "../core/global";
import { IBehavior } from "./IBehavior";
import { MemoryExtractionPayload, MessageContext, ToMemoryJsonOptions } from "../type/types";
import { Collection, Message, PartialUser, User } from "discord.js";
import Log from "../core/log";
import { UserMemoryModifier } from "./userMemoryModifier";

export class MemoryCollectRunner
{
    private running = new Set<string>();
    private counter = new Map<string, number>();

    public async TryRun(channelId: string, task: () => Promise<void>)
    {
        const currentCount = (this.counter.get(channelId) ?? 0);
        const nextCount = (currentCount + 1) % 80;
        this.counter.set(channelId, nextCount);

        Log.Info(`메모리 카운터 ${channelId}:${currentCount}`);

        if (currentCount !== 0) 
        {
            return;
        }

        if (this.running.has(channelId))
        {
            Log.Info("이미 MemoryCollection이 실행중이기 때문에 스킵했습니다.");
            return;
        }

        this.running.add(channelId);
        
        try
        {
            await task();
        }
        finally
        {
            this.running.delete(channelId);
        }
    }
}

export class MemoryCollect implements IBehavior
{
    private msgs: Message<boolean>[];
    private triggerMessage: Message;
    private channelId: string;

    constructor(msgs: Message<boolean>[], triggerMessage: Message, channelId: string)
    {
        this.msgs = msgs;
        this.triggerMessage = triggerMessage;
        this.channelId = channelId;
    }

    public async Run()
    {
        var payload = this.ConvertMessagesToMessagePayload(this.msgs, this.triggerMessage);
        var response = await Global.ChatGPT.ExtractMemoryData(payload);

        for (const userData of response.per_user)
        {
            const userId = userData.user_id;
            const fileName = `user_${userId}.memory.json`;
            let prevMemory = ""

            if (userData.candidates.length == 0)
            {
                continue;
            }

            if (await CommandRepository.IsExists(Global.Constants.MemoryChannelId, fileName))
            {
                prevMemory = (await CommandRepository.Load(Global.Constants.MemoryChannelId, fileName)).Message;
            }

            const memoryPatch = await Global.ChatGPT.CreateMemoryPatch(prevMemory, userData);
            const userMemoryModifier =  new UserMemoryModifier(prevMemory);
            userMemoryModifier.ApplyPatch(memoryPatch);
            const newMemoryJson = userMemoryModifier.GetJsonString();

            await CommandRepository.Save(Global.Constants.MemoryChannelId, fileName, newMemoryJson);
        }
    }

    private ConvertMessagesToMessagePayload(
        msgs: Message<boolean>[],
        triggerMessage: Message,
        opts: ToMemoryJsonOptions = {}
        ): string
    {
        const payload = this.msgsToMemoryExtractionPayload(msgs, triggerMessage, opts);
        return JSON.stringify(payload);
    }

    private msgsToMemoryExtractionPayload(
        msgs: Message<boolean>[],
        triggerMessage: Message,
        opts: ToMemoryJsonOptions = {}
        ): MemoryExtractionPayload
    {
        const {
            includeBotMessages = false,
            useCleanContent = true,
            includeAttachmentUrlsWhenNoText = true,
        } = opts;

        // Collection은 순서가 보장되지 않으므로 timestamp 기준 정렬(오래된 -> 최신)
        const sorted = msgs;
        const messages: MemoryExtractionPayload["messages"] = [];
        const userIdSet = new Set<string>();

        for (const m of sorted) 
        {
            if (!includeBotMessages && m.author?.bot) continue;

            let content = useCleanContent ? m.cleanContent : m.content;
            content = (content ?? "").trim();

            if (!content && includeAttachmentUrlsWhenNoText && m.attachments?.size) {
            const urls = [...m.attachments.values()]
                .map((a) => a.url)
                .filter(Boolean);
            if (urls.length) content = `(attachment) ${urls.join(" ")}`;
            }

            // 완전 빈 메시지는 제거(스티커/임베드-only 등)
            if (!content) continue;

            messages.push({
            id: m.id,
            created_at: new Date(m.createdTimestamp).toISOString(),
            author_id: m.author.id,
            content,
            });

            userIdSet.add(m.author.id);
        }

        // 트리거 메시지 작성자도 포함(혹시 msgs에서 걸러졌을 수 있으므로)
        if (triggerMessage?.author?.id) userIdSet.add(triggerMessage.author.id);

        return {
            event: {
            guild_id: triggerMessage.guildId ?? null,
            channel_id: triggerMessage.channelId,
            message_id: triggerMessage.id,
            created_at: new Date(triggerMessage.createdTimestamp).toISOString(),
            },
            scope: {
            window: "last_100_messages",
            target_user_ids: [...userIdSet],
            },
            messages,
        };
    }
}
