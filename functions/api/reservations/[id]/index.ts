import { json, notFound } from '../../_lib/db';
import type { Env } from '../../_lib/db';
import { withAdmin } from '../../_lib/auth';

interface Params {
  id: string;
}

/** DELETE /api/reservations/:id — 관리자 전용 */
export const onRequestDelete: PagesFunction<Env, Params> = withAdmin(async ({ params, env }) => {
  if (!env.DB) return json({ ok: true });
  try {
    const id = params.id;
    const row = await env.DB.prepare('SELECT id FROM reservations WHERE id = ?').bind(id).first<{ id: string }>();
    if (!row) return notFound('Reservation not found');

    await env.DB.prepare('DELETE FROM reservations WHERE id = ?').bind(id).run();
  } catch { /* DB 없으면 무시 */ }
  return json({ ok: true });
});
