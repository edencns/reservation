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

// 체크박스 문자 패턴
const CHECKBOX_RE = /^[□☐☑✓○◯●■◆◇▶▷\[\]\(\)口]+$/;

// OCR 단어 목록에서 체크박스 후보 추출
function detectCheckboxFields(pages: OcrPageResult[]): TemplateField[] {
  const fields: TemplateField[] = [];
  pages.forEach((page, pageIdx) => {
    const { imageWidth, imageHeight } = page;
    page.words.forEach((word, wi) => {
      if (!CHECKBOX_RE.test(word.text.trim())) return;
      const bboxW = word.bbox.x1 - word.bbox.x0;
      const bboxH = word.bbox.y1 - word.bbox.y0;
      // 너무 큰 건 체크박스가 아님 (이미지 너비의 10% 이상)
      if (bboxW > imageWidth * 0.1) return;

      // 바로 뒤 단어를 레이블로 사용
      const nextWord = page.words[wi + 1];
      const label = nextWord?.text.trim() || '체크박스';

      fields.push({
        id: `cb_${pageIdx}_${wi}_${Date.now()}`,
        label,
        type: 'checkbox',
        value: '',
        bbox: {
          x: word.bbox.x0 / imageWidth * 100,
          y: word.bbox.y0 / imageHeight * 100,
          w: Math.max(bboxW / imageWidth * 100, 3),
          h: Math.max(bboxH / imageHeight * 100, 2),
          page: pageIdx,
        },
      });
    });
  });
  return fields;
}

// 필드 레이블을 OCR 단어 위치와 매칭
export function matchFieldsToPositions(
  fields: TemplateField[],
  pages: OcrPageResult[],
): TemplateField[] {
  const checkboxFields = detectCheckboxFields(pages);

  const matched = fields.map(field => {
    // 이미 bbox 있으면 유지
    if (field.bbox) return field;

    const normalLabel = field.label.replace(/[:\s()（）]/g, '').toLowerCase();
    if (!normalLabel) return field;

    for (let pageIdx = 0; pageIdx < pages.length; pageIdx++) {
      const { words, imageWidth, imageHeight } = pages[pageIdx];

      // 레이블 단어 찾기 (연속 단어 고려)
      let bestWord: OcrWord | null = null;
      for (let wi = 0; wi < words.length; wi++) {
        const w = words[wi];
        const wt = w.text.replace(/[:\s()（）]/g, '').toLowerCase();
        if (wt.length < 1) continue;
        if (normalLabel.includes(wt) || wt.includes(normalLabel)) {
          bestWord = w;
          break;
        }
        // 연속 두 단어 합쳐서 비교
        const w2 = words[wi + 1];
        if (w2) {
          const combined = (wt + w2.text.replace(/[:\s()（）]/g, '').toLowerCase());
          if (normalLabel.includes(combined) || combined.includes(normalLabel)) {
            bestWord = w;
            break;
          }
        }
      }

      if (!bestWord) continue;

      const { x0, y0, x1, y1 } = bestWord.bbox;
      const labelH = y1 - y0;
      // 입력 영역: 레이블 오른쪽부터 이미지 오른쪽 끝까지
      const inputX = x0 / imageWidth * 100;
      const inputY = (y0 - labelH * 0.15) / imageHeight * 100;
      // 레이블 오른쪽 끝에서 시작해 90%까지
      const inputStartX = x1 / imageWidth * 100 + 1;
      const inputW = Math.max(90 - inputStartX, 25);
      const inputH = Math.max(labelH / imageHeight * 100 * 1.4, 3);

      return {
        ...field,
        bbox: {
          x: field.type === 'signature' ? inputX : inputStartX,
          y: inputY,
          w: field.type === 'signature' ? Math.min(40, inputW) : inputW,
          h: field.type === 'signature' ? inputH * 3 : inputH,
          page: pageIdx,
        },
      };
    }
    return field;
  });

  // 체크박스 중복 제거 (기존 필드와 레이블 겹치면 스킵)
  const existingLabels = new Set(matched.map(f => f.label));
  const uniqueCheckboxes = checkboxFields.filter(cb => !existingLabels.has(cb.label));

  return [...matched, ...uniqueCheckboxes];
}
