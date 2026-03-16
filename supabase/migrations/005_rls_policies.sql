-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- Every table must have RLS enabled and policies
-- ============================================

-- NOTES POLICIES
CREATE POLICY "Users read own notes" ON notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own notes" ON notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own notes" ON notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own notes" ON notes
  FOR DELETE USING (auth.uid() = user_id);

-- Users can read shared notes
CREATE POLICY "Users read shared notes" ON notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM shares
      WHERE shares.note_id = notes.id
      AND shares.shared_with_id = auth.uid()
      AND (shares.expires_at IS NULL OR shares.expires_at > now())
    )
  );

-- CATEGORIES POLICIES
CREATE POLICY "Users read own categories" ON categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own categories" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own categories" ON categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own categories" ON categories
  FOR DELETE USING (auth.uid() = user_id);

-- NOTE VERSIONS POLICIES
CREATE POLICY "Users read own note versions" ON note_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM notes WHERE notes.id = note_versions.note_id AND notes.user_id = auth.uid()
    )
  );

-- AUDIT LOGS POLICIES (read-only for users, insert via service role)
CREATE POLICY "Users read own audit logs" ON audit_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service inserts audit logs" ON audit_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- USER SETTINGS POLICIES
CREATE POLICY "Users read own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- SHARES POLICIES
CREATE POLICY "Owners manage shares" ON shares
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Recipients read shares" ON shares
  FOR SELECT USING (auth.uid() = shared_with_id);
