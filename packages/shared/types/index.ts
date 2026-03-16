export interface Note {
  id: string;
  user_id: string;
  title_encrypted: string;
  body_encrypted: string;
  category_id: string | null;
  pinned: boolean;
  archived: boolean;
  locked: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NoteDecrypted {
  id: string;
  user_id: string;
  title: string;
  body: string;
  category_id: string | null;
  pinned: boolean;
  archived: boolean;
  locked: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  parent_id: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  children?: Category[];
}

export interface NoteVersion {
  id: string;
  note_id: string;
  title_encrypted: string;
  body_encrypted: string;
  version: number;
  created_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  theme: 'dark' | 'light' | 'system';
  language: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  metadata: Record<string, unknown>;
  ip_address: string;
  created_at: string;
}

export interface Share {
  id: string;
  note_id: string;
  owner_id: string;
  shared_with_id: string;
  role: 'editor' | 'viewer';
  expires_at: string | null;
  created_at: string;
}

export type UserRole = 'owner' | 'admin' | 'editor' | 'viewer' | 'guest';

export const CATEGORY_ICONS = [
  'folder', 'briefcase', 'home', 'rocket', 'book-open', 'lightbulb', 'target', 'microscope', 'plane', 'palette',
  'music', 'wallet', 'dumbbell', 'cooking-pot', 'camera', 'globe', 'star', 'wrench', 'bar-chart-3', 'flask-conical',
] as const;

export const CATEGORY_COLORS = [
  '#5B9BFF', '#BEFF46', '#FFA726', '#FF6B6B', '#AB47BC',
  '#26C6DA', '#FF7043', '#66BB6A', '#EC407A', '#8D6E63',
] as const;

export const MAX_CATEGORY_DEPTH = 3;
export const MAX_CATEGORY_NAME_LENGTH = 50;
