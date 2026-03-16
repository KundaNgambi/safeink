-- Fix: note_versions INSERT was blocked by RLS when updating notes
-- The trigger function runs as the calling user, but no INSERT policy existed.
-- Solution: make the trigger SECURITY DEFINER so it bypasses RLS,
-- AND add explicit INSERT/DELETE policies for completeness.

-- 1. Recreate the trigger function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION create_note_version()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
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

-- 2. Add INSERT policy (belt-and-suspenders: trigger uses SECURITY DEFINER,
--    but users should also be able to insert versions for their own notes)
CREATE POLICY "Users insert own note versions" ON note_versions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM notes WHERE notes.id = note_versions.note_id AND notes.user_id = auth.uid()
    )
  );

-- 3. Add DELETE policy (for cleanup operations)
CREATE POLICY "Users delete own note versions" ON note_versions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM notes WHERE notes.id = note_versions.note_id AND notes.user_id = auth.uid()
    )
  );
