/**
 * POST /api/sms/send-reminders
 * 7일 후 방문 예약자 전체에 리마인더 문자 발송
 * Cloudflare Cron Trigger에서 매일 호출 (scheduled-worker.ts 참고)
 *
 * COOLSMS 환경변수가 설정되지 않으면 발송 없이 {ok: true, skipped: true} 반환
 */
import type { Event, Reservation } from '../../../src/types';
import { json } from '../_lib/db';
import type { Env } from '../_lib/db';
import { sendSms, buildReminderMessage, getTicketUrl } from '../_lib/sms';

interface ReservationRow { id: string; data: string; }
interface EventRow { data: string; }

export const onRequestPost: PagesFunction<Env> = async ({ env }) => {
  if (!env.COOLSMS_API_KEY || !env.COOLSMS_API_SECRET || !env.COOLSMS_SENDER) {
    return json({ ok: true, skipped: true });
  }

  if (!env.DB) return json({ ok: true, skipped: true });

  // 오늘로부터 정확히 7일 후 날짜 (YYYY-MM-DD)
  const target = new Date();
  target.setDate(target.getDate() + 7);
  const targetDate = target.toISOString().split('T')[0];

  try {
    // 7일 후 방문 확정 예약 조회
    const rows = await env.DB.prepare(
      `SELECT id, data FROM reservations WHERE date = ? AND status = 'confirmed'`
    ).bind(targetDate).all<ReservationRow>();

    const reservations = (rows.results ?? []).map(r => JSON.parse(r.data) as Reservation);

    // 행사 캐시
    const eventCache = new Map<string, Event>();
    const eventIds = [...new Set(reservations.map(r => r.eventId))];
    for (const eventId of eventIds) {
      const row = await env.DB.prepare('SELECT data FROM events WHERE id = ?')
        .bind(eventId).first<EventRow>();
      if (row) eventCache.set(eventId, JSON.parse(row.data) as Event);
    }

    let sent = 0;
    let failed = 0;
    for (const reservation of reservations) {
      const event = eventCache.get(reservation.eventId);
      if (!event || !reservation.customer.phone) continue;
      const ticketUrl = getTicketUrl(env, event.slug, reservation.customer.phone);
      const text = buildReminderMessage(reservation, event, ticketUrl, 7);
      try {
        await sendSms(env, reservation.customer.phone, text);
        sent++;
      } catch {
        failed++;
      }
    }

    return json({ ok: true, targetDate, total: reservations.length, sent, failed });
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
};
