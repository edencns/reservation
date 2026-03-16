import type { Env } from '../_lib/db';
import { withAuth } from '../_lib/auth';

interface FieldDef {
  label: string;
  type: 'text' | 'date' | 'amount' | 'signature';
}

function classifyType(label: string): FieldDef['type'] {
  if (/날짜|일자|연월일|년.*월|계약일|작성일|기간/.test(label)) return 'date';
  if (/금액|금$|원$|비용|가격|계약금|잔금|총액|보증금|월세|대금/.test(label)) return 'amount';
  if (/서명|날인|싸인|sign/i.test(label)) return 'signature';
  return 'text';
}

function extractFields(fullText: string): FieldDef[] {
  const fields: FieldDef[] = [];
  const seen = new Set<string>();
  const lines = fullText.split('\n').map(l => l.trim()).filter(Boolean);

  for (const line of lines) {
    const colonMatch = line.match(/^([가-힣a-zA-Z ()（）]{1,15})[：:]\s*[_\s□]*$/);
    if (colonMatch) {
      const label = colonMatch[1].trim();
      if (label && label.length >= 2 && !seen.has(label)) {
        seen.add(label);
        fields.push({ label, type: classifyType(label) });
      }
      continue;
    }

    const underlineMatch = line.match(/^([가-힣a-zA-Z ()（）]{1,15})[：:]\s*_{3,}/);
    if (underlineMatch) {
      const label = underlineMatch[1].trim();
      if (label && !seen.has(label)) {
        seen.add(label);
        fields.push({ label, type: classifyType(label) });
      }
      continue;
    }

    if (/서명|날인|\(인\)|\(印\)/.test(line)) {
      const sigMatch = line.match(/([가-힣a-zA-Z]{1,10})\s*[（(]?[서날][명인]/);
      const label = sigMatch ? `${sigMatch[1]} 서명` : line.replace(/[_\s□]/g, '').slice(0, 10) || '서명';
      if (!seen.has(label)) {
        seen.add(label);
        fields.push({ label, type: 'signature' });
      }
      continue;
    }

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

/** POST /api/contract/analyze — 인증 필요 (관리자/업체) */
export const onRequestPost: PagesFunction<Env> = withAuth(async (context) => {
  try {
    const apiKey = context.env.GOOGLE_VISION_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: 'Google Vision API 키가 설정되지 않았습니다.' },
        { status: 503 }
      );
    }

    const { image } = await context.request.json() as { image: string };
    if (!image) {
      return Response.json({ error: '이미지가 없습니다.' }, { status: 400 });
    }

    const base64 = image.replace(/^data:image\/\w+;base64,/, '');

    const visionRes = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [{
            image: { content: base64 },
            features: [{ type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 }],
          }],
        }),
      }
    );

    if (!visionRes.ok) {
      const errText = await visionRes.text();
      return Response.json({ error: `Google Vision 오류: ${errText}` }, { status: 502 });
    }

    const visionData = await visionRes.json() as {
      responses: Array<{
        fullTextAnnotation?: { text: string };
        error?: { message: string };
      }>;
    };

    const response = visionData.responses?.[0];
    if (response?.error) {
      return Response.json({ error: `Vision API: ${response.error.message}` }, { status: 502 });
    }

    const fullText = response?.fullTextAnnotation?.text ?? '';
    if (!fullText) {
      return Response.json({ fields: [], rawText: '' });
    }

    const fields = extractFields(fullText);
    return Response.json({ fields, rawText: fullText });

  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
});
