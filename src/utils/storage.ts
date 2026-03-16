import type { Event, Reservation, CustomField, CompanyInfo, ManagedVendor, VendorContract } from '../types';
import { generateSlug } from './helpers';

const EVENTS_KEY = 'rv_events';
const RESERVATIONS_KEY = 'rv_reservations';
const ADMIN_AUTH_KEY = 'rv_admin_auth';
const COMPANY_INFO_KEY = 'rv_company_info';

const BASE_FIELDS: CustomField[] = [
  { id: 'bf1', key: 'name', label: '이름', type: 'text', placeholder: '홍길동', required: true },
  { id: 'bf2', key: 'phone', label: '연락처', type: 'tel', placeholder: '01012345678', required: true },
  { id: 'bf3', key: 'email', label: '이메일', type: 'email', placeholder: 'example@email.com', required: true },
  { id: 'bf4', key: 'unitNumber', label: '동호수', type: 'text', placeholder: '예) 101동 501호', required: true },
];
const BASE_FIELD_KEYS = new Set(BASE_FIELDS.map(f => f.key));
const ensureBaseFields = (fields: CustomField[]): CustomField[] => {
  const byKey = new Map(fields.map(f => [f.key, f]));
  const base = BASE_FIELDS.map(f => ({
    ...f,
    ...(byKey.get(f.key) ?? {}),
    required: true,
  }));
  const rest = fields.filter(f => !BASE_FIELD_KEYS.has(f.key));
  return [...base, ...rest];
};

const getSlotTime = (value: unknown): string | undefined =>
  typeof value === 'string' && value !== '시간 미지정' ? value : undefined;

const deriveTimeFromSlots = (slots: Event['timeSlots'] | undefined, index: number): string | undefined => {
  if (!slots || slots.length === 0) return undefined;
  const slot = slots[Math.min(Math.max(index, 0), slots.length - 1)];
  return getSlotTime(slot?.time);
};

/** 기존 데이터에 slug/customFields/extraFields/checkedIn 없으면 마이그레이션 */
const migrateEvent = (e: Record<string, unknown>): Event => {
  const timeSlots = (e.timeSlots as Event['timeSlots']) ?? [];
  const startTime = (e.startTime as string) ?? deriveTimeFromSlots(timeSlots, 0);
  const endTime = (e.endTime as string) ?? deriveTimeFromSlots(timeSlots, timeSlots.length - 1);
  return {
    ...(e as unknown as Event),
    slug: (e.slug as string) ?? generateSlug(),
    shareDomain: typeof e.shareDomain === 'string' ? (e.shareDomain as string) : undefined,
    startTime,
    endTime,
    timeSlots,
    customFields: ensureBaseFields((e.customFields as Event['customFields']) ?? []),
  };
};

const migrateReservation = (r: Record<string, unknown>): Reservation => ({
  ...(r as unknown as Reservation),
  extraFields: (r.extraFields as Record<string, string>) ?? {},
  checkedIn: (r.checkedIn as boolean) ?? false,
});

export const getEvents = (): Event[] => {
  try {
    const raw = JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]') as Record<string, unknown>[];
    return raw.map(migrateEvent);
  } catch { return []; }
};
export const saveEvents = (events: Event[]) =>
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));

export const getReservations = (): Reservation[] => {
  try {
    const raw = JSON.parse(localStorage.getItem(RESERVATIONS_KEY) || '[]') as Record<string, unknown>[];
    return raw.map(migrateReservation);
  } catch { return []; }
};
export const saveReservations = (reservations: Reservation[]) =>
  localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(reservations));

export const getCompanyInfo = (): CompanyInfo => {
  try {
    const raw = JSON.parse(localStorage.getItem(COMPANY_INFO_KEY) || '{}') as Partial<CompanyInfo>;
    return {
      name: typeof raw.name === 'string' ? raw.name : '',
      address: typeof raw.address === 'string' ? raw.address : '',
      email: typeof raw.email === 'string' ? raw.email : '',
    };
  } catch {
    return { name: '', address: '', email: '' };
  }
};

export const saveCompanyInfo = (info: CompanyInfo) =>
  localStorage.setItem(COMPANY_INFO_KEY, JSON.stringify(info));

const MANAGED_VENDORS_KEY = 'rv_managed_vendors';
export const getManagedVendors = (): ManagedVendor[] => {
  try {
    const raw = JSON.parse(localStorage.getItem(MANAGED_VENDORS_KEY) || '[]') as (ManagedVendor & { businessType?: string })[];
    return raw.map(v => ({
      ...v,
      category: v.category ?? v.businessType ?? '',
      loginPassword: undefined, // 비밀번호는 로컬에 보관하지 않음
    })) as ManagedVendor[];
  }
  catch { return []; }
};
export const saveManagedVendors = (vendors: ManagedVendor[]) => {
  localStorage.setItem(MANAGED_VENDORS_KEY, JSON.stringify(vendors));
};

