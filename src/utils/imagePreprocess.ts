export interface PreprocessOptions {
  grayscale?: boolean;
  contrast?: number;
  brightness?: number;
  binarize?: boolean;
  threshold?: number;
  sharpen?: boolean;
  upscale?: number;
}

function toGrayscale(data: Uint8ClampedArray): void {
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = data[i + 1] = data[i + 2] = gray;
  }
}

function adjustContrast(data: Uint8ClampedArray, contrast: number, brightness: number): void {
  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const v = (data[i + c] - 128) * contrast + 128 + brightness;
      data[i + c] = Math.max(0, Math.min(255, Math.round(v)));
    }
  }
}

// 언샤프 마스크(Unsharp Mask) 선명화 - 3x3 라플라시안 커널
function applySharpen(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const src = ctx.getImageData(0, 0, w, h);
  const dst = ctx.createImageData(w, h);
  const s = src.data;
  const d = dst.data;
  // 언샤프 마스크 커널: center=5, 인접=-1
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = (y * w + x) * 4;
      for (let c = 0; c < 3; c++) {
        const v =
          5 * s[i + c]
          - s[((y - 1) * w + x) * 4 + c]
          - s[((y + 1) * w + x) * 4 + c]
          - s[(y * w + x - 1) * 4 + c]
          - s[(y * w + x + 1) * 4 + c];
        d[i + c] = Math.max(0, Math.min(255, v));
      }
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(dst, 0, 0);
}

function computeOtsuThreshold(data: Uint8ClampedArray): number {
  const hist = new Array(256).fill(0) as number[];
  let total = 0;
  for (let i = 0; i < data.length; i += 4) { hist[data[i]]++; total++; }
  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * hist[i];
  let sumB = 0, wB = 0, maxVariance = 0, threshold = 128;
  for (let t = 0; t < 256; t++) {
    wB += hist[t];
    if (wB === 0) continue;
    const wF = total - wB;
    if (wF === 0) break;
    sumB += t * hist[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const variance = wB * wF * (mB - mF) ** 2;
    if (variance > maxVariance) { maxVariance = variance; threshold = t; }
  }
  return threshold;
}

// 이미지가 이미 고대비(흑백 스캔)인지 판단 - 이진화 스킵 여부 결정
function isHighContrast(data: Uint8ClampedArray): boolean {
  let dark = 0, light = 0, total = 0;
  for (let i = 0; i < data.length; i += 4) {
    const v = data[i];
    if (v < 64) dark++;
    else if (v > 192) light++;
    total++;
  }
  return (dark + light) / total > 0.85;
}

function binarizeData(data: Uint8ClampedArray, threshold?: number): void {
  const t = threshold ?? computeOtsuThreshold(data);
  for (let i = 0; i < data.length; i += 4) {
    const v = data[i] > t ? 255 : 0;
    data[i] = data[i + 1] = data[i + 2] = v;
  }
}

export function preprocessImage(
  dataUrl: string,
  options: PreprocessOptions = {}
): Promise<string> {
  const {
    grayscale = true,
    contrast = 1.5,
    brightness = 5,
    binarize = true,
    sharpen = true,
    threshold,
    upscale = 2,
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width * upscale;
      canvas.height = img.height * upscale;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // 1. 선명화 (원본 컬러 상태에서 먼저 적용)
      if (sharpen) applySharpen(ctx, canvas.width, canvas.height);

      // 2. 그레이스케일
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      if (grayscale) toGrayscale(imageData.data);

      // 3. 대비/밝기
      if (contrast !== 1.0 || brightness !== 0) adjustContrast(imageData.data, contrast, brightness);

      // 4. 이진화 - 이미 고대비 이미지면 스킵
      if (binarize && !isHighContrast(imageData.data)) {
        binarizeData(imageData.data, threshold);
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}
