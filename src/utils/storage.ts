import type { Event, Reservation, CustomField, CompanyInfo } from '../types';
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

export const getSlotUsedCount = (
  reservations: Reservation[],
  eventId: string,
  date: string,
  time: string,
): number =>
  reservations
    .filter(r => r.eventId === eventId && r.date === date && r.time === time && r.status === 'confirmed')
    .reduce((sum, r) => sum + r.attendeeCount, 0);

export const isAdminLoggedIn = (): boolean =>
  sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true';

export const adminLogin = (username: string, password: string): boolean => {
  if (username === 'admin' && password === 'admin123') {
    sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
    window.dispatchEvent(new Event('rv_auth_change'));
    return true;
  }
  return false;
};

export const adminLogout = () => {
  sessionStorage.removeItem(ADMIN_AUTH_KEY);
  window.dispatchEvent(new Event('rv_auth_change'));
};
