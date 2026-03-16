/**
 * POST /api/auth/login
 * 로그인: JWT를 HttpOnly Secure 쿠키로 발급
 */
import { json, badRequest, readBody } from '../_lib/db';
import type { Env } from '../_lib/db';
import {
  verifyPassword,
  signJwt,
  makeSessionCookie,
  bootstrapAdminUser,
  getJwtSecret,
} from '../_lib/auth';

interface LoginBody {
  loginId: string;
  password: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const body = await readBody<LoginBody>(request);
  if (!body?.loginId || !body?.password) {
    return badRequest('아이디와 비밀번호를 입력하세요.');
  }

  if (!env.DB) {
    return json({ error: 'DB가 설정되지 않았습니다.' }, 503);
  }

  // 최초 실행 시 관리자 계정 자동 생성
  await bootstrapAdminUser(env);

  const row = await env.DB.prepare(
    'SELECT id, password_hash, role, vendor_id FROM users WHERE login_id = ?',
  ).bind(body.loginId.trim()).first<{
    id: string;
    password_hash: string;
    role: 'admin' | 'vendor';
    vendor_id: string | null;
  }>();

  if (!row) {
    // timing attack 방지: 존재하지 않아도 해시 연산 수행
    await verifyPassword(body.password, 'pbkdf2:dummy:0000000000000000000000000000000000000000000000000000000000000000');
    return json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' }, 401);
  }

  const valid = await verifyPassword(body.password, row.password_hash);
  if (!valid) {
    return json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' }, 401);
  }

  const payload: Record<string, unknown> = {
    sub: row.id,
    loginId: body.loginId.trim(),
    role: row.role,
  };
  if (row.vendor_id) payload.vendorId = row.vendor_id;

  const token = await signJwt(payload, getJwtSecret(env));

  return new Response(
    JSON.stringify({ ok: true, role: row.role, vendorId: row.vendor_id ?? undefined }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': makeSessionCookie(token),
      },
    },
  );
};
