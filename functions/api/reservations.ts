import type { Reservation } from '../../src/types';
import type { Event } from '../../src/types';
import { json, readBody, badRequest } from './_lib/db';
import type { Env } from './_lib/db';
import { sendSms, buildConfirmMessage, getTicketUrl } from './_lib/sms';

interface ReservationRow {
  id: string;
  data: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const { results } = await env.DB.prepare(
    'SELECT id, data FROM reservations ORDER BY created_at DESC'
  ).all<ReservationRow>();

  const reservations = (results ?? []).map(row => JSON.parse(row.data) as Reservation);
  return json(reservations);
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const reservation = await readBody<Reservation>(request);
  if (!reservation || !reservation.id || !reservation.eventId) {
    return badRequest('Invalid reservation payload');
  }

  await env.DB.prepare(
    `INSERT OR REPLACE INTO reservations
      (id, event_id, status, customer_phone, visit_date, checked_in, checked_in_at, created_at, updated_at, data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)`
  )
    .bind(
      reservation.id,
      reservation.eventId,
      reservation.status,
      reservation.customer?.phone ?? '',
      reservation.date,
      reservation.checkedIn ? 1 : 0,
      reservation.checkedInAt ?? null,
      reservation.createdAt ?? new Date().toISOString(),
      JSON.stringify(reservation),
    )
    .run();

  // 예약 확인 SMS 자동 발송 (API 키 설정 시)
  try {
    const eventRow = await env.DB.prepare('SELECT data FROM events WHERE id = ?')
      .bind(reservation.eventId)
      .first<{ data: string }>();
    if (eventRow) {
      const event = JSON.parse(eventRow.data) as Event;
      const ticketUrl = getTicketUrl(env, event.slug, reservation.customer.phone);
      const text = buildConfirmMessage(reservation, event, ticketUrl);
      await sendSms(env, reservation.customer.phone, text);
    }
  } catch { /* SMS 실패 시 예약은 정상 처리 */ }

  return json({ ok: true });
};
