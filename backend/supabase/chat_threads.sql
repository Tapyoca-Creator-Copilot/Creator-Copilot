-- Run this in the Supabase SQL editor to create the chat_threads table.

CREATE TABLE IF NOT EXISTS chat_threads (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL,
  title      TEXT,
  status     TEXT        NOT NULL DEFAULT 'regular'
                         CHECK (status IN ('regular', 'archived')),
  state      JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for efficient per-user thread listing, ordered by most recently updated.
CREATE INDEX IF NOT EXISTS chat_threads_user_status_updated_idx
  ON chat_threads (user_id, status, updated_at DESC);

-- Automatically bump updated_at on every row update.
CREATE OR REPLACE FUNCTION update_chat_threads_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS chat_threads_updated_at_trigger ON chat_threads;
CREATE TRIGGER chat_threads_updated_at_trigger
  BEFORE UPDATE ON chat_threads
  FOR EACH ROW EXECUTE FUNCTION update_chat_threads_updated_at();

-- Row Level Security: each user can only see and modify their own threads.
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own threads" ON chat_threads;
CREATE POLICY "Users can manage their own threads"
  ON chat_threads
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
