/**
 * PUT    /api/vendors/:id — 업체 수정 (관리자 전용)
 * DELETE /api/vendors/:id — 업체 삭제 + 사용자 계정 삭제 (관리자 전용)
 */
import { json, readBody, badRequest, notFound } from '../_lib/db';
import type { Env } from '../_lib/db';
import { withAdmin, hashPassword } from '../_lib/auth';
import type { ManagedVendor } from '../../../src/types';

interface Params { id: string; }

export const onRequestPut: PagesFunction<Env, Params> = withAdmin(async ({ params, request, env }) => {
  const vendor = await readBody<ManagedVendor & { loginPassword?: string }>(request);
  if (!vendor?.name) return badRequest('업체 정보가 필요합니다.');

  const existing = await env.DB.prepare('SELECT id FROM vendors WHERE id = ?').bind(params.id).first();
  if (!existing) return notFound('업체를 찾을 수 없습니다.');

  const { loginPassword, loginId, ...vendorData } = vendor;
  const dataToStore = { ...vendorData, id: params.id, loginId };

  await env.DB.prepare(
    'UPDATE vendors SET name = ?, login_id = ?, updated_at = CURRENT_TIMESTAMP, data = ? WHERE id = ?'
  ).bind(vendor.name, loginId ?? null, JSON.stringify(dataToStore), params.id).run();

  // 비밀번호 변경 요청 시
  if (loginId && loginPassword) {
    const passwordHash = await hashPassword(loginPassword);
    const userRow = await env.DB.prepare(
      'SELECT id FROM users WHERE vendor_id = ?'
    ).bind(params.id).first<{ id: string }>();

    if (userRow) {
      await env.DB.prepare(
        'UPDATE users SET login_id = ?, password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).bind(loginId, passwordHash, userRow.id).run();
    } else {
      await env.DB.prepare(
        `INSERT INTO users (id, login_id, password_hash, role, vendor_id) VALUES (?, ?, ?, 'vendor', ?)`
      ).bind(crypto.randomUUID(), loginId, passwordHash, params.id).run();
    }
  }

  return json({ ok: true });
});

export const onRequestDelete: PagesFunction<Env, Params> = withAdmin(async ({ params, env }) => {
  const existing = await env.DB.prepare('SELECT id FROM vendors WHERE id = ?').bind(params.id).first();
  if (!existing) return notFound('업체를 찾을 수 없습니다.');

  // 연결된 사용자 계정도 삭제
  await env.DB.prepare('DELETE FROM users WHERE vendor_id = ?').bind(params.id).run();
  await env.DB.prepare('DELETE FROM vendors WHERE id = ?').bind(params.id).run();

  return json({ ok: true });
});
