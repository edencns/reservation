import { createWorker } from 'tesseract.js';

export type OcrProgressCallback = (progress: number, status: string) => void;

export async function runOcr(images: string[], onProgress?: OcrProgressCallback): Promise<string> {
  onProgress?.(2, 'OCR 엔진 초기화 중...');

  const worker = await createWorker('kor+eng', 1, {
    logger: (m: { status: string; progress: number }) => {
      if (m.status === 'loading tesseract core') {
        onProgress?.(5, 'OCR 코어 로딩 중...');
      } else if (m.status === 'initializing tesseract') {
        onProgress?.(10, 'OCR 초기화 중...');
      } else if (m.status === 'loading language traineddata') {
        onProgress?.(15, '한국어 언어 데이터 로딩 중...');
      } else if (m.status === 'initialized tesseract') {
        onProgress?.(20, 'OCR 준비 완료');
      } else if (m.status === 'recognizing text') {
        // per-page progress is 20..85
        onProgress?.(20 + m.progress * 65, 'OCR 텍스트 인식 중...');
      }
    },
  });

  const texts: string[] = [];
  for (let i = 0; i < images.length; i++) {
    const { data: { text } } = await worker.recognize(images[i]);
    texts.push(text);
  }

  await worker.terminate();
  onProgress?.(88, '텍스트 인식 완료');
  return texts.join('\n\n--- 페이지 구분 ---\n\n');
}
