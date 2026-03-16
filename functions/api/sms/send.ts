import type { Event, Reservation } from '../../../src/types';
import { json, readBody, badRequest } from '../_lib/db';
import type { Env } from '../_lib/db';
import { sendSms, buildConfirmMessage, buildReminderMessage, getTicketUrl } from '../_lib/sms';
import { withAdmin, decryptPII, isEncrypted } from '../_lib/auth';

interface SmsRequest {
  reservationIds: string[];
  template: 'confirm' | 'reminder';
  daysLeft?: number;
}

interface ReservationRow {
  data: string;
}

interface EventRow {
  data: string;
}

const MAX_IDS = 500;

/** POST /api/sms/send — 관리자 전용, 속도 제한 적용 */
export const onRequestPost: PagesFunction<Env> = withAdmin(async ({ request, env }) => {
  if (!env.COOLSMS_API_KEY || !env.COOLSMS_API_SECRET || !env.COOLSMS_SENDER) {
    return json({ error: 'SMS 서비스가 설정되지 않았습니다.' }, 503);
  }

  const body = await readBody<SmsRequest>(request);
  if (!body || !Array.isArray(body.reservationIds) || !body.template) {
    return badRequest('Invalid request');
  }

  // 배열 크기 제한 (DoS 방지)
  if (body.reservationIds.length > MAX_IDS) {
    return badRequest(`한 번에 최대 ${MAX_IDS}건까지 발송 가능합니다.`);
  }

  // ID 형식 검증
  const validIds = body.reservationIds.filter(id => typeof id === 'string' && id.length <= 100);
  const { template, daysLeft = 1 } = body;

  const placeholders = validIds.map(() => '?').join(', ');
  const rows = await env.DB.prepare(
    `SELECT data FROM reservations WHERE id IN (${placeholders}) AND status = 'confirmed'`
  ).bind(...validIds).all<ReservationRow>();

  const reservations = await Promise.all(
    (rows.results ?? []).map(async (r) => {
      const res = JSON.parse(r.data) as Reservation;
      if (env.ENCRYPT_KEY) {
        const customer = { ...res.customer };
        try {
          if (customer.phone && isEncrypted(customer.phone)) customer.phone = await decryptPII(customer.phone, env.ENCRYPT_KEY!);
          if (customer.name && isEncrypted(customer.name)) customer.name = await decryptPII(customer.name, env.ENCRYPT_KEY!);
        } catch { /* 복호화 실패 시 원본 유지 */ }
        return { ...res, customer };
      }
      return res;
    })
  );

  const eventCache = new Map<string, Event>();
  const eventIds = [...new Set(reservations.map(r => r.eventId))];
  for (const eventId of eventIds) {
    const row = await env.DB.prepare('SELECT data FROM events WHERE id = ?')
      .bind(eventId)
      .first<EventRow>();
    if (row) eventCache.set(eventId, JSON.parse(row.data) as Event);
  }

  let sent = 0;
  let failed = 0;
  for (const reservation of reservations) {
    const event = eventCache.get(reservation.eventId);
    if (!event || !reservation.customer.phone) continue;
    const ticketUrl = await getTicketUrl(env, event.slug, reservation.customer.phone);
    const text = template === 'confirm'
      ? buildConfirmMessage(reservation, event, ticketUrl)
      : buildReminderMessage(reservation, event, ticketUrl, daysLeft);
    try {
      await sendSms(env, reservation.customer.phone, text);
      sent++;
    } catch {
      failed++;
    }
  }

  return json({ ok: true, sent, failed, total: reservations.length });
});
