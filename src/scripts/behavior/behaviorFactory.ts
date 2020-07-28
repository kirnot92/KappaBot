
import { IBehavior } from "./IBehavior";
import { AddLine } from "./addLine";
import { Reboot } from "./reboot";
import { Load } from "./load";
import { GetList } from "./getList";
import { Delete } from "./delete";
import { Override } from "./override";
import { RemoveLastLine } from "./removeLastLine";
import * as Command from "../../json/command.json";
import { ServerStartedDate } from "./serverStartedDate";
import { Register } from "./register";
import { GetListDM } from "./getListDM";
import { AddBlacklist } from "./addBlacklist";
import { RemoveBlacklist } from "./removeBlacklist";
import { Search } from "./search";

export default class BehaviorFactory
{
    static Create(command: string, others: string, authorId: string, channelId: string): IBehavior
    {
        switch(command)
        {
            case Command.등록.Key:
                return new Register(others, channelId);
            case Command.추가.Key:
                return new AddLine(others, channelId);
            case Command.덮어쓰기.Key:
                return new Override(others, channelId);
            case Command.마지막줄삭제.Key:
                return new RemoveLastLine(others, channelId);
            case Command.목록.Key:
                return new GetList(channelId);
            case Command.목록디엠으로.Key:
                return new GetListDM(channelId, authorId);
            case Command.삭제.Key:
                return new Delete(others, channelId);
            case Command.재부팅.Key:
                return new Reboot(authorId, channelId);
            case Command.부팅시간.Key:
                return new ServerStartedDate(channelId);
            case Command.블랙리스트등록.Key:
                return new AddBlacklist(others, channelId, authorId);
            case Command.블랙리스트삭제.Key:
                return new RemoveBlacklist(others, channelId, authorId);
            case Command.검색.Key:
                return new Search(others, channelId);
            default:
                return new Load(command, channelId);
        }
    }
}