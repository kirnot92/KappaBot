
import FileProcedure from "../Procedure/File";
import {Client} from "discord.js"
import { IBehavior } from "./IBehavior";
import { DoNothing } from "./DoNothing";
import { Save } from "./Save";
import { Reboot } from "./Reboot";
import { Load } from "./Load";
import { GetList } from "./GetList";
import { Delete } from "./Delete";
import { Date } from "./Date";
export var exec = require('child_process').exec;

export default class BehaviorFactory
{
    static async Create(args: string[], authorId: string, channelId: string, bot: Client): Promise<IBehavior>
    {
        switch(args[0])
        {
            case "등록":
                return new Save(args, channelId);
            case "목록":
                return new GetList(channelId);
            case "언제":
                return new Date(args, channelId);
            case "삭제":
                return new Delete(args, channelId);
            case "재부팅":
                return new Reboot(authorId, bot);
            default:
                if (await FileProcedure.IsValidCommand(channelId, args[0]))
                {
                    return new Load(args[0], channelId);
                }
                return new DoNothing();
        }
    }
}