import type { Env } from './db';
import type { Event, Reservation } from '../../../src/types';
import { encryptPII } from './auth';

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

export function buildCancelMessage(
  reservation: Reservation,
  event: Event,
): string {
  const dateStr = formatKoreanDate(reservation.date);
  return [
    `[${event.title}] 예약이 취소되었습니다.`,
    ``,
    `예약자: ${reservation.customer.name}`,
    `방문일: ${dateStr}`,
    `장소: ${event.venue}`,
    ``,
    `문의사항이 있으시면 연락해 주세요.`,
  ].join('\n');
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

/**
 * 티켓 URL 생성 (토큰 방식으로 전화번호 직접 노출 방지)
 * DB와 ENCRYPT_KEY가 없으면 레거시 URL로 폴백 (개발 환경용)
 */
export async function getTicketUrl(
  env: Env,
  slug: string,
  phone: string,
): Promise<string> {
  const base = (env.SITE_URL ?? '').replace(/\/+$/, '');

  if (!env.DB || !env.ENCRYPT_KEY) {
    // 개발 환경 폴백 (운영에서는 ENCRYPT_KEY 필수)
    return `${base}/e/${slug}/ticket?phone=${encodeURIComponent(phone)}`;
  }

  const token = crypto.randomUUID();
  const phoneEnc = await encryptPII(phone, env.ENCRYPT_KEY);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7일

  await env.DB.prepare(
    `INSERT INTO ticket_tokens (token, event_slug, phone_enc, expires_at) VALUES (?, ?, ?, ?)`,
  ).bind(token, slug, phoneEnc, expiresAt).run().catch(() => undefined);

  return `${base}/e/${slug}/ticket?token=${token}`;
}
