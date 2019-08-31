import {MessageOptions, RichEmbed, Attachment} from "discord.js"

export default class BehaviorResult
{
    constructor(message: string, options?: MessageOptions | RichEmbed | Attachment)
    {
        this.Message = message;
        this.Options = options;
    }

    public Message: string
    public Options?: MessageOptions | RichEmbed | Attachment
}