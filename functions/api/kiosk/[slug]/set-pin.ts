/**
 * POST /api/kiosk/:slug/set-pin
 * 키오스크 재출력 PIN 설정 (관리자 전용)
 */
import { json, badRequest, readBody } from '../../_lib/db';
import type { Env } from '../../_lib/db';
import { withAdmin, hashPin } from '../../_lib/auth';

interface Params { slug: string; }
interface Body { pin: string; }

export const onRequestPost: PagesFunction<Env, Params> = withAdmin(async ({ params, request, env }) => {
  const body = await readBody<Body>(request);
  if (!body?.pin) return badRequest('PIN이 필요합니다.');
  if (body.pin.length < 4) return badRequest('PIN은 4자 이상이어야 합니다.');

  const event = await env.DB.prepare(
    'SELECT id FROM events WHERE slug = ?',
  ).bind(params.slug).first<{ id: string }>();

  if (!event) return json({ error: '행사를 찾을 수 없습니다.' }, 404);

  const pinHash = await hashPin(body.pin);
  await env.DB.prepare(
    `INSERT INTO kiosk_pins (event_id, pin_hash) VALUES (?, ?)
     ON CONFLICT(event_id) DO UPDATE SET pin_hash = excluded.pin_hash, updated_at = CURRENT_TIMESTAMP`,
  ).bind(event.id, pinHash).run();

  return json({ ok: true });
});
