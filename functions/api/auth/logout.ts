/**
 * POST /api/auth/logout
 * 로그아웃: 세션 쿠키 삭제
 */
import { clearSessionCookie } from '../_lib/auth';

export const onRequestPost: PagesFunction = async () => {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': clearSessionCookie(),
    },
  });
};
