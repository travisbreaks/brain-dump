-- brain-dump D1 schema
CREATE TABLE IF NOT EXISTS recordings (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  title TEXT,
  duration_seconds INTEGER,
  audio_format TEXT NOT NULL,
  audio_r2_key TEXT,
  audio_size_bytes INTEGER,
  raw_transcript TEXT,
  edited_transcript TEXT,
  status TEXT DEFAULT 'uploading',
  error_message TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_recordings_user
  ON recordings(user_email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recordings_status
  ON recordings(status);
