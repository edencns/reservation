import type { Event } from '../../src/types';
import { json, readBody, badRequest } from './_lib/db';
import type { Env } from './_lib/db';
import { withAdmin } from './_lib/auth';

interface EventRow {
  id: string;
  data: string;
}

/** GET /api/events — 공개 (예약 폼에서 사용) */
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  if (!env.DB) return json([]);
  try {
    const { results } = await env.DB.prepare(
      'SELECT id, data FROM events ORDER BY created_at DESC'
    ).all<EventRow>();
    const events = (results ?? []).map(row => JSON.parse(row.data) as Event);
    return json(events);
  } catch {
    return json([]);
  }
};

/** POST /api/events — 관리자 전용 */
export const onRequestPost: PagesFunction<Env> = withAdmin(async ({ request, env }) => {
  const event = await readBody<Event>(request);
  if (!event || !event.id || !event.slug) return badRequest('Invalid event payload');
  if (!env.DB) return json({ ok: true });
  try {
    await env.DB.prepare(
      `INSERT OR REPLACE INTO events (id, slug, status, created_at, updated_at, data)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?)`
    )
      .bind(
        event.id,
        event.slug,
        event.status,
        event.createdAt ?? new Date().toISOString(),
        JSON.stringify(event),
      )
      .run();
  } catch { /* DB 저장 실패 시 무시 */ }
  return json({ ok: true });
});
