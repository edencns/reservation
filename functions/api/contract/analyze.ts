import { Env } from '../_lib/db';

interface EnvWithAI extends Env {
  AI?: {
    run: (model: string, input: Record<string, unknown>) => Promise<unknown>;
  };
}

interface FieldDef {
  label: string;
  type: 'text' | 'date' | 'amount' | 'signature';
}

export const onRequestPost: PagesFunction<EnvWithAI> = async (context) => {
  try {
    if (!context.env.AI) {
      return Response.json(
        { error: 'AI 바인딩이 설정되지 않았습니다. Cloudflare 대시보드에서 Workers AI를 활성화해주세요.' },
        { status: 503 }
      );
    }

    const { image } = await context.request.json() as { image: string };
    if (!image) {
      return Response.json({ error: '이미지가 없습니다.' }, { status: 400 });
    }

    const base64 = image.replace(/^data:image\/\w+;base64,/, '');

    // 이미지 크기 체크 (base64 기준 ~4MB = 원본 ~3MB)
    if (base64.length > 4 * 1024 * 1024) {
      return Response.json(
        { error: '이미지가 너무 큽니다. 더 작은 이미지를 사용해주세요.' },
        { status: 413 }
      );
    }

    const imageBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

    const prompt = `이것은 한국어 계약서 양식 이미지입니다.
이 양식에서 사용자가 직접 작성해야 하는 모든 빈칸 필드를 찾아주세요.

찾아야 할 것:
- 밑줄(___)이나 빈 줄로 표시된 입력 영역
- "성명:", "이름:", "주소:", "연락처:", "금액:", "날짜:" 등의 레이블 뒤 빈칸
- "서명", "인", "날인", "(인)" 표시가 있는 서명 영역
- 네모 박스(□) 형태의 입력 칸

각 필드에 대해 다음 JSON 형식으로 반환해주세요:
[{"label": "한글 필드명", "type": "text|date|amount|signature"}]

type 규칙: 날짜→"date", 금액/숫자→"amount", 서명/날인→"signature", 나머지→"text"
JSON 배열만 반환하세요.`;

    const response = await context.env.AI.run('@cf/meta/llama-3.2-11b-vision-instruct', {
      image: [...imageBytes],
      prompt,
      max_tokens: 1024,
    });

    const text = ((response as { response?: string }).response ?? '').trim();
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
        // JSON 파싱 실패 - 빈 배열 반환
      }
    }

    // AI가 응답했지만 필드를 찾지 못한 경우 raw 응답도 포함
    return Response.json({ fields, rawResponse: fields.length === 0 ? text : undefined });

  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
};
