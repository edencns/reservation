/**
 * GET /api/kiosk/:slug/reservations
 * 키오스크용 예약 조회 (공개, 마스킹 적용)
 * - 특정 행사의 예약만 반환
 * - 고객 이름/전화번호 마스킹 처리
 */
import { json } from '../../_lib/db';
import type { Env } from '../../_lib/db';
import { decryptPII, maskPhone, maskName, isEncrypted } from '../../_lib/auth';
import type { Reservation, Event } from '../../../../src/types';

interface Params { slug: string; }
interface ReservationRow { id: string; data: string; }

export const onRequestGet: PagesFunction<Env, Params> = async ({ params, env }) => {
  if (!env.DB) return json([]);

  const { slug } = params;

  // 행사 ID 조회
  const eventRow = await env.DB.prepare(
    'SELECT id FROM events WHERE slug = ?'
  ).bind(slug).first<{ id: string }>();

  if (!eventRow) return json([]);

  const { results } = await env.DB.prepare(
    `SELECT id, data FROM reservations WHERE event_id = ? ORDER BY created_at DESC`
  ).bind(eventRow.id).all<ReservationRow>();

  const reservations = await Promise.all(
    (results ?? []).map(async (row) => {
      const r = JSON.parse(row.data) as Reservation;

      // PII 복호화 후 마스킹
      let name = r.customer.name ?? '';
      let phone = r.customer.phone ?? '';
      let email = r.customer.email ?? '';

      if (env.ENCRYPT_KEY) {
        try {
          if (name && isEncrypted(name)) name = await decryptPII(name, env.ENCRYPT_KEY);
          if (phone && isEncrypted(phone)) phone = await decryptPII(phone, env.ENCRYPT_KEY);
          if (email && isEncrypted(email)) email = await decryptPII(email, env.ENCRYPT_KEY);
        } catch { /* 복호화 실패 시 원본 유지 */ }
      }

      // extraFields 복호화 및 마스킹
      const extraFields = { ...r.extraFields };
      for (const key of Object.keys(extraFields)) {
        if (env.ENCRYPT_KEY && isEncrypted(extraFields[key])) {
          try {
            extraFields[key] = await decryptPII(extraFields[key], env.ENCRYPT_KEY!);
          } catch { /* 무시 */ }
        }
        // 전화번호 필드 마스킹
        if (key === 'phone' || key.toLowerCase().includes('phone')) {
          extraFields[key] = maskPhone(extraFields[key]);
        }
      }

      return {
        ...r,
        customer: {
          name: maskName(name),
          phone: maskPhone(phone),
          email,
        },
        extraFields,
      };
    })
  );

  return json(reservations);
};
