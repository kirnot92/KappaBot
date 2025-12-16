import { ResponseCreateParams } from "openai/resources/responses/responses";

export type Role = "user" | "assistant";
export type MessageContext = { role: Role; content: string };
export type MemoryExtractionPayload = {
  event: {
    guild_id: string | null;
    channel_id: string;
    message_id: string;
    created_at: string; // ISO 8601 (UTC)
  };
  scope: {
    window: "last_100_messages";
    target_user_ids: string[];
  };
  messages: Array<{
    id: string;
    created_at: string; // ISO 8601 (UTC)
    author_id: string;
    content: string;
  }>;
};

export type ToMemoryJsonOptions = {
  /*
   * 기본 false: 봇 메시지는 제외
   */
  includeBotMessages?: boolean;

  /*
   * 기본 true: cleanContent 사용(멘션 등이 사람이 읽기 좋은 형태로)
   */
  useCleanContent?: boolean;

  /*
   * content가 비었고 첨부가 있으면 URL을 content에 포함(기본 true)
   */
  includeAttachmentUrlsWhenNoText?: boolean;
};

export type MemoryCandidateType =
  | "fact"
  | "preference"
  | "project"
  | "constraint"
  | "relationship";

export type Confidence = "low" | "medium" | "high";
export type Ttl = "7d" | "14d" | "30d" | "90d" | "permanent";
export type Sensitivity = "non_sensitive" | "sensitive";

export type Evidence = {
  message_id: string;
  quote: string;
};

export type MemoryPatchCandidate = {
  type: MemoryCandidateType;
  created_at: string;
  summary: string;
  confidence: Confidence;
  ttl: Ttl;
  sensitivity: Sensitivity;
  should_store: boolean;
  evidence: [Evidence] | [Evidence, Evidence];
};

export type Discarded = {
  text: string;
  reason: string;
};

export type UserMemoryCandidate = {
  user_id: string;
  candidates: MemoryPatchCandidate[];
  discarded: Discarded[];
};

export type MemoryCandidatesV1 = {
  schema_version: 1;
  per_user: UserMemoryCandidate[];
};

export const memoryCandidatesV1Format: ResponseCreateParams["text"] = {
  format: {
    type: "json_schema",
    name: "memory_candidates_v1",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["schema_version", "per_user"],
      properties: {
        schema_version: { type: "integer", enum: [1] },
        per_user: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["user_id", "candidates", "discarded"],
            properties: {
              user_id: { type: "string", minLength: 1 },
              candidates: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: [
                    "type",
                    "created_at",
                    "summary",
                    "confidence",
                    "ttl",
                    "sensitivity",
                    "should_store",
                    "evidence",
                  ],
                  properties: {
                    type: {
                      type: "string",
                      enum: ["fact", "preference", "project", "constraint", "relationship"],
                    },
                    created_at: { type: "string", format: "date-time", maxLength: 32 },
                    summary: { type: "string", minLength: 1, maxLength: 200 },
                    confidence: { type: "string", enum: ["low", "medium", "high"] },
                    ttl: { type: "string", enum: ["7d", "14d", "30d", "90d", "permanent"] },
                    sensitivity: { type: "string", enum: ["non_sensitive", "sensitive"] },
                    should_store: { type: "boolean" },
                    evidence: {
                      type: "array",
                      minItems: 1,
                      maxItems: 3,
                      items: {
                        type: "object",
                        additionalProperties: false,
                        required: ["message_id", "quote"],
                        properties: {
                          message_id: { type: "string", minLength: 1 },
                          quote: { type: "string", minLength: 1, maxLength: 160 },
                        },
                      },
                    },
                  },
                },
              },
              discarded: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["text", "reason"],
                  properties: {
                    text: { type: "string" },
                    reason: { type: "string", maxLength: 120 },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export const MemoryPatchFormat: ResponseCreateParams["text"] = {
    format: {
    type: "json_schema",
    name: "memory_patch_v1",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["schema_version", "user_id", "ops"],
      properties: {
        schema_version: { type: "integer", enum: [1] },
        user_id: { type: "string", minLength: 1 },
        ops: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: [
              "op",
              "section",
              "id",
              "updated_at",
              "text",
              "confidence",
              "ttl",
              "evidence",
              "reason"
            ],
            properties: {
              op: { type: "string", enum: ["add", "update", "delete"] },
              section: { type: "string", enum: ["StableFacts", "Preferences", "Projects", "Constraints"] },
              id: { anyOf: [{ type: "string", minLength: 1 }, { type: "null" }] },
              updated_at: { type: "string", format: "date-time", maxLength: 32 },
              text: { type: "string", maxLength: 220 },
              confidence: { type: "string", enum: ["low", "medium", "high"] },
              ttl: { type: "string", enum: ["7d", "14d", "30d", "90d", "permanent"] },
              evidence: {
                type: "array",
                minItems: 1,
                maxItems: 4,
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["message_id", "quote"],
                  properties: {
                    message_id: { type: "string", minLength: 1 },
                    quote: { type: "string", minLength: 1, maxLength: 160 }
                  }
                }
              },
              reason: { anyOf: [{ type: "string", maxLength: 160 }, { type: "null" }] }
            }
          }
        }
      }
    }
  }
}

export type MemoryPatchOperation = {
  op: "add" | "update" | "delete";
  section: "StableFacts" | "Preferences" | "Projects" | "Constraints";
  id: string | null;
  updated_at: string;
  text: string; // delete면 ""(빈 문자열) 권장
  confidence: "low" | "medium" | "high";
  ttl: Ttl;
  evidence: Array<{ message_id: string; quote: string }>;
  reason: string | null;
};

export type MemoryPatchData = {
  schema_version: 1;
  user_id: string;
  ops: MemoryPatchOperation[];
};

export type UserMemoryItem = {
  key: string; // e.g. "language_korean"
  text: string;
  updated_at: string;
  confidence: "low" | "medium" | "high";
  ttl: Ttl;
  evidence: Array<{ message_id: string; quote: string }>;
};

export type UserMemoryDiscarded = {
  text: string;
  reason: string;
};

export type UserMemory = {
  schema_version: 1;
  user_id: string;
  updated_at?: string; // ISO string
  items: {
    facts: UserMemoryItem[];
    preferences: UserMemoryItem[];
    projects: UserMemoryItem[];
    constraints: UserMemoryItem[];
  };
  discarded: UserMemoryDiscarded[];
};

export type ChatUserMessage = {
  user_id: string;
  display_name: string;
  text: string;
  created_at: string; 
};