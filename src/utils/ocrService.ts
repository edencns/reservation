import { createWorker, PSM } from 'tesseract.js';
import type { TemplateField } from '../types';

export interface OcrWord {
  text: string;
  bbox: { x0: number; y0: number; x1: number; y1: number };
  confidence: number;
}

export interface OcrPageResult {
  text: string;
  words: OcrWord[];
  imageWidth: number;
  imageHeight: number;
}

export interface OcrResult {
  pages: OcrPageResult[];
  combinedText: string;
}

export type OcrProgressCallback = (progress: number, status: string) => void;

function getImageDimensions(dataUrl: string): Promise<{ w: number; h: number }> {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = dataUrl;
  });
}

export async function runOcr(images: string[], onProgress?: OcrProgressCallback): Promise<OcrResult> {
  onProgress?.(2, 'OCR 엔진 초기화 중...');

  const worker = await createWorker('kor+eng', 1, {
    logger: (m: { status: string; progress: number }) => {
      if (m.status === 'loading tesseract core') onProgress?.(5, 'OCR 코어 로딩 중...');
      else if (m.status === 'initializing tesseract') onProgress?.(10, 'OCR 초기화 중...');
      else if (m.status === 'loading language traineddata') onProgress?.(15, '한국어 언어 데이터 로딩 중...');
      else if (m.status === 'initialized tesseract') onProgress?.(20, 'OCR 준비 완료');
      else if (m.status === 'recognizing text') onProgress?.(20 + m.progress * 65, 'OCR 텍스트 인식 중...');
    },
  });

  await worker.setParameters({
    tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
    preserve_interword_spaces: '1',
  });

  const pages: OcrPageResult[] = [];
  for (let i = 0; i < images.length; i++) {
    onProgress?.(20 + (i / images.length) * 65, `페이지 ${i + 1}/${images.length} 인식 중...`);
    const { w: imageWidth, h: imageHeight } = await getImageDimensions(images[i]);
    const result = await worker.recognize(images[i]);
    const words: OcrWord[] = [];
    for (const block of result.data.blocks ?? []) {
      for (const para of block.paragraphs) {
        for (const line of para.lines) {
          for (const w of line.words) {
            if (w.text.trim()) {
              words.push({
                text: w.text,
                bbox: { x0: w.bbox.x0, y0: w.bbox.y0, x1: w.bbox.x1, y1: w.bbox.y1 },
                confidence: w.confidence,
              });
            }
          }
        }
      }
    }
    pages.push({ text: result.data.text, words, imageWidth, imageHeight });
  }

  await worker.terminate();
  onProgress?.(88, '텍스트 인식 완료');

  return {
    pages,
    combinedText: pages.map(p => p.text).join('\n\n--- 페이지 구분 ---\n\n'),
  };
}

// ─── 유틸 ────────────────────────────────────────────────────────────────────

const CHECKBOX_RE = /^[□☐☑✓✗○◯●■◆◇▣▢口\[\]]+$/;

function classifyFieldType(label: string): TemplateField['type'] {
  if (/날짜|일자|연월일|년.*월|계약일|작성일|기간|생년/.test(label)) return 'date';
  if (/금액|금$|원$|비용|가격|계약금|잔금|총액|보증금|월세|대금|공급가|부가세/.test(label)) return 'amount';
  if (/서명|날인|싸인|사인|sign/i.test(label)) return 'signature';
  return 'text';
}

/** OCR 단어들을 Y 좌표 기준으로 줄 단위로 그룹화 */
function groupWordsByLine(words: OcrWord[]): OcrWord[][] {
  if (words.length === 0) return [];
  const sorted = [...words].sort((a, b) => a.bbox.y0 - b.bbox.y0);
  const groups: OcrWord[][] = [];
  let cur: OcrWord[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const prev = cur[cur.length - 1];
    const avgH = ((prev.bbox.y1 - prev.bbox.y0) + (sorted[i].bbox.y1 - sorted[i].bbox.y0)) / 2;
    const prevMidY = (prev.bbox.y0 + prev.bbox.y1) / 2;
    const currMidY = (sorted[i].bbox.y0 + sorted[i].bbox.y1) / 2;
    if (Math.abs(currMidY - prevMidY) < avgH * 0.75) {
      cur.push(sorted[i]);
    } else {
      groups.push(cur);
      cur = [sorted[i]];
    }
  }
  groups.push(cur);
  return groups;
}

// ─── 메인: 위치 기반 필드 자동 감지 ─────────────────────────────────────────

/**
 * OCR 단어 위치 데이터만으로 입력 필드를 감지합니다.
 * - 줄 끝이 오른쪽 여백보다 일찍 끝나면 빈 공간(입력 필드)이라고 판단
 * - 체크박스 문자(□ 등) 위치에서 체크박스 필드 생성
 * - 서명/날인 패턴에서 서명 필드 생성
 */
