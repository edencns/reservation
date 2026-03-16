/**
 * GET  /api/vendors — 업체 목록 조회 (관리자 전용)
 * POST /api/vendors — 업체 생성 + 사용자 계정 생성 (관리자 전용)
 */
import { json, readBody, badRequest } from './_lib/db';
import type { Env } from './_lib/db';
import { withAdmin, hashPassword } from './_lib/auth';
import type { ManagedVendor } from '../../src/types';

interface VendorRow {
  id: string;
  login_id: string | null;
  data: string;
}

export const onRequestGet: PagesFunction<Env> = withAdmin(async ({ env }) => {
  if (!env.DB) return json([]);
  const { results } = await env.DB.prepare(
    'SELECT id, login_id, data FROM vendors ORDER BY created_at DESC'
  ).all<VendorRow>();
  const vendors = (results ?? []).map(row => ({
    ...(JSON.parse(row.data) as ManagedVendor),
    loginId: row.login_id ?? undefined,
    // loginPassword는 절대 반환하지 않음
    loginPassword: undefined,
  }));
  return json(vendors);
});

export const onRequestPost: PagesFunction<Env> = withAdmin(async ({ request, env }) => {
  const vendor = await readBody<ManagedVendor & { loginPassword?: string }>(request);
  if (!vendor?.id || !vendor?.name) return badRequest('업체 정보가 필요합니다.');
  if (!env.DB) return json({ ok: true });

  // 업체 저장 (loginPassword는 data에서 제거)
  const { loginPassword, loginId, ...vendorData } = vendor;
  const dataToStore = { ...vendorData, loginId };

  await env.DB.prepare(
    `INSERT OR REPLACE INTO vendors (id, name, login_id, created_at, updated_at, data)
     VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)`
  ).bind(
    vendor.id,
    vendor.name,
    loginId ?? null,
    JSON.stringify(dataToStore),
  ).run();

  // 로그인 계정 생성 (loginId와 loginPassword가 있을 때)
  if (loginId && loginPassword) {
    const passwordHash = await hashPassword(loginPassword);

    // 기존 계정 확인
    const existing = await env.DB.prepare(
      'SELECT id FROM users WHERE login_id = ?'
    ).bind(loginId).first<{ id: string }>();

    if (existing) {
      // 비밀번호 업데이트
      await env.DB.prepare(
        'UPDATE users SET password_hash = ?, vendor_id = ?, updated_at = CURRENT_TIMESTAMP WHERE login_id = ?'
      ).bind(passwordHash, vendor.id, loginId).run();
    } else {
      // 새 계정 생성
      await env.DB.prepare(
        `INSERT INTO users (id, login_id, password_hash, role, vendor_id) VALUES (?, ?, ?, 'vendor', ?)`
      ).bind(crypto.randomUUID(), loginId, passwordHash, vendor.id).run();
    }
  }

  return json({ ok: true });
});
