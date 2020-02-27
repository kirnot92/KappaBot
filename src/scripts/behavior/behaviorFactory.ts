
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
import { SelectRandom } from "./selectRandom";
import * as Command from "../../json/command.json";


export var exec = require("child_process").exec;

export default class BehaviorFactory
{
    static async Create(command: string, others: string, authorId: string, channelId: string, bot: Client): Promise<IBehavior>
    {
        switch(command)
        {
            case Command.등록.Key:
                return new AddLine(others, channelId);
            case Command.덮어쓰기.Key:
                return new Override(others, channelId);
            case Command.마지막줄삭제.Key:
                return new RemoveLastLine(others, channelId);
            case Command.목록.Key:
                return new GetList(channelId);
            case Command.언제.Key:
                return new Date(others, channelId);
            case Command.삭제.Key:
                return new Delete(others, channelId);
            case Command.재부팅.Key:
                return new Reboot(authorId, bot);
            case Command.랜덤.Key:
                return new SelectRandom(others);
            default:
                return new Load(command, channelId);
        }
    }
}