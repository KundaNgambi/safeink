-- Enable Realtime for notes and categories
ALTER PUBLICATION supabase_realtime ADD TABLE notes;
ALTER PUBLICATION supabase_realtime ADD TABLE categories;

-- Function to get category depth
CREATE OR REPLACE FUNCTION get_category_depth(cat_id UUID)
RETURNS INTEGER AS $$
DECLARE
  depth INTEGER := 0;
  current_parent UUID;
BEGIN
  SELECT parent_id INTO current_parent FROM categories WHERE id = cat_id;
  WHILE current_parent IS NOT NULL LOOP
    depth := depth + 1;
    SELECT parent_id INTO current_parent FROM categories WHERE id = current_parent;
  END LOOP;
  RETURN depth;
END;
$$ LANGUAGE plpgsql;

-- Enforce max category depth of 3
CREATE OR REPLACE FUNCTION enforce_category_depth()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.parent_id IS NOT NULL THEN
    IF get_category_depth(NEW.parent_id) >= 2 THEN
      RAISE EXCEPTION 'Maximum category depth of 3 levels exceeded';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER categories_depth_check
  BEFORE INSERT OR UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION enforce_category_depth();

-- Auto-create user settings on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id, theme, language)
  VALUES (NEW.id, 'dark', 'en');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
