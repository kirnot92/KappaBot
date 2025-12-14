import type { Collection, Message } from "discord.js";
import { MemoryExtractionPayload, ToMemoryJsonOptions } from "../type/types";

export function ConvertMessagesToMessagePayload(
  msgs: Collection<string, Message>,
  triggerMessage: Message,
  opts: ToMemoryJsonOptions = {}
): string {
  const payload = msgsToMemoryExtractionPayload(msgs, triggerMessage, opts);
  return JSON.stringify(payload);
}

/**
 * 테스트/로깅 용도로 객체 형태가 필요하면 이 함수를 쓰면 됩니다.
 */
export function msgsToMemoryExtractionPayload(
  msgs: Collection<string, Message>,
  triggerMessage: Message,
  opts: ToMemoryJsonOptions = {}
): MemoryExtractionPayload {
  const {
    includeBotMessages = false,
    useCleanContent = true,
    includeAttachmentUrlsWhenNoText = true,
  } = opts;

  // Collection은 순서가 보장되지 않으므로 timestamp 기준 정렬(오래된 -> 최신)
  const sorted = [...msgs.values()].sort(
    (a, b) => a.createdTimestamp - b.createdTimestamp
  );

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