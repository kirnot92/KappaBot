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
import { Help } from "./help";
import { LoadToDM } from "./loadToDM";
import { StartGivingRole } from "./startGivingRole";
import { AddRole } from "./addRole";
import { RemoveRole } from "./removeRole";

export default class BehaviorFactory
{
    public static Create(
        command: string,
        others: string,
        authorId: string,
        channelId: string,
        guildId: string): IBehavior
    {
        switch(command)
        {
            case Command.등록.Key:
            case Command.저장.Key:
                return new Register(others, channelId);
            case Command.추가.Key:
                return new AddLine(others, channelId);
            case Command.덮어쓰기.Key:
                return new Override(others, channelId);
            case Command.마지막줄삭제.Key:
                return new RemoveLastLine(others, channelId);
            case Command.목록.Key:
                // $목록 [검색할단어]로 잘못 치는 사람들이 많아서
                // args 통째로 한 번 검색해보고 있으면 Search로 넘김
                if (others != null && others.length != 0)
                {
                    return new Search(others, channelId);
                }
                else
                {
                    return new GetList(channelId);
                }
            case Command.목록디엠으로.Key:
            case Command.목록디엠.Key:
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
            case Command.도움말.Key:
            case Command.help.Key:
                return new Help(channelId);
            case Command.내용디엠.Key:
            case Command.내용디엠으로.Key:
                return new LoadToDM(others, channelId, authorId)
            case Command.역할부여시작.Key:
                return new StartGivingRole(guildId, channelId);
            case Command.역할추가.Key:
                return new AddRole(guildId, channelId, others);
            case Command.역할삭제.Key:
                return new RemoveRole(guildId, channelId, others);
            default:
                return new Load(command, channelId);
        }
    }
}