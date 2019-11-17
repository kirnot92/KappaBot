
import {Client} from "discord.js"
import { IBehavior } from "./IBehavior";
import { AddLine } from "./addLine";
import { Reboot } from "./reboot";
import { Load } from "./load";
import { GetList } from "./getList";
import { Delete } from "./delete";
import { Date } from "./date";
import { Override } from "./override";
import { RemoveLastLine } from "./removeLastLine";
import * as Command from "../../json/command.json";

export var exec = require("child_process").exec;

export default class BehaviorFactory
{
    static async Create(args: string[], authorId: string, channelId: string, bot: Client): Promise<IBehavior>
    {
        switch(args[0])
        {
            case Command.등록.Key:
                return new AddLine(args, channelId);
            case Command.덮어쓰기.Key:
                return new Override(args, channelId);
            case Command.마지막줄삭제.Key:
                return new RemoveLastLine(args, channelId);
            case Command.목록.Key:
                return new GetList(channelId);
            case Command.언제.Key:
                return new Date(args, channelId);
            case Command.삭제.Key:
                return new Delete(args, channelId);
            case Command.재부팅.Key:
                return new Reboot(authorId, bot);
            default:
                return new Load(args, channelId);
        }
    }
}