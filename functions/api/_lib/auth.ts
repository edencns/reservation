/**
 * 인증/암호화 유틸리티
 * - JWT HS256 (Web Crypto API)
 * - PBKDF2 비밀번호 해싱
 * - AES-256-GCM 개인정보 암호화
 * - 미들웨어 헬퍼
 */
import type { Env } from './db';

export interface SessionUser {
  id: string;
  loginId: string;
  role: 'admin' | 'vendor';
  vendorId?: string;
}

// ── 바이트 변환 헬퍼 ──────────────────────────────────────────────────────────

function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) throw new Error('Invalid hex string');
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
}

function base64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64urlDecode(str: string): ArrayBuffer {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = (4 - (padded.length % 4)) % 4;
  const b64 = padded + '='.repeat(pad);
  const binary = atob(b64);
  const buf = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < binary.length; i++) {
    view[i] = binary.charCodeAt(i);
  }
  return buf;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

// ── JWT (HS256) ───────────────────────────────────────────────────────────────

const JWT_EXPIRY_SECONDS = 86400; // 24시간

export async function signJwt(
  payload: Record<string, unknown>,
  secret: string,
): Promise<string> {
  const header = base64url(encoder.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const claims = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY_SECONDS,
  };
  const body = base64url(encoder.encode(JSON.stringify(claims)));
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(`${header}.${body}`));
  return `${header}.${body}.${base64url(new Uint8Array(sig))}`;
}

export async function verifyJwt(
  token: string,
  secret: string,
): Promise<Record<string, unknown> | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const key = await crypto.subtle.importKey(
      'raw', encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false, ['verify'],
    );
    const valid = await crypto.subtle.verify(
      'HMAC', key,
      base64urlDecode(signature),
      encoder.encode(`${header}.${body}`),
    );
    if (!valid) return null;
    const payload = JSON.parse(decoder.decode(new Uint8Array(base64urlDecode(body)))) as Record<string, unknown>;
    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.exp === 'number' && payload.exp < now) return null;
    return payload;
  } catch {
    return null;
  }
}

// ── PBKDF2 비밀번호 해싱 ──────────────────────────────────────────────────────

/** 관리자/업체 비밀번호: 100,000 iterations */
export async function hashPassword(password: string): Promise<string> {
  const salt = bytesToHex(crypto.getRandomValues(new Uint8Array(16)));
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: encoder.encode(salt), iterations: 100_000, hash: 'SHA-256' },
    keyMaterial, 256,
  );
  return `pbkdf2:${salt}:${bytesToHex(new Uint8Array(bits))}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(':');
  if (parts.length !== 3 || parts[0] !== 'pbkdf2') return false;
  const [, salt, expectedHash] = parts;
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: encoder.encode(salt), iterations: 100_000, hash: 'SHA-256' },
    keyMaterial, 256,
  );
  // timing-safe 비교
  const computed = bytesToHex(new Uint8Array(bits));
  if (computed.length !== expectedHash.length) return false;
  let diff = 0;
  for (let i = 0; i < computed.length; i++) {
    diff |= computed.charCodeAt(i) ^ expectedHash.charCodeAt(i);
  }
  return diff === 0;
}

/** 키오스크 PIN: 10,000 iterations (빠른 검증용) */
export async function hashPin(pin: string): Promise<string> {
  const salt = bytesToHex(crypto.getRandomValues(new Uint8Array(16)));
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(pin), 'PBKDF2', false, ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: encoder.encode(salt), iterations: 10_000, hash: 'SHA-256' },
    keyMaterial, 256,
  );
  return `pbkdf2pin:${salt}:${bytesToHex(new Uint8Array(bits))}`;
}

export async function verifyPin(pin: string, stored: string): Promise<boolean> {
  const parts = stored.split(':');
  if (parts.length !== 3 || parts[0] !== 'pbkdf2pin') return false;
  const [, salt, expectedHash] = parts;
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(pin), 'PBKDF2', false, ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: encoder.encode(salt), iterations: 10_000, hash: 'SHA-256' },
    keyMaterial, 256,
  );
  const computed = bytesToHex(new Uint8Array(bits));
  if (computed.length !== expectedHash.length) return false;
  let diff = 0;
  for (let i = 0; i < computed.length; i++) {
    diff |= computed.charCodeAt(i) ^ expectedHash.charCodeAt(i);
  }
  return diff === 0;
}

// ── AES-256-GCM 개인정보 암호화 ──────────────────────────────────────────────

/** ENCRYPT_KEY: 64자 hex (32바이트) */
async function getEncryptKey(hexKey: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw', hexToBytes(hexKey), 'AES-GCM', false, ['encrypt', 'decrypt'],
  );
}

export async function encryptPII(plaintext: string, hexKey: string): Promise<string> {
  const key = await getEncryptKey(hexKey);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(plaintext),
  );
  return `${bytesToHex(iv)}:${bytesToHex(new Uint8Array(encrypted))}`;
}

export async function decryptPII(ciphertext: string, hexKey: string): Promise<string> {
  const colonIdx = ciphertext.indexOf(':');
  if (colonIdx === -1) throw new Error('Invalid ciphertext');
  const ivHex = ciphertext.slice(0, colonIdx);
  const dataHex = ciphertext.slice(colonIdx + 1);
  const key = await getEncryptKey(hexKey);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: hexToBytes(ivHex) },
    key,
    hexToBytes(dataHex),
  );
  return decoder.decode(decrypted);
}

/** 암호화된 문자열인지 확인 (iv:data 형태) */
export function isEncrypted(value: string): boolean {
  return /^[0-9a-f]{24}:[0-9a-f]{32,}$/i.test(value);
}

// ── 마스킹 ────────────────────────────────────────────────────────────────────

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) return `${digits.slice(0, 3)}-****-${digits.slice(7)}`;
  if (digits.length === 10) return `${digits.slice(0, 3)}-***-${digits.slice(6)}`;
  return phone.slice(0, 3) + '****';
}

export function maskName(name: string): string {
  if (!name) return '';
  if (name.length === 1) return '*';
  if (name.length === 2) return name[0] + '*';
  return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
}

// ── 쿠키 / 세션 ───────────────────────────────────────────────────────────────

const COOKIE_NAME = 'rv_session';

function parseCookies(cookieHeader: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx < 0) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    try { result[k] = decodeURIComponent(v); } catch { result[k] = v; }
  }
  return result;
}

export function makeSessionCookie(token: string): string {
  return `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${JWT_EXPIRY_SECONDS}`;
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

/** JWT_SECRET 없으면 개발 환경용 기본값 사용 (경고 로그) */
function getJwtSecret(env: Env): string {
  if (!env.JWT_SECRET) {
    console.warn('[보안 경고] JWT_SECRET 환경변수가 설정되지 않았습니다. 프로덕션에서 반드시 설정하세요.');
    return 'dev_jwt_secret_CHANGE_IN_PRODUCTION_!!';
  }
  return env.JWT_SECRET;
}

export async function getSessionUser(request: Request, env: Env): Promise<SessionUser | null> {
  const cookieHeader = request.headers.get('Cookie') ?? '';
  const cookies = parseCookies(cookieHeader);
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  const payload = await verifyJwt(token, getJwtSecret(env));
  if (!payload || typeof payload.sub !== 'string') return null;
  return {
    id: payload.sub,
    loginId: payload.loginId as string,
    role: payload.role as 'admin' | 'vendor',
    vendorId: payload.vendorId as string | undefined,
  };
}

// ── 응답 헬퍼 ─────────────────────────────────────────────────────────────────

export const unauthorized = (message = '인증이 필요합니다'): Response =>
  new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });

export const forbidden = (message = '권한이 없습니다'): Response =>
  new Response(JSON.stringify({ error: message }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' },
  });

// ── 미들웨어 래퍼 ─────────────────────────────────────────────────────────────

export function withAdmin<E extends Env, P extends string = string>(
  handler: PagesFunction<E, P>,
): PagesFunction<E, P> {
  return async (ctx) => {
    const user = await getSessionUser(ctx.request, ctx.env);
    if (!user) return unauthorized();
    if (user.role !== 'admin') return forbidden();
    return handler(ctx);
  };
}

export function withAuth<E extends Env, P extends string = string>(
  handler: PagesFunction<E, P>,
): PagesFunction<E, P> {
  return async (ctx) => {
    const user = await getSessionUser(ctx.request, ctx.env);
    if (!user) return unauthorized();
    return handler(ctx);
  };
}

// ── 관리자 최초 부트스트랩 ────────────────────────────────────────────────────

/**
 * DB에 관리자가 없을 때 ADMIN_PASSWORD 환경변수로 자동 생성.
 * 최초 1회만 실행됨.
 */
export async function bootstrapAdminUser(env: Env): Promise<void> {
  if (!env.DB) return;
  const existing = await env.DB.prepare(
    "SELECT id FROM users WHERE role = 'admin' LIMIT 1",
  ).first();
  if (existing) return;

  const initPassword = env.ADMIN_PASSWORD ?? 'ReserveTicket@2024!';
  const hash = await hashPassword(initPassword);
  await env.DB.prepare(
    `INSERT INTO users (id, login_id, password_hash, role) VALUES (?, ?, ?, 'admin')`,
  ).bind(crypto.randomUUID(), 'admin', hash).run();

  if (!env.ADMIN_PASSWORD) {
    console.warn('[초기화] 기본 관리자 계정 생성됨. ADMIN_PASSWORD 환경변수로 비밀번호를 변경하세요.');
  }
}

export { getJwtSecret, JWT_EXPIRY_SECONDS };
