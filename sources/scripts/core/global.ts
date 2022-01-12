import ClientAPI from "./clientAPI";
import SystemAPI from "./systemAPI";
import TimeAPI from "./timeAPI";
import { Client } from "discord.js";

export default class Global
{
    public static Client: ClientAPI = null;
    public static System: SystemAPI = null;
    public static Time: TimeAPI = null;

    public static Initialize(client: Client)
    {
        // client의 기능을 전역적으로 쓰기 위함
        // 자세한 내용은 ClientAPI 내의 주석 참조
        this.Client = new ClientAPI(client);

        // 현재는 메세지 도착만을 랩핑해서 쓰기 위해 있다
        // 재부팅 같은 API와 관련 전역 상태도 들어가있음
        // 자세한 내용은 SystemAPI 내의 주석 참조
        this.System = new SystemAPI(client);

        this.Time = new TimeAPI();
    }
}

