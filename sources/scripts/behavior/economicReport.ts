import CommandRepository from "../procedure/commandRepository";
import String from "../extension/stringExtension";
import CommandContext from "./commandContext";
import Global from "../core/global";
import { IBehavior } from "./IBehavior";
import { LogicHalt } from "../core/assert";
import * as Command from "../../json/command.json"
import KappaScript from "../kappaScript/parser";
import { MessageContext } from "../type/types";

export class economicReport implements IBehavior
{
    channelId: string;

    constructor(channelId: string)
    {
        this.channelId = channelId;
    }

    public async Run()
    {
        const instructions =
        `
[역할]
당신은 크로스에셋 리서치 애널리스트입니다. 목표는 “주간 경제·시장 통합 리포트”입니다. 웹 검색으로 최신 정보를 확인하고, 모든 핵심 수치/사실/발언에는 반드시 [출처명, 문서/기사 제목, 게시/발표일]을 붙이세요. 사실/해석/가정을 분리하고, 전망은 조건부 시나리오로만 제시(단정·확률 수치화 금지). 불확실하면 “확인 필요”로 표기하고 확인 경로(기관/자료명)를 제시하세요.

[입력 변수]
- 기준시각: Asia/Seoul의 오늘
- 우선기간: 최근 7일, 보완: 30일(예외: 정책결정/분쟁/실적)
- 자산: 미국채(2Y/10Y/커브)·미국주식(S&P500/Nasdaq100)·한국(KOSPI/KOSDAQ/USDKRW/국채3Y·10Y 가능시)·원유(WTI/Brent)·금·AI/반도체(HBM/DRAM/NAND)
- 길이: 전체 900~1400자 내(필요 시 항목 축약)

[출처 우선순위/검증]
1차(최우선): BLS/BEA/Fed/EIA/OPEC/BoK/거래소/기업 IR·공시/IMF·WorldBank 등 공식.
2차: Reuters/FT/WSJ/Bloomberg 등 주요 매체(가능하면 2개 이상 교차).
충돌 시: (1차>2차) 원칙, 숫자·발표일은 1차 기준. 충돌 내용을 “불일치”로 명시.

[필수 데이터 체크]
미국(CPI/PCE core·고용·임금·PMI/ISM·FOMC 문서/발언·2Y/10Y·커브), 에너지(OPEC+/EIA 재고·공급리스크·가격반응), 금(금값·DXY/실질금리·리스크오프), 한국(수출/물가/고용·BoK/정책), AI/반도체(수요 vs 공급·HBM/패키징 병목·주요 기업 실적/가이던스).

[산출물 포맷(고정)]
(1) 10줄 요약(최대 10문장)
(2) 데이터 스냅샷 10개: 최근치/이전치/방향 + [출처…]
(3) 자산별 코멘트 6섹션: 각 5~8문장. “드라이버→전이경로→조건부 전망→반증 신호 1개”
(4) 시나리오 3개(베이스/상방/하방): 트리거 2개 + 반증 1개
(5) 다음 주 체크리스트 5개(발표·이벤트·모니터링)

[금지/주의]
근거 없는 인과·정치적 평가·투자지시 금지. 유료/접근불가 자료는 추정하지 말고 공개 대체 소스를 제시. 숫자·일정은 최신 확인 없으면 “확인 필요”.
        `;

        const msgs = await Global.Client.SendMessage(this.channelId,  "뉴스 생성 중...");
        const messageContext = { role: "user", content: "오늘(Asia/Seoul) 기준으로 최근 7일(보완 30일) 데이터를 우선해 “주간 경제·시장 통합 리포트”를 작성하세요. 디스코드에 업로드 되므로 디스코드의 마크다운 문법을 사용하고, 최대 2000자가 넘지 않도록 하십시오."} as MessageContext;
        const result = await Global.ChatGPT.Request(instructions, "gpt-5.2", 'high', [messageContext]);
        await Global.Client.SendMessage(this.channelId, result);
        await msgs[0].delete();
    }
}
