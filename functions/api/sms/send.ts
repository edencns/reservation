import type { Event, Reservation } from '../../../src/types';
import { json, readBody, badRequest } from '../_lib/db';
import type { Env } from '../_lib/db';
import { sendSms, buildConfirmMessage, buildReminderMessage, getTicketUrl } from '../_lib/sms';

interface SmsRequest {
  reservationIds: string[];
  template: 'confirm' | 'reminder';
  daysLeft?: number; // 리마인더 시 몇 일 전인지
}

interface ReservationRow {
  data: string;
}

interface EventRow {
  data: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.COOLSMS_API_KEY || !env.COOLSMS_API_SECRET || !env.COOLSMS_SENDER) {
    return json({ error: 'SMS 서비스가 설정되지 않았습니다. Cloudflare 환경변수를 확인하세요.' }, 503);
  }

  const body = await readBody<SmsRequest>(request);
  if (!body || !Array.isArray(body.reservationIds) || !body.template) {
    return badRequest('Invalid request');
  }

  const { reservationIds, template, daysLeft = 1 } = body;

  // 예약 데이터 조회
  const placeholders = reservationIds.map(() => '?').join(', ');
  const rows = await env.DB.prepare(
    `SELECT data FROM reservations WHERE id IN (${placeholders}) AND status = 'confirmed'`
  ).bind(...reservationIds).all<ReservationRow>();

  const reservations = (rows.results ?? []).map(r => JSON.parse(r.data) as Reservation);

  // 이벤트 캐시
  const eventCache = new Map<string, Event>();
  const eventIds = [...new Set(reservations.map(r => r.eventId))];
  for (const eventId of eventIds) {
    const row = await env.DB.prepare('SELECT data FROM events WHERE id = ?')
      .bind(eventId)
      .first<EventRow>();
    if (row) eventCache.set(eventId, JSON.parse(row.data) as Event);
  }

  // SMS 발송
  let sent = 0;
  let failed = 0;
  for (const reservation of reservations) {
    const event = eventCache.get(reservation.eventId);
    if (!event) continue;
    const ticketUrl = getTicketUrl(env, event.slug, reservation.customer.phone);
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
};
