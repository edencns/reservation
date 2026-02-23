import type { Event, Reservation, CustomField } from '../types';
import { generateSlug } from './helpers';

const EVENTS_KEY = 'rv_events';
const RESERVATIONS_KEY = 'rv_reservations';
const ADMIN_AUTH_KEY = 'rv_admin_auth';

const BASE_FIELDS: CustomField[] = [
  { id: 'bf1', key: 'name', label: '이름', type: 'text', placeholder: '홍길동', required: true },
  { id: 'bf2', key: 'phone', label: '연락처', type: 'tel', placeholder: '01012345678', required: true },
  { id: 'bf3', key: 'unitNumber', label: '동호수', type: 'text', placeholder: '예) 101동 501호', required: true },
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

/** 기존 데이터에 slug/customFields/extraFields/checkedIn 없으면 마이그레이션 */
const migrateEvent = (e: Record<string, unknown>): Event => ({
  ...(e as unknown as Event),
  slug: (e.slug as string) ?? generateSlug(),
  customFields: ensureBaseFields((e.customFields as Event['customFields']) ?? []),
});

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
  localStorage.getItem(ADMIN_AUTH_KEY) === 'true';

export const adminLogin = (username: string, password: string): boolean => {
  if (username === 'admin' && password === 'admin123') {
    localStorage.setItem(ADMIN_AUTH_KEY, 'true');
    return true;
  }
  return false;
};

export const adminLogout = () => localStorage.removeItem(ADMIN_AUTH_KEY);
