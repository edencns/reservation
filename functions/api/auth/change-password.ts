/**
 * POST /api/auth/change-password
 * 비밀번호 변경 (로그인된 사용자)
 */
import { json, badRequest, readBody } from '../_lib/db';
import type { Env } from '../_lib/db';
import { getSessionUser, verifyPassword, hashPassword } from '../_lib/auth';

interface Body {
  currentPassword: string;
  newPassword: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const user = await getSessionUser(request, env);
  if (!user) return json({ error: '인증이 필요합니다.' }, 401);

  const body = await readBody<Body>(request);
  if (!body?.currentPassword || !body?.newPassword) {
    return badRequest('현재 비밀번호와 새 비밀번호를 입력하세요.');
  }
  if (body.newPassword.length < 8) {
    return badRequest('새 비밀번호는 8자 이상이어야 합니다.');
  }

  const row = await env.DB.prepare(
    'SELECT password_hash FROM users WHERE id = ?',
  ).bind(user.id).first<{ password_hash: string }>();

  if (!row || !(await verifyPassword(body.currentPassword, row.password_hash))) {
    return json({ error: '현재 비밀번호가 올바르지 않습니다.' }, 401);
  }

  const newHash = await hashPassword(body.newPassword);
  await env.DB.prepare(
    'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
  ).bind(newHash, user.id).run();

  return json({ ok: true });
};
