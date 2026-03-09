-- FK 제약 없는 reservations 테이블로 재생성
-- (SQLite는 ALTER TABLE DROP CONSTRAINT 미지원 → 재생성 방식 사용)

CREATE TABLE IF NOT EXISTS reservations_new (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  status TEXT NOT NULL,
  customer_phone TEXT,
  visit_date TEXT,
  checked_in INTEGER NOT NULL DEFAULT 0,
  checked_in_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data TEXT NOT NULL
);

INSERT OR IGNORE INTO reservations_new SELECT * FROM reservations;

DROP TABLE reservations;

ALTER TABLE reservations_new RENAME TO reservations;

CREATE INDEX IF NOT EXISTS idx_reservations_event_id ON reservations(event_id);
CREATE INDEX IF NOT EXISTS idx_reservations_phone ON reservations(customer_phone);
CREATE INDEX IF NOT EXISTS idx_reservations_visit_date ON reservations(visit_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