export function detectFieldsFromWords(pages: OcrPageResult[]): TemplateField[] {
  const fields: TemplateField[] = [];
  const seen = new Set<string>();

  pages.forEach((page, pageIdx) => {
    const { words, imageWidth, imageHeight } = page;
    if (words.length === 0) return;

    const lines = groupWordsByLine(words);

    // 오른쪽 여백 기준: 상위 90% x1 값 (텍스트가 실제로 닿는 오른쪽 끝)
    const sorted = [...words].map(w => w.bbox.x1).sort((a, b) => a - b);
    const rightMargin = sorted[Math.floor(sorted.length * 0.9)] ?? imageWidth * 0.85;

    for (const line of lines) {
      line.sort((a, b) => a.bbox.x0 - b.bbox.x0);
      const lineText = line.map(w => w.text).join(' ').trim();
      const lineY0 = Math.min(...line.map(w => w.bbox.y0));
      const lineY1 = Math.max(...line.map(w => w.bbox.y1));
      const lineH = Math.max(lineY1 - lineY0, 12);
      const lastWord = line[line.length - 1];
      const lineEndX = lastWord.bbox.x1;

      // ── 체크박스 ──
      for (let wi = 0; wi < line.length; wi++) {
        const w = line[wi];
        if (!CHECKBOX_RE.test(w.text.trim())) continue;
        const boxW = w.bbox.x1 - w.bbox.x0;
        if (boxW > imageWidth * 0.08) continue;

        const nextW = line[wi + 1];
        const rawLabel = nextW?.text.replace(/[：:]/g, '').trim() || '체크박스';
        const key = `cb_${rawLabel}`;
        if (seen.has(key)) continue;
        seen.add(key);

        fields.push({
          id: `field_${Date.now()}_${pageIdx}_cb${wi}`,
          label: rawLabel,
          type: 'checkbox',
          value: '',
          bbox: {
            x: w.bbox.x0 / imageWidth * 100,
            y: w.bbox.y0 / imageHeight * 100,
            w: Math.max(boxW / imageWidth * 100, 2.5),
            h: Math.max(lineH / imageHeight * 100, 2),
            page: pageIdx,
          },
        });
      }

      // ── 서명 / 날인 ──
      if (/서명|날인|\(인\)|\(印\)/i.test(lineText)) {
        const m = lineText.match(/([가-힣a-zA-Z]{1,8})\s*(?:서명|날인)/);
        const label = m ? `${m[1]} 서명` : '서명';
        const key = `sig_${label}`;
        if (!seen.has(key)) {
          seen.add(key);
          fields.push({
            id: `field_${Date.now()}_${pageIdx}_sig`,
            label,
            type: 'signature',
            value: '',
            bbox: {
              x: line[0].bbox.x0 / imageWidth * 100,
              y: lineY0 / imageHeight * 100,
              w: 30,
              h: Math.max(lineH / imageHeight * 100 * 3.5, 5),
              page: pageIdx,
            },
          });
        }
        continue;
      }

      // ── 빈 칸 필드 (줄 끝이 오른쪽 여백에 닿지 않으면 뒤에 빈 공간이 있음) ──
      if (line.length > 6) continue; // 긴 줄은 본문 텍스트
      const gapRatio = (rightMargin - lineEndX) / rightMargin;
      if (gapRatio < 0.28) continue; // 빈 공간이 28% 미만이면 스킵

      // 레이블다운 끝 단어 확인
      const lastText = lastWord.text.trim();
      const endsLikeLabel =
        lastText.endsWith(':') || lastText.endsWith('：') ||
        lastText.endsWith('(') || lastText.endsWith('（') ||
        /[가-힣]$/.test(lastText);
      if (!endsLikeLabel && line.length > 3) continue;

      const rawLabel = lineText.replace(/[：:（(）)]\s*$/, '').trim();
      if (!rawLabel || rawLabel.length < 1 || rawLabel.length > 30) continue;

      // 숫자만이거나 일반 문장이면 스킵
      if (/^\d+[.)]$/.test(rawLabel)) continue;

      const key = `f_${rawLabel}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const type = classifyFieldType(rawLabel);
      const inputX = lineEndX / imageWidth * 100 + 1;
      const inputW = rightMargin / imageWidth * 100 - inputX;
      if (inputW < 5) continue;

      fields.push({
        id: `field_${Date.now()}_${pageIdx}_${lineY0}`,
        label: rawLabel,
        type,
        value: '',
        bbox: {
          x: inputX,
          y: lineY0 / imageHeight * 100 - 0.3,
          w: Math.max(inputW, 18),
          h: Math.max(lineH / imageHeight * 100 * 1.4, 3),
          page: pageIdx,
        },
      });
    }
  });

  return fields;
}

/** 이전 버전 호환용 – 레이블 텍스트로 위치 매칭 (detectFieldsFromWords의 보조) */
export function matchFieldsToPositions(
  fields: TemplateField[],
  pages: OcrPageResult[],
): TemplateField[] {
  return fields.map(field => {
    if (field.bbox) return field;
    const nl = field.label.replace(/[:\s()（）]/g, '').toLowerCase();
    for (let pi = 0; pi < pages.length; pi++) {
      const { words, imageWidth, imageHeight } = pages[pi];
      const found = words.find(w => {
        const wt = w.text.replace(/[:\s()（）]/g, '').toLowerCase();
        return wt.length >= 2 && (nl.includes(wt) || wt.includes(nl));
      });
      if (!found) continue;
      const { x1, y0, y1 } = found.bbox;
      const h = Math.max((y1 - y0) / imageHeight * 100 * 1.4, 3);
      const startX = x1 / imageWidth * 100 + 1;
      return { ...field, bbox: { x: startX, y: y0 / imageHeight * 100, w: Math.max(90 - startX, 20), h, page: pi } };
    }
    return field;
  });
}
