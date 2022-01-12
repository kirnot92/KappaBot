import {MessageOptions} from "discord.js"

export default class CommandContext
{
    constructor(message: string, options?: MessageOptions)
    {
        this.Message = message;
        this.Options = options;
    }

    public Message: string
    public Options?: MessageOptions
}