import * as path from "path"
import File from "../promisifier/file"
const ROOT = path.resolve(__dirname, "..", "..", "..")
const LATESTMSG = path.join(ROOT, "resources", "latestEmojiRoleMsg")

// 리액션을 받는 메세지의 경우 반드시 봇에 캐싱되어 있어야 한다.
// 봇이 껐다켜지는 경우 기존 메세지의 캐싱을 잃어버린다.
// 따라서 메세지 아이디를 저장해뒀다가 봇이 새로 뜰 때 로드하도록 한다.

export default class LatestEmojiRoleMessage
{
    public static async Regist(guildId: string, channelId: string, msgId: string)
    {
        if (!(await File.IsExists(LATESTMSG)))
        {
            File.MakeDir(LATESTMSG);
        }

        var path = this.GetPath(guildId);
        var content = channelId + "\n" + msgId
        await File.Write(path, content);
    }

    private static GetPath(guildId: string): string
    {
        return path.join(LATESTMSG, guildId + ".txt");
    }

    public static async TryRead(guildId: string): Promise<{channelId: string, msgId: string}|null>
    {
        var path = this.GetPath(guildId);
        if (await File.IsExists(path))
        {
            var raw = await File.ReadFile(path, "utf8");
            var splited = raw.split('\n');
            return {channelId: splited[0], msgId: splited[1]};
        }
        return null;
    }
}