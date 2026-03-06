interface Env {
  AI: Ai;
}

interface FieldDef {
  label: string;
  type: 'text' | 'date' | 'amount' | 'signature';
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { image } = await context.request.json() as { image: string };
    if (!image) {
      return new Response(JSON.stringify({ error: '이미지가 없습니다.' }), { status: 400 });
    }

    const base64 = image.replace(/^data:image\/\w+;base64,/, '');
    const imageBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

    const prompt = `이것은 한국어 계약서 양식 이미지입니다.
이 양식에서 사용자가 직접 작성해야 하는 모든 빈칸 필드를 찾아주세요.

찾아야 할 것:
- 밑줄(___)이나 빈 줄로 표시된 입력 영역
- "성명:", "이름:", "주소:", "연락처:", "금액:", "날짜:" 등의 레이블 뒤 빈칸
- "서명", "인", "날인", "(인)" 표시가 있는 서명 영역
- 네모 박스(□) 형태의 입력 칸

각 필드에 대해 다음 JSON 형식으로 반환해주세요:
[
  {"label": "한글 필드명", "type": "text"},
  {"label": "계약 날짜", "type": "date"},
  {"label": "계약금액", "type": "amount"},
  {"label": "고객 서명", "type": "signature"}
]

type 규칙:
- 날짜 입력: "date"
- 금액/숫자 입력: "amount"
- 서명/날인: "signature"
- 나머지 모든 텍스트: "text"

반드시 JSON 배열만 반환하고 다른 설명은 포함하지 마세요.`;

    const response = await context.env.AI.run(
      '@cf/meta/llama-3.2-11b-vision-instruct' as Parameters<Ai['run']>[0],
      {
        image: [...imageBytes],
        prompt,
        max_tokens: 1024,
      }
    );

    const text = (response as { response: string }).response?.trim() ?? '';
    let fields: FieldDef[] = [];

    const jsonMatch = text.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]) as unknown[];
        fields = parsed.filter(
          (f): f is FieldDef =>
            typeof f === 'object' && f !== null &&
            'label' in f && typeof (f as FieldDef).label === 'string' &&
            'type' in f && ['text', 'date', 'amount', 'signature'].includes((f as FieldDef).type)
        );
      } catch {
        // JSON parse 실패 시 빈 배열 반환
      }
    }

    return new Response(JSON.stringify({ fields }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
