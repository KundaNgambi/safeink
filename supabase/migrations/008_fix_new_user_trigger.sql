-- Fix the handle_new_user trigger to be resilient
-- The previous version could fail if user_settings table had issues

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    INSERT INTO user_settings (user_id, theme, language)
    VALUES (NEW.id, 'dark', 'en')
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- Don't block user signup if settings insert fails
    RAISE WARNING 'Failed to create user_settings for user %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
