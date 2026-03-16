import type { Reservation, Event } from '../../src/types';
import { json, readBody, badRequest } from './_lib/db';
import type { Env } from './_lib/db';
import { sendSms, buildConfirmMessage, getTicketUrl } from './_lib/sms';
import {
  getSessionUser,
  encryptPII,
  decryptPII,
  maskPhone,
  maskName,
  isEncrypted,
  unauthorized,
} from './_lib/auth';

interface ReservationRow {
  id: string;
  data: string;
}

interface EventRow {
  id: string;
  data: string;
}

/** PII 필드를 암호화하여 저장용 예약 객체 반환 */
async function encryptReservation(r: Reservation, encKey: string): Promise<Reservation> {
  const customer = { ...r.customer };
  if (customer.name && !isEncrypted(customer.name)) {
    customer.name = await encryptPII(customer.name, encKey);
  }
  if (customer.phone && !isEncrypted(customer.phone)) {
    customer.phone = await encryptPII(customer.phone, encKey);
  }
  if (customer.email && !isEncrypted(customer.email)) {
    customer.email = await encryptPII(customer.email, encKey);
  }
  // extraFields에서 이름/연락처 필드도 암호화
  const extraFields = { ...r.extraFields };
  for (const key of ['name', 'phone', 'email', 'unitNumber']) {
    if (extraFields[key] && !isEncrypted(extraFields[key])) {
      extraFields[key] = await encryptPII(extraFields[key], encKey);
    }
  }
  return { ...r, customer, extraFields };
}

/** PII 필드 복호화 */
async function decryptReservation(r: Reservation, encKey: string): Promise<Reservation> {
  const customer = { ...r.customer };
  try {
    if (customer.name && isEncrypted(customer.name)) customer.name = await decryptPII(customer.name, encKey);
    if (customer.phone && isEncrypted(customer.phone)) customer.phone = await decryptPII(customer.phone, encKey);
    if (customer.email && isEncrypted(customer.email)) customer.email = await decryptPII(customer.email, encKey);
  } catch { /* 복호화 실패 시 원본 유지 */ }
  const extraFields = { ...r.extraFields };
  for (const key of ['name', 'phone', 'email', 'unitNumber']) {
    if (extraFields[key] && isEncrypted(extraFields[key])) {
      try { extraFields[key] = await decryptPII(extraFields[key], encKey); } catch { /* 무시 */ }
    }
  }
  return { ...r, customer, extraFields };
}

/** GET /api/reservations
 * - 관리자: 전체 데이터 (복호화)
 * - 업체: 해당 업체 행사의 예약만 (복호화)
 * - 미인증: 401
 */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.DB) return json([]);

  const user = await getSessionUser(request, env);
  if (!user) return unauthorized();

  try {
    let rows: ReservationRow[];

    if (user.role === 'admin') {
      const result = await env.DB.prepare(
        'SELECT id, data FROM reservations ORDER BY created_at DESC'
      ).all<ReservationRow>();
      rows = result.results ?? [];
    } else {
      // 업체 RLS: 이 업체가 참여한 행사의 예약만 반환
      const eventResult = await env.DB.prepare(
        'SELECT id, data FROM events'
      ).all<EventRow>();

      const myEventIds = new Set<string>();
      for (const er of (eventResult.results ?? [])) {
        const ev = JSON.parse(er.data) as Event;
        const hasVendor = ev.vendors?.some(v => v.id === user.vendorId);
        if (hasVendor) myEventIds.add(er.id);
      }

      if (myEventIds.size === 0) return json([]);

      const placeholders = [...myEventIds].map(() => '?').join(',');
      const result = await env.DB.prepare(
        `SELECT id, data FROM reservations WHERE event_id IN (${placeholders}) ORDER BY created_at DESC`
      ).bind(...myEventIds).all<ReservationRow>();
      rows = result.results ?? [];
    }

    // PII 복호화
    const reservations = await Promise.all(
      rows.map(async (row) => {
        const r = JSON.parse(row.data) as Reservation;
        if (env.ENCRYPT_KEY) {
          return decryptReservation(r, env.ENCRYPT_KEY);
        }
        return r;
      })
    );

    return json(reservations);
  } catch {
    return json([]);
  }
};

/** POST /api/reservations — 공개 (고객 예약 생성) */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const reservation = await readBody<Reservation>(request);
  if (!reservation || !reservation.id || !reservation.eventId) {
    return badRequest('Invalid reservation payload');
  }

  // 기본 입력 검증
  if (!reservation.customer?.phone || !reservation.customer?.name) {
    return badRequest('고객 정보가 필요합니다.');
  }
  // 전화번호 형식 검증 (한국 번호)
  const phoneDigits = reservation.customer.phone.replace(/\D/g, '');
  if (phoneDigits.length < 10 || phoneDigits.length > 11) {
    return badRequest('올바른 전화번호 형식이 아닙니다.');
  }

  if (env.DB) {
    try {
      // 원본 전화번호 보존 (SMS 발송용)
      const rawPhone = reservation.customer.phone;

      // DB 저장 전 PII 암호화
      let toStore = reservation;
      if (env.ENCRYPT_KEY) {
        toStore = await encryptReservation(reservation, env.ENCRYPT_KEY);
      }

      await env.DB.prepare(
        `INSERT OR REPLACE INTO reservations
          (id, event_id, status, customer_phone, visit_date, checked_in, checked_in_at, created_at, updated_at, data)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)`
      )
        .bind(
          toStore.id,
          toStore.eventId,
          toStore.status,
          env.ENCRYPT_KEY ? await encryptPII(rawPhone, env.ENCRYPT_KEY) : rawPhone,
          toStore.date,
          toStore.checkedIn ? 1 : 0,
          toStore.checkedInAt ?? null,
          toStore.createdAt ?? new Date().toISOString(),
          JSON.stringify(toStore),
        )
        .run();

      // 예약 확인 SMS (원본 전화번호로 발송)
      try {
        const eventRow = await env.DB.prepare('SELECT data FROM events WHERE id = ?')
          .bind(reservation.eventId)
          .first<{ data: string }>();
        if (eventRow) {
          const event = JSON.parse(eventRow.data) as Event;
          const ticketUrl = await getTicketUrl(env, event.slug, rawPhone);
          const text = buildConfirmMessage(reservation, event, ticketUrl);
          await sendSms(env, rawPhone, text);
        }
      } catch { /* SMS 실패 시 예약은 정상 처리 */ }

    } catch { /* DB 저장 실패 시 무시 */ }
  }

  return json({ ok: true });
};
