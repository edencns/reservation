export interface Env {
  DB: D1Database;
  // 인증
  JWT_SECRET?: string;        // HS256 JWT 서명 키 (Cloudflare 시크릿)
  ADMIN_PASSWORD?: string;    // 최초 관리자 계정 부트스트랩용 (이후 삭제 권장)
  // 개인정보 암호화
  ENCRYPT_KEY?: string;       // 64자 hex = 32바이트 AES-256 키 (Cloudflare 시크릿)
  // SMS
  COOLSMS_API_KEY?: string;
  COOLSMS_API_SECRET?: string;
  COOLSMS_SENDER?: string;
  // 외부 AI API
  GOOGLE_VISION_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  AI?: Ai;
  // 배포
  SITE_URL?: string;
}

export const json = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });

export const badRequest = (message: string): Response =>
  json({ error: message }, 400);

export const notFound = (message: string): Response =>
  json({ error: message }, 404);

export const readBody = async <T>(request: Request): Promise<T | null> => {
  try {
    return await request.json<T>();
  } catch {
    return null;
  }
};
