import OpenAI from "openai";
import * as Secret from "../../json/secret.json";
import { MemoryCandidatesV1, memoryCandidatesV1Format as MemoryCandidatesV1Format, MemoryPatchCandidate, MemoryPatchData, MemoryPatchFormat, MessageContext, UserMemoryCandidate } from "../type/types";
import Log from "./log";
import { ReasoningEffort, ResponsesModel } from "openai/resources/shared";

export default class OpenAIAPI
{
    private client: OpenAI ;

    constructor()
    {
        this.client = new OpenAI({ apiKey: Secret.OpenAIApiKey });
    }

    public async Request(instructions: string, model: ResponsesModel, effort: ReasoningEffort, messageHistory: MessageContext[]) : Promise<string>
    {
        var response = await this.client.responses.create(
        {
            model: model,
            reasoning: { effort: effort },
            tools: [{ type: "web_search" }],
            tool_choice: "auto",
            instructions: instructions,
            input: messageHistory
        });

        return response.output_text;
    }
}