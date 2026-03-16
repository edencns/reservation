/**
 * POST /api/sms/send-reminders
 * 7일 후 방문 예약자 전체에 리마인더 문자 발송
 * Cloudflare Cron Trigger에서 매일 호출 (scheduled-worker.ts 참고)
 */
import type { Event, Reservation } from '../../../src/types';
import { json } from '../_lib/db';
import type { Env } from '../_lib/db';
import { sendSms, buildReminderMessage, getTicketUrl } from '../_lib/sms';
import { withAdmin, decryptPII, isEncrypted } from '../_lib/auth';

interface ReservationRow { id: string; data: string; }
interface EventRow { data: string; }

export const onRequestPost: PagesFunction<Env> = withAdmin(async ({ env }) => {
  if (!env.COOLSMS_API_KEY || !env.COOLSMS_API_SECRET || !env.COOLSMS_SENDER) {
    return json({ ok: true, skipped: true });
  }

  if (!env.DB) return json({ ok: true, skipped: true });

  const target = new Date();
  target.setDate(target.getDate() + 7);
  const targetDate = target.toISOString().split('T')[0];

  try {
    const rows = await env.DB.prepare(
      `SELECT id, data FROM reservations WHERE visit_date = ? AND status = 'confirmed'`
    ).bind(targetDate).all<ReservationRow>();

    const reservations = await Promise.all(
      (rows.results ?? []).map(async (r) => {
        const res = JSON.parse(r.data) as Reservation;
        if (env.ENCRYPT_KEY) {
          const customer = { ...res.customer };
          try {
            if (customer.phone && isEncrypted(customer.phone)) customer.phone = await decryptPII(customer.phone, env.ENCRYPT_KEY!);
            if (customer.name && isEncrypted(customer.name)) customer.name = await decryptPII(customer.name, env.ENCRYPT_KEY!);
          } catch { /* 무시 */ }
          return { ...res, customer };
        }
        return res;
      })
    );

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
      const ticketUrl = await getTicketUrl(env, event.slug, reservation.customer.phone);
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
});
