import OpenAI from "openai";
import * as Secret from "../../json/secret.json";
import { MemoryCandidatesV1, memoryCandidatesV1Format as MemoryCandidatesV1Format, MemoryPatchCandidate, MemoryPatchData, MemoryPatchFormat, MessageContext, UserMemoryCandidate } from "../type/types";
import Log from "./log";

export default class OpenAIAPI
{
    private client: OpenAI ;

    constructor()
    {
        this.client = new OpenAI({ apiKey: Secret.OpenAIApiKey });
    }

    public async Request(instructions: string, messageHistory: MessageContext[]) : Promise<string>
    {
        var response = await this.client.responses.create(
        {
            model: "gpt-5.1",
            reasoning: { effort: "medium" },
            tools: [{ type: "web_search" }],
            tool_choice: "auto",
            instructions: instructions,
            input: messageHistory
        });

        return response.output_text;
    }

    public async ExtractMemoryData(payload: string): Promise<MemoryCandidatesV1>
    {
        Log.Info("메모리 추출 시작.")

        const instructions = `
            당신은 Discord 채팅 로그에서 "사용자별 장기기억 후보"를 추출하는 엔진입니다.

            규칙:
            - 입력(messages)에 명시된 내용만 사용하십시오. 추론/창작/보강 금지.
            - 민감정보(주소, 전화번호, 이메일, 계정/결제정보, 주민번호류, 건강정보, 정확한 위치 등)는 절대 저장 후보로 만들지 마십시오.
            - 단발성/일시성(오늘 기분, 즉흥 농담, 한 번성 일정)은 기본적으로 제외하십시오.
            - 가치가 높은 지속 정보만 추출: (1) 안정적 사실, (2) 선호/말투/응답 스타일, (3) 지속 프로젝트/관심사, (4) 제약/금지, (5) 관계(지속적으로 반복되는 경우).
            - 모든 후보는 근거 message_id + 짧은 직접 인용(quote) 1~2개를 포함해야 합니다.
            - 확신이 낮으면 should_store=false로 두십시오.
            - 출력은 지정된 JSON 스키마를 정확히 따르십시오.
            `.trim();

        const inputPayload = payload; 
        const input = [
        {
            role: "user" as const,
            content: JSON.stringify(inputPayload),
        },
        ];

        const response = await this.client.responses.create(
        {
            model: "gpt-5.1",
            reasoning: { effort: "medium" },
            instructions,
            input,
            text: MemoryCandidatesV1Format
        });

        const extracted = JSON.parse(response.output_text) as MemoryCandidatesV1;
        Log.Info("메모리 추출 종료.")
        return extracted;
    }

    public async CreateMemoryPatch(memoryData: string, userMemoryCandidate: UserMemoryCandidate): Promise<MemoryPatchData>
    {
        Log.Info("메모리 패치 생성 시작.")
        const instructions = `
            당신은 "user_<id>.memory.json"를 갱신하기 위한 PATCH JSON(ops)을 생성합니다.
            목표는 "기존 파일을 직접 작성"하는 것이 아니라, 코드가 적용할 수 있는 "변경 오퍼레이션(add/update/delete)"만 제안하는 것입니다.

            입력에는 (1) 현재 메모리 json 텍스트(없을 수도 있음), (2) 새 메모리 요약 JSON(추출 결과)이 포함됩니다.

            절대 규칙:
            - 입력에 있는 evidence(quote/message_id)로 뒷받침되는 내용만 다루고, 추론/창작 금지.
            - 민감정보는 저장 금지. sensitivity="sensitive" 이거나 나이/미성년/정확한 위치/연락처/결제/건강 등은 ops를 만들지 말 것.
            - 후보 should_store=false 는 저장하지 말 것.
            - 동일 의미의 정보는 중복 add하지 말고 update를 우선한다.
            - 출력은 반드시 PATCH JSON 스키마를 정확히 따른다.

            json가 없는 경우 처리:
            - CURRENT_MEMORY_MD가 "(MISSING)" 또는 비어있으면, "신규 생성" 상황으로 간주한다.
            - 이 경우 update/delete는 절대 사용하지 말고, 필요한 항목은 모두 add로만 생성한다.
            - add는 id=null로 만든다.
            실제 최종 ID는 코드가 부여한다.

            json가 있는 경우 처리:
            - json에 동일 의미 항목이 있으면 add 대신 update를 우선한다.
            - update/delete는 반드시 기존 MD에 존재하는 id만 사용한다.
            - delete op의 text는 ""(빈 문자열)로 설정한다.

            섹션 매핑:
            - type=fact,relationship =>Facts
            - type=preference => Preferences
            - type=project => Projects
            - type=constraint => Constraints

            변경이 없으면 ops는 빈 배열로 출력한다.
            `.trim();

        const input =
        [
            {role: "user" as const, content: `다음은 json 파일 데이터입니다.\n\`\`\`json\n${memoryData}\n\`\`\``},
            {role: "user" as const, content: `다음은 메모리 후보군 데이터입니다. \n\`\`\`json\n${JSON.stringify(userMemoryCandidate)}\n\`\`\``},
        ];
        
        const response = await this.client.responses.create(
        {
            model: "gpt-5.1",
            reasoning: { effort: "medium" },
            instructions,
            input,
            text: MemoryPatchFormat
        });

        const data = JSON.parse(response.output_text) as MemoryPatchData;
        Log.Info("메모리 패치 생성 종료.")
        return data;
    }
}