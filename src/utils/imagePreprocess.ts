export interface PreprocessOptions {
  grayscale?: boolean;
  contrast?: number;
  brightness?: number;
  binarize?: boolean;
  threshold?: number;
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

function computeOtsuThreshold(data: Uint8ClampedArray): number {
  const hist = new Array(256).fill(0) as number[];
  let total = 0;
  for (let i = 0; i < data.length; i += 4) {
    hist[data[i]]++;
    total++;
  }
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
    contrast = 1.8,
    brightness = 10,
    binarize = true,
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
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      if (grayscale) toGrayscale(imageData.data);
      if (contrast !== 1.0 || brightness !== 0) adjustContrast(imageData.data, contrast, brightness);
      if (binarize) binarizeData(imageData.data, threshold);
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}
