import type { Env } from './db';
import type { Event, Reservation } from '../../../src/types';

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

function formatKoreanDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${DAY_NAMES[d.getDay()]})`;
}

async function buildAuthHeader(apiKey: string, apiSecret: string): Promise<string> {
  const date = new Date().toISOString();
  const salt = crypto.randomUUID().replace(/-/g, '');
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(apiSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(date + salt));
  const signature = [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');
  return `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`;
}

export function buildConfirmMessage(
  reservation: Reservation,
  event: Event,
  ticketUrl: string,
): string {
  const dateStr = formatKoreanDate(reservation.date);
  const timeRange = event.startTime && event.endTime
    ? `${event.startTime} ~ ${event.endTime}`
    : event.startTime ?? '';
  const lines = [
    `[${event.title}] 방문 예약이 완료되었습니다.`,
    ``,
    `예약자: ${reservation.customer.name}`,
    `방문일: ${dateStr}${timeRange ? ' ' + timeRange : ''}`,
    `장소: ${event.venue}`,
    event.address ? event.address : '',
    ``,
    `QR 티켓 확인:`,
    ticketUrl,
  ].filter(l => l !== null);
  return lines.join('\n');
}

export function buildReminderMessage(
  reservation: Reservation,
  event: Event,
  ticketUrl: string,
  daysLeft: number,
): string {
  const dateStr = formatKoreanDate(reservation.date);
  const timeRange = event.startTime && event.endTime
    ? `${event.startTime} ~ ${event.endTime}`
    : event.startTime ?? '';
  const dayLabel = daysLeft === 1 ? '내일' : `${daysLeft}일 후`;
  return [
    `[${event.title}] 행사 방문일이 ${dayLabel}입니다.`,
    ``,
    `예약자: ${reservation.customer.name}`,
    `방문일: ${dateStr}${timeRange ? ' ' + timeRange : ''}`,
    `장소: ${event.venue}`,
    ``,
    `QR 티켓 확인:`,
    ticketUrl,
  ].join('\n');
}

export async function sendSms(
  env: Env,
  to: string,
  text: string,
): Promise<void> {
  const { COOLSMS_API_KEY, COOLSMS_API_SECRET, COOLSMS_SENDER } = env;
  if (!COOLSMS_API_KEY || !COOLSMS_API_SECRET || !COOLSMS_SENDER) return;

  const phone = to.replace(/\D/g, '');
  if (!phone) return;

  const authorization = await buildAuthHeader(COOLSMS_API_KEY, COOLSMS_API_SECRET);

  await fetch('https://api.coolsms.co.kr/messages/v4/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authorization,
    },
    body: JSON.stringify({
      message: {
        to: phone,
        from: COOLSMS_SENDER,
        text,
        type: 'LMS',
      },
    }),
  });
}

export function getTicketUrl(env: Env, slug: string, phone: string): string {
  const base = (env.SITE_URL ?? '').replace(/\/+$/, '');
  return `${base}/e/${slug}/ticket?phone=${encodeURIComponent(phone)}`;
}
