/**
 * POST /api/sms/auto
 * 예약 생성 또는 취소 시 즉시 문자 발송
 * Body: { reservationId: string, template: 'confirm' | 'cancel' }
 *
 * COOLSMS 환경변수가 설정되지 않으면 발송 없이 {ok: true, skipped: true} 반환
 */
import type { Event, Reservation } from '../../../src/types';
import { json, readBody, badRequest } from '../_lib/db';
import type { Env } from '../_lib/db';
import { sendSms, buildConfirmMessage, buildCancelMessage, getTicketUrl } from '../_lib/sms';

interface AutoSmsRequest {
  reservationId: string;
  template: 'confirm' | 'cancel';
}

interface ReservationRow { data: string; }
interface EventRow { data: string; }

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  // API 키 미설정 시 조용히 성공 반환 (실제 발송 안 함)
  if (!env.COOLSMS_API_KEY || !env.COOLSMS_API_SECRET || !env.COOLSMS_SENDER) {
    return json({ ok: true, skipped: true });
  }

  const body = await readBody<AutoSmsRequest>(request);
  if (!body?.reservationId || !body?.template) {
    return badRequest('reservationId와 template이 필요합니다.');
  }

  if (!env.DB) return json({ ok: true, skipped: true });

  try {
    const row = await env.DB.prepare('SELECT data FROM reservations WHERE id = ?')
      .bind(body.reservationId)
      .first<ReservationRow>();
    if (!row) return json({ ok: false, error: 'Reservation not found' }, 404);

    const reservation = JSON.parse(row.data) as Reservation;

    const eventRow = await env.DB.prepare('SELECT data FROM events WHERE id = ?')
      .bind(reservation.eventId)
      .first<EventRow>();
    if (!eventRow) return json({ ok: false, error: 'Event not found' }, 404);

    const event = JSON.parse(eventRow.data) as Event;
    const phone = reservation.customer.phone;
    if (!phone) return json({ ok: true, skipped: true });

    const text = body.template === 'confirm'
      ? buildConfirmMessage(reservation, event, getTicketUrl(env, event.slug, phone))
      : buildCancelMessage(reservation, event);

    await sendSms(env, phone, text);
    return json({ ok: true });
  } catch {
    return json({ ok: false, error: 'SMS 발송 중 오류가 발생했습니다.' }, 500);
  }
};
