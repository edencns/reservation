import { json, notFound } from '../../_lib/db';
import type { Env } from '../../_lib/db';

interface Params {
  id: string;
}

export const onRequestDelete: PagesFunction<Env, Params> = async ({ params, env }) => {
  if (!env.DB) return json({ ok: true });
  try {
    const id = params.id;
    const row = await env.DB.prepare('SELECT id FROM reservations WHERE id = ?').bind(id).first<{ id: string }>();
    if (!row) return notFound('Reservation not found');

    await env.DB.prepare('DELETE FROM reservations WHERE id = ?').bind(id).run();
  } catch { /* DB 없으면 무시 */ }
  return json({ ok: true });
};
