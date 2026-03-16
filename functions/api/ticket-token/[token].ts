/**
 * GET /api/ticket-token/:token
 * 티켓 URL 토큰으로 전화번호 조회
 * URL에 전화번호를 직접 노출하지 않기 위한 토큰 방식
 */
import { json, notFound } from '../_lib/db';
import type { Env } from '../_lib/db';
import { decryptPII } from '../_lib/auth';

interface Params { token: string; }

interface TokenRow {
  event_slug: string;
  phone_enc: string;
  expires_at: string;
}

export const onRequestGet: PagesFunction<Env, Params> = async ({ params, env }) => {
  const { token } = params;
  if (!token || token.length < 10) return notFound('유효하지 않은 토큰입니다.');

  const row = await env.DB.prepare(
    'SELECT event_slug, phone_enc, expires_at FROM ticket_tokens WHERE token = ?',
  ).bind(token).first<TokenRow>();

  if (!row) return notFound('토큰을 찾을 수 없습니다.');

  if (new Date(row.expires_at) < new Date()) {
    return json({ error: '만료된 토큰입니다.' }, 410);
  }

  let phone = row.phone_enc;
  if (env.ENCRYPT_KEY) {
    try {
      phone = await decryptPII(row.phone_enc, env.ENCRYPT_KEY);
    } catch {
      return json({ error: '토큰 복호화 실패' }, 500);
    }
  }

  return json({ phone, eventSlug: row.event_slug });
};
