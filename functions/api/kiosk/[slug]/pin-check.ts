/**
 * POST /api/kiosk/:slug/pin-check
 * 키오스크 재출력 PIN 검증 (공개 엔드포인트, 속도 제한 적용)
 */
import { json, badRequest, readBody } from '../../_lib/db';
import type { Env } from '../../_lib/db';
import { verifyPin } from '../../_lib/auth';

interface Params { slug: string; }
interface Body { pin: string; }

const MAX_ATTEMPTS_PER_MINUTE = 5;

export const onRequestPost: PagesFunction<Env, Params> = async ({ params, request, env }) => {
  const body = await readBody<Body>(request);
  if (!body?.pin) return badRequest('PIN이 필요합니다.');

  const slug = params.slug;
  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';

  // Rate limiting: 1분에 5회 초과 시 차단
  if (env.DB) {
    const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
    const attempts = await env.DB.prepare(
      `SELECT COUNT(*) as cnt FROM sms_rate_log WHERE ip = ? AND endpoint = ? AND sent_at > ?`,
    ).bind(ip, `kiosk_pin_${slug}`, oneMinuteAgo).first<{ cnt: number }>();

    if ((attempts?.cnt ?? 0) >= MAX_ATTEMPTS_PER_MINUTE) {
      return json({ error: '너무 많은 시도입니다. 잠시 후 다시 시도하세요.' }, 429);
    }

    // 시도 기록
    await env.DB.prepare(
      `INSERT INTO sms_rate_log (id, ip, endpoint) VALUES (?, ?, ?)`,
    ).bind(crypto.randomUUID(), ip, `kiosk_pin_${slug}`).run().catch(() => undefined);
  }

  // 행사 ID 조회
  const event = await env.DB.prepare(
    'SELECT id FROM events WHERE slug = ?',
  ).bind(slug).first<{ id: string }>();

  if (!event) return json({ valid: false });

  // PIN 해시 검증
  const row = await env.DB.prepare(
    'SELECT pin_hash FROM kiosk_pins WHERE event_id = ?',
  ).bind(event.id).first<{ pin_hash: string }>();

  if (!row) return json({ valid: false });

  const valid = await verifyPin(body.pin, row.pin_hash);
  return json({ valid });
};
