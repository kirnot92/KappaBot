export type Role = "user" | "assistant";
export type MessageContext = { role: Role; content: string };