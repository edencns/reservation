import type { Reservation } from '../../../../src/types';
import { json, notFound } from '../../_lib/db';
import type { Env } from '../../_lib/db';

interface Params {
  id: string;
}

interface ReservationRow {
  data: string;
}

export const onRequestPatch: PagesFunction<Env, Params> = async ({ params, env }) => {
  if (!env.DB) return json({ ok: true });
  try {
    const id = params.id;
    const row = await env.DB.prepare('SELECT data FROM reservations WHERE id = ?').bind(id).first<ReservationRow>();
    if (!row) return notFound('Reservation not found');

    const reservation = JSON.parse(row.data) as Reservation;
    const next: Reservation = { ...reservation, status: 'cancelled' };

    await env.DB.prepare(
      `UPDATE reservations
        SET status = ?, updated_at = CURRENT_TIMESTAMP, data = ?
        WHERE id = ?`
    )
      .bind(next.status, JSON.stringify(next), id)
      .run();
  } catch { /* DB 없으면 무시 */ }
  return json({ ok: true });
};
