/**
 * GET /api/auth/me
 * 현재 로그인된 사용자 정보 반환
 */
import { json } from '../_lib/db';
import type { Env } from '../_lib/db';
import { getSessionUser } from '../_lib/auth';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const user = await getSessionUser(request, env);
  if (!user) return json({ user: null }, 200);
  return json({
    user: {
      id: user.id,
      loginId: user.loginId,
      role: user.role,
      vendorId: user.vendorId,
    },
  });
};
