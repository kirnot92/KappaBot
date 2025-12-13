import OpenAI from "openai";
import { install } from "undici";
import * as Secret from "../../json/secret.json";
import { MessageContext } from "../type/types";

export default class OpenAIAPI
{
    private client: OpenAI ;

    constructor()
    {
        this.client = new OpenAI({ apiKey: Secret.OpenAIApiKey });
    }

    public async Request(instructions: string, messageHistory: MessageContext[]) : Promise<string>
    {
        var response = await this.client.responses.create(
        {
            model: "gpt-5.1",
            reasoning: { effort: "medium" },
            tools: [{ type: "web_search" }],
            tool_choice: "auto",
            instructions: instructions,
            input: messageHistory
        });

        return response.output_text;
    }   
}