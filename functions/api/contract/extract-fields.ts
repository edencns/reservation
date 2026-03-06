interface Env {
  ANTHROPIC_API_KEY?: string;
}

interface FieldDef {
  label: string;
  type: 'text' | 'date' | 'amount' | 'signature';
}

// ─── 폴백: 정규식 기반 필드 추출 ───────────────────────────────────────────
function classifyType(label: string): FieldDef['type'] {
  if (/날짜|일자|연월일|년.*월|계약일|작성일|기간|생년월일/.test(label)) return 'date';
  if (/금액|금$|원$|비용|가격|계약금|잔금|총액|보증금|월세|대금|공급가|부가세/.test(label)) return 'amount';
  if (/서명|날인|싸인|사인|sign/i.test(label)) return 'signature';
  return 'text';
}

function extractFieldsRegex(fullText: string): FieldDef[] {
  const fields: FieldDef[] = [];
  const seen = new Set<string>();
  const lines = fullText.split('\n').map(l => l.trim()).filter(Boolean);

  for (const line of lines) {
    // 패턴 1: "레이블:" 뒤에 빈칸/밑줄/아무것도 없는 경우
    const colonEmpty = line.match(/^([가-힣a-zA-Z\s()（）]{1,15})[：:]\s*[_\s□]*$/);
    if (colonEmpty) {
      const label = colonEmpty[1].trim();
      if (label.length >= 2 && !seen.has(label)) {
        seen.add(label);
        fields.push({ label, type: classifyType(label) });
      }
      continue;
    }

    // 패턴 2: "레이블:" 뒤에 밑줄 3개 이상
    const colonUnderline = line.match(/^([가-힣a-zA-Z\s()（）]{1,15})[：:]\s*_{3,}/);
    if (colonUnderline) {
      const label = colonUnderline[1].trim();
      if (label.length >= 2 && !seen.has(label)) {
        seen.add(label);
        fields.push({ label, type: classifyType(label) });
      }
      continue;
    }

    // 패턴 3: 서명/날인 영역
    if (/서명|날인|\(인\)|\(印\)/.test(line)) {
      const sigMatch = line.match(/([가-힣a-zA-Z]{1,10})\s*[（(]?[서날][명인]/);
      const label = sigMatch ? `${sigMatch[1]} 서명` : '서명';
      if (!seen.has(label)) {
        seen.add(label);
        fields.push({ label, type: 'signature' });
      }
      continue;
    }

    // 패턴 4: 년 월 일 날짜 필드
    if (/년\s*월\s*일/.test(line) && !line.includes(':')) {
      const dateMatch = line.match(/^([가-힣a-zA-Z\s]{1,15})/);
      const label = (dateMatch?.[1]?.trim() || '날짜').replace(/\s+/g, ' ');
      if (label.length >= 2 && !seen.has(label)) {
        seen.add(label);
        fields.push({ label, type: 'date' });
      }
    }
  }

  return fields;
}

// ─── Claude API 기반 필드 추출 ─────────────────────────────────────────────
async function extractFieldsClaude(rawText: string, apiKey: string): Promise<FieldDef[]> {
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
    throw new Error(`Claude API 오류: ${await response.text()}`);
  }

  const data = await response.json() as {
    content: Array<{ type: string; text: string }>;
  };

  const text = data.content[0]?.text ?? '';
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];

  return JSON.parse(jsonMatch[0]) as FieldDef[];
}

// ─── Handler ───────────────────────────────────────────────────────────────
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { rawText } = await context.request.json() as { rawText: string };
  if (!rawText?.trim()) {
    return Response.json({ fields: [], method: 'none' });
  }

  const apiKey = context.env.ANTHROPIC_API_KEY;

  if (apiKey) {
    try {
      const fields = await extractFieldsClaude(rawText, apiKey);
      return Response.json({ fields, method: 'llm' });
    } catch (err) {
      // Claude 실패 시 정규식 폴백
      const fields = extractFieldsRegex(rawText);
      return Response.json({ fields, method: 'regex', warning: String(err) });
    }
  }

  // API 키 없으면 정규식으로 처리
  const fields = extractFieldsRegex(rawText);
  return Response.json({ fields, method: 'regex' });
};
