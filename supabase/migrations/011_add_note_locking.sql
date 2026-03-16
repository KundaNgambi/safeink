-- Add per-note locking: users can lock individual notes behind their password
ALTER TABLE notes ADD COLUMN IF NOT EXISTS locked BOOLEAN NOT NULL DEFAULT false;
