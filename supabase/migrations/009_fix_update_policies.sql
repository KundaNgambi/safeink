-- ============================================
-- FIX: Add WITH CHECK to UPDATE policies
-- Without WITH CHECK, updates could theoretically
-- change user_id to another user's ID
-- ============================================

-- Notes: drop and recreate with WITH CHECK
DROP POLICY IF EXISTS "Users update own notes" ON notes;
CREATE POLICY "Users update own notes" ON notes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Categories: drop and recreate with WITH CHECK
DROP POLICY IF EXISTS "Users update own categories" ON categories;
CREATE POLICY "Users update own categories" ON categories
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