const VENDOR_CATEGORY_OPTIONS_KEY = 'rv_vendor_category_options';
const DEFAULT_CATEGORY_OPTIONS = [
  '가구', '방충망', '에어컨/냉난방', '입주청소', '이사', '인테리어',
  '전동커튼/블라인드', '조명', '보안/방범', '주방기기', '욕실/위생',
  '홈네트워크', '기타',
];
export const getVendorCategoryOptions = (): string[] => {
  try {
    const raw = localStorage.getItem(VENDOR_CATEGORY_OPTIONS_KEY);
    if (!raw) return [...DEFAULT_CATEGORY_OPTIONS];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...DEFAULT_CATEGORY_OPTIONS];
  } catch { return [...DEFAULT_CATEGORY_OPTIONS]; }
};
export const saveVendorCategoryOptions = (options: string[]) =>
  localStorage.setItem(VENDOR_CATEGORY_OPTIONS_KEY, JSON.stringify(options));

const VENDOR_CONTRACTS_KEY = 'rv_vendor_contracts';
export const getVendorContracts = (): VendorContract[] => {
  try {
    return JSON.parse(localStorage.getItem(VENDOR_CONTRACTS_KEY) || '[]') as VendorContract[];
  } catch { return []; }
};
export const saveVendorContracts = (contracts: VendorContract[]) =>
  localStorage.setItem(VENDOR_CONTRACTS_KEY, JSON.stringify(contracts));

export const getVendorTemplateRawText = (vendorId: string): string =>
  localStorage.getItem(`rv_vendor_template_text_${vendorId}`) ?? '';
export const saveVendorTemplateRawText = (vendorId: string, text: string) =>
  localStorage.setItem(`rv_vendor_template_text_${vendorId}`, text);

export const getVendorTemplateFields = (vendorId: string): import('../types').TemplateField[] => {
  try {
    const raw = localStorage.getItem(`rv_vendor_template_fields_${vendorId}`);
    return raw ? (JSON.parse(raw) as import('../types').TemplateField[]) : [];
  } catch { return []; }
};
export const saveVendorTemplateFields = (vendorId: string, fields: import('../types').TemplateField[]) =>
  localStorage.setItem(`rv_vendor_template_fields_${vendorId}`, JSON.stringify(fields));
export const clearVendorTemplateFields = (vendorId: string) =>
  localStorage.removeItem(`rv_vendor_template_fields_${vendorId}`);

export const getVendorContractTemplate = (vendorId: string): string[] => {
  try {
    const raw = localStorage.getItem(`rv_vendor_template_${vendorId}`);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch { return []; }
};
export const saveVendorContractTemplate = (vendorId: string, images: string[]) =>
  localStorage.setItem(`rv_vendor_template_${vendorId}`, JSON.stringify(images));
export const clearVendorContractTemplate = (vendorId: string) =>
  localStorage.removeItem(`rv_vendor_template_${vendorId}`);

export const getVendorPreSignature = (vendorId: string): string | null =>
  localStorage.getItem(`rv_vendor_sig_${vendorId}`);
export const saveVendorPreSignature = (vendorId: string, dataUrl: string) =>
  localStorage.setItem(`rv_vendor_sig_${vendorId}`, dataUrl);
export const clearVendorPreSignature = (vendorId: string) =>
  localStorage.removeItem(`rv_vendor_sig_${vendorId}`);

// ── 세션 관리 (세션 캐시 - 실제 인증은 서버 쿠키) ──────────────────────────

export const isAdminLoggedIn = (): boolean =>
  sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true';

/**
 * 로그인 — /api/auth/login 호출 후 세션 캐시 업데이트
 * 쿠키 기반 JWT가 실제 인증 수단
 */
export const adminLogin = async (
  username: string,
  password: string,
): Promise<{ ok: boolean }> => {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ loginId: username, password }),
    });
    if (!res.ok) return { ok: false };
    const data = await res.json() as { ok: boolean; role: string };
    if (!data.ok || data.role !== 'admin') return { ok: false };

    sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
    window.dispatchEvent(new Event('rv_auth_change'));
    return { ok: true };
  } catch {
    return { ok: false };
  }
};

/**
 * 로그아웃 — /api/auth/logout 호출 + 로컬 캐시 삭제
 */
export const adminLogout = async (): Promise<void> => {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch { /* 네트워크 오류 시에도 로컬 세션은 삭제 */ }
  sessionStorage.removeItem(ADMIN_AUTH_KEY);
  window.dispatchEvent(new Event('rv_auth_change'));
};

/**
 * 서버 세션 검증 및 캐시 갱신 (페이지 로드 시 호출)
 */
export const validateSession = async (): Promise<void> => {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    if (!res.ok) { sessionStorage.removeItem(ADMIN_AUTH_KEY); return; }
    const data = await res.json() as { user: { role: string } | null };
    if (data.user?.role === 'admin') {
      sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
    } else {
      sessionStorage.removeItem(ADMIN_AUTH_KEY);
    }
    window.dispatchEvent(new Event('rv_auth_change'));
  } catch { /* 네트워크 오류 시 기존 캐시 유지 */ }
};

export const getSlotUsedCount = (
  reservations: Reservation[],
  eventId: string,
  date: string,
  time: string,
): number =>
  reservations
    .filter(r => r.eventId === eventId && r.date === date && r.time === time && r.status === 'confirmed')
    .reduce((sum, r) => sum + r.attendeeCount, 0);
