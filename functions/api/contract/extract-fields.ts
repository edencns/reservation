interface Env {
  ANTHROPIC_API_KEY?: string;
}

interface FieldDef {
  label: string;
  type: 'text' | 'date' | 'amount' | 'signature';
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const apiKey = context.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: 'ANTHROPIC_API_KEY가 설정되지 않았습니다. Cloudflare 환경변수에 ANTHROPIC_API_KEY를 추가해주세요.' },
      { status: 503 }
    );
  }

  const { rawText } = await context.request.json() as { rawText: string };
  if (!rawText?.trim()) {
    return Response.json({ fields: [] });
  }

  const prompt = `다음은 계약서를 OCR로 인식한 텍스트입니다. 작성자가 직접 입력해야 하는 빈칸/밑줄/괄호 필드만 추출해주세요.

[OCR 텍스트]
${rawText.slice(0, 3000)}

규칙:
1. 입력이 필요한 빈칸, 밑줄(_____), 괄호( ), □ 표시 필드만 포함
2. 이미 채워진 텍스트, 조항 내용, 고정 문구는 제외
3. type 분류: date(날짜/일자/연월일), amount(금액/원/비용/계약금), signature(서명/날인/인/사인), text(나머지)
4. 중복 없이 추출

JSON 배열만 반환 (다른 설명 없이):
[{"label":"필드명","type":"text"}]`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return Response.json({ error: `Claude API 오류: ${err}` }, { status: 502 });
  }

  const data = await response.json() as {
    content: Array<{ type: string; text: string }>;
  };

  const text = data.content[0]?.text ?? '';
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    return Response.json({ fields: [] });
  }

  try {
    const fields = JSON.parse(jsonMatch[0]) as FieldDef[];
    return Response.json({ fields });
  } catch {
    return Response.json({ fields: [] });
  }
};
