-- Add CHECK constraints for data integrity
-- (user_settings.theme and shares.role already have CHECK constraints)

-- Notes: title must not be empty
ALTER TABLE notes ADD CONSTRAINT chk_notes_title_not_empty
  CHECK (length(title_encrypted) > 0);

-- Categories: name must not be empty, sort_order must be non-negative
ALTER TABLE categories ADD CONSTRAINT chk_categories_name_not_empty
  CHECK (length(name) > 0);

ALTER TABLE categories ADD CONSTRAINT chk_categories_sort_order_positive
  CHECK (sort_order >= 0);

ALTER TABLE categories ADD CONSTRAINT chk_categories_color_format
  CHECK (color ~ '^#[0-9A-Fa-f]{6}$');

-- Note versions: version must be positive
ALTER TABLE note_versions ADD CONSTRAINT chk_note_versions_positive
  CHECK (version > 0);

-- Audit logs: action and resource_type must not be empty
ALTER TABLE audit_logs ADD CONSTRAINT chk_audit_logs_action_not_empty
  CHECK (length(action) > 0);

ALTER TABLE audit_logs ADD CONSTRAINT chk_audit_logs_resource_type_not_empty
  CHECK (length(resource_type) > 0);

-- Shares: owner cannot share with themselves
ALTER TABLE shares ADD CONSTRAINT chk_shares_not_self
  CHECK (owner_id != shared_with_id);
