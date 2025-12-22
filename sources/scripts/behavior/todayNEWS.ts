import CommandRepository from "../procedure/commandRepository";
import String from "../extension/stringExtension";
import CommandContext from "./commandContext";
import Global from "../core/global";
import { IBehavior } from "./IBehavior";
import { LogicHalt } from "../core/assert";
import * as Command from "../../json/command.json"
import KappaScript from "../kappaScript/parser";
import { MessageContext } from "../type/types";

export class todayNEWS implements IBehavior
{
    command: string;
    channelId: string;

    constructor(command: string, channelId: string)
    {
        this.command = command;
        this.channelId = channelId;

        var hasValue = String.HasValue([this.command], Command.뉴스.ArgCount);
        if (!hasValue)
        {
            LogicHalt.CommandNotFound();
        }
    }

    public async Run()
    {
        const instructions =
        `
당신은 오늘의 뉴스를 만들어서 디스코드에 업로드하는 역할을 수행합니다.\n
오늘의 날짜(${Date.now()})를 참고하여, 최대한 오늘의 날짜에 가까운 정보를 모으세요.\n
출처가 올라온 날짜를 고려하여, 3일이 지난 정보는 반드시 제외하세요.\n
오늘 날짜로 올라온 정보는 반드시 하나가 포함되어야 합니다.\n
디스코드는 한 번에 최대 2000자까지 사용 가능하나, 너무 길어지지 않도록 주의하세요.\n
200자에서 600자 사이를 사용하세요.\n\n

링크의 경우, 반드시 다음과 같은 포멧을 사용하세요. 이외의 방식은 허용하지 않습니다.\n
[링크](<https://example.com/path>)\n\n

예시는 아래와 같습니다.
<input> http://naver.com\n
<output> [링크](<http://naver.com>)\n

제목은 다음과 같은 포멧을 사용하세요.\n
### 오늘의 뉴스 (MM월 DD일)\n\n

user가 입력하는 내용에 대해 웹 검색을 통해 면밀히 조사하여 채팅을 만드세요.\n
디스코드의 마크다운 문법을 활용하여 훌륭한 답변을 생성하세요.\n
하나의 항목에 1~5개의 이슈를 검색해야 하며, 전체 이슈 갯수는 3~7개가 되도록 하세요.\n
각 이슈는 하나의 문장에 정리되고, 끝에는 근거가 되는 링크가 붙습니다.\n\n
각 이슈에는 정보가 올라온 날짜를 기술합니다. 현재 날짜로부터 3일이 지난 정보는 제외하세요.
        `;
      
        const msgs = await Global.Client.SendMessage(this.channelId,  "뉴스 생성 중...");
        const messageContext = { role: "user", content: this.command} as MessageContext;
        const result = await Global.ChatGPT.Request(instructions, "gpt-5-mini", 'low', [messageContext]);
        await Global.Client.SendMessage(this.channelId, result);
        await msgs[0].delete();
    }

    private formatElapsed(ms: number): string
    {
        const totalSec = Math.floor(ms / 1000);
        const min = Math.floor(totalSec / 60);
        const sec = totalSec % 60;
        return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
    }
}
