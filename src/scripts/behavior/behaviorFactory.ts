
import FileHandler from "../fileHandler";
import {Client} from "discord.js"
import { IBehavior } from "./IBehavior";
import { DoNothing } from "./doNothing";
import { Save } from "./save";
import { Reboot } from "./reboot";
import { Load } from "./load";
import { GetList } from "./getList";
import { Delete } from "./delete";
import { Date } from "./date";
export var exec = require('child_process').exec;

export default class BehaviorFactory
{
    static fileHandler: FileHandler = new FileHandler();

    static async Create(args: string[], authorId: string, channelId: string, bot: Client): Promise<IBehavior>
    {
        switch(args[0])
        {
            case "등록":
                return new Save(this.fileHandler, args, channelId);
            case "목록":
                return new GetList(this.fileHandler, channelId);
            case "언제":
                return new Date(this.fileHandler, args, channelId);
            case "삭제":
                return new Delete(this.fileHandler, args, channelId);
            case "재부팅":
                return new Reboot(authorId, bot);
            default:
                if (await this.fileHandler.IsValidCommand(channelId, args[0]))
                {
                    return new Load(this.fileHandler, args[0], channelId);
                }
                return new DoNothing(this.fileHandler);        }
    }
}