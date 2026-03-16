-- Create note versions table for version history
CREATE TABLE IF NOT EXISTS note_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  title_encrypted TEXT NOT NULL,
  body_encrypted TEXT NOT NULL DEFAULT '',
  version INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_note_versions_note_id ON note_versions(note_id);
CREATE UNIQUE INDEX idx_note_versions_unique ON note_versions(note_id, version);

-- Trigger to create version on note update
CREATE OR REPLACE FUNCTION create_note_version()
RETURNS TRIGGER AS $$
DECLARE
  next_version INTEGER;
BEGIN
  SELECT COALESCE(MAX(version), 0) + 1 INTO next_version
  FROM note_versions WHERE note_id = OLD.id;

  INSERT INTO note_versions (note_id, title_encrypted, body_encrypted, version)
  VALUES (OLD.id, OLD.title_encrypted, OLD.body_encrypted, next_version);

  -- Clean up versions older than 30 days
  DELETE FROM note_versions
  WHERE note_id = OLD.id AND created_at < now() - INTERVAL '30 days';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notes_version_trigger
  BEFORE UPDATE OF title_encrypted, body_encrypted ON notes
  FOR EACH ROW
  EXECUTE FUNCTION create_note_version();

ALTER TABLE note_versions ENABLE ROW LEVEL SECURITY;
