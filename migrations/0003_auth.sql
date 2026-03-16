-- ── 인증 및 보안 강화 마이그레이션 ──────────────────────────────────────────

-- 사용자 계정 테이블 (관리자 + 업체)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  login_id TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,        -- PBKDF2:salt:hash
  role TEXT NOT NULL CHECK(role IN ('admin', 'vendor')),
  vendor_id TEXT,                     -- role='vendor'일 때 연결된 업체 ID
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_login_id ON users(login_id);

-- 키오스크 재출력 PIN 테이블 (하드코딩 12345 대체)
CREATE TABLE IF NOT EXISTS kiosk_pins (
  event_id TEXT PRIMARY KEY,
  pin_hash TEXT NOT NULL,             -- PBKDF2:salt:hash
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 티켓 URL 토큰 테이블 (URL에 전화번호 노출 대체)
CREATE TABLE IF NOT EXISTS ticket_tokens (
  token TEXT PRIMARY KEY,             -- crypto.randomUUID()
  event_slug TEXT NOT NULL,
  phone_enc TEXT NOT NULL,            -- AES-256-GCM 암호화된 전화번호
  expires_at TEXT NOT NULL,           -- ISO 8601, 7일 유효
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ticket_tokens_slug ON ticket_tokens(event_slug);
CREATE INDEX IF NOT EXISTS idx_ticket_tokens_expires ON ticket_tokens(expires_at);

-- SMS 발송 속도 제한 로그 (과금 방지)
CREATE TABLE IF NOT EXISTS sms_rate_log (
  id TEXT PRIMARY KEY,
  ip TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  sent_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sms_rate_ip ON sms_rate_log(ip, sent_at);
