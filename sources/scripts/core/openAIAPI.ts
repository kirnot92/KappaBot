import OpenAI from "openai";
import { install } from "undici";
import * as Secret from "../../json/secret.json";

export default class OpenAIAPI
{
    private client: OpenAI ;

    constructor()
    {
        this.client = new OpenAI({ apiKey: Secret.OpenAIApiKey });
    }

    public async Request(input: string, instructions: string) : Promise<string>
    {
        var response = await this.client.responses.create(
        {
            model: "gpt-5.1",
            reasoning: { effort: "medium" },
            tools: [{ type: "web_search" }],
            tool_choice: "auto",
            instructions: instructions,
            input: input
        });

        return response.output_text;
    }   
}