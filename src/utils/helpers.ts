export const generateId = (): string =>
  Date.now().toString(36) + Math.random().toString(36).substring(2, 8);

export const generateSlug = (): string =>
  Math.random().toString(36).substring(2, 10);

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
};

export const formatDateTime = (isoStr: string): string => {
  const d = new Date(isoStr);
  return d.toLocaleString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatPhone = (phone: string): string => {
  const c = phone.replace(/\D/g, "");
  if (c.length === 11) return `${c.slice(0, 3)}-${c.slice(3, 7)}-${c.slice(7)}`;
  if (c.length === 10) return `${c.slice(0, 3)}-${c.slice(3, 6)}-${c.slice(6)}`;
  return phone;
};

export const getPublicBaseUrl = (): string => {
  // Next.js 환경변수 방식
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL;
  if (typeof envUrl === "string" && envUrl.trim() !== "") {
    return envUrl.replace(/\/+$/, "");
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "";
};

export const getEventShareUrl = (slug: string): string => {
  const base = getPublicBaseUrl();
  return `${base}/e/${slug}`;
};

export interface UnitNumberParts {
  building?: string;
  unit?: string;
}

export const parseUnitNumber = (raw: string): UnitNumberParts => {
  const input = (raw ?? "").trim();
  if (!input) return {};
  const normalized = input.replace(/\s+/g, "");
  const dongHo = normalized.match(/(\d+)동(\d+)호/);
  if (dongHo) return { building: dongHo[1], unit: dongHo[2] };
  const hoDong = normalized.match(/(\d+)호(\d+)동/);
  if (hoDong) return { building: hoDong[2], unit: hoDong[1] };
  const numbers = normalized.split(/[^0-9]+/).filter(Boolean);
  if (numbers.length >= 2) return { building: numbers[0], unit: numbers[1] };
  if (numbers.length === 1) return { unit: numbers[0] };
  return {};
};

export const normalizeUnitNumber = (raw: string): string => {
  const { building, unit } = parseUnitNumber(raw);
  if (building && unit) return `${building}-${unit}`;
  if (unit) return `unit-${unit}`;
  return "";
};

export const isValidKoreanName = (value: string): boolean =>
  /^[가-힣]{2,}$/.test((value ?? "").trim());

export const isValidPhone010 = (value: string): boolean => {
  const digits = (value ?? "").replace(/\D/g, "");
  return /^010\d{8}$/.test(digits);
};

export const isValidEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value ?? "").trim());
