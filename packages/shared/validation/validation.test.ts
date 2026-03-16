import { describe, it, expect } from 'vitest';
import {
  passwordSchema,
  signupSchema,
  signinSchema,
  mfaVerifySchema,
  noteCreateSchema,
  noteUpdateSchema,
  categoryCreateSchema,
  categoryUpdateSchema,
  categoryDeleteSchema,
  categoryReorderSchema,
  shareNoteSchema,
} from './index';

const VALID_PASSWORD = 'SecurePass123!';
const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';
const VALID_EMAIL = 'test@example.com';

// ─── Password Schema ─────────────────────────────────────────────────
describe('passwordSchema', () => {
  it('should accept a valid password', () => {
    expect(passwordSchema.safeParse(VALID_PASSWORD).success).toBe(true);
  });

  it('should reject password shorter than 12 characters', () => {
    const result = passwordSchema.safeParse('Short1!a');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('at least 12');
    }
  });

  it('should reject password without uppercase', () => {
    const result = passwordSchema.safeParse('lowercaseonly1!');
    expect(result.success).toBe(false);
  });

  it('should reject password without lowercase', () => {
    const result = passwordSchema.safeParse('UPPERCASEONLY1!');
    expect(result.success).toBe(false);
  });

  it('should reject password without digit', () => {
    const result = passwordSchema.safeParse('NoDigitsHere!!');
    expect(result.success).toBe(false);
  });

  it('should reject password without special character', () => {
    const result = passwordSchema.safeParse('NoSpecialChar1A');
    expect(result.success).toBe(false);
  });

  it('should accept exactly 12 characters with all requirements', () => {
    expect(passwordSchema.safeParse('Abcdefghij1!').success).toBe(true);
  });

  it('should accept very long passwords', () => {
    const long = 'A' + 'a'.repeat(200) + '1!';
    expect(passwordSchema.safeParse(long).success).toBe(true);
  });

  it('should reject empty string', () => {
    expect(passwordSchema.safeParse('').success).toBe(false);
  });

  it('should reject non-string types', () => {
    expect(passwordSchema.safeParse(12345678901).success).toBe(false);
    expect(passwordSchema.safeParse(null).success).toBe(false);
    expect(passwordSchema.safeParse(undefined).success).toBe(false);
  });
});

// ─── Signup Schema ───────────────────────────────────────────────────
describe('signupSchema', () => {
  const validSignup = {
    email: VALID_EMAIL,
    password: VALID_PASSWORD,
    confirmPassword: VALID_PASSWORD,
    fullName: 'John Doe',
  };

  it('should accept valid signup data', () => {
    expect(signupSchema.safeParse(validSignup).success).toBe(true);
  });

  it('should reject invalid email', () => {
    expect(signupSchema.safeParse({ ...validSignup, email: 'not-email' }).success).toBe(false);
  });

  it('should reject empty email', () => {
    expect(signupSchema.safeParse({ ...validSignup, email: '' }).success).toBe(false);
  });

  it('should reject weak password', () => {
    expect(signupSchema.safeParse({ ...validSignup, password: 'weak', confirmPassword: 'weak' }).success).toBe(false);
  });

  it('should reject mismatched passwords', () => {
    const result = signupSchema.safeParse({ ...validSignup, confirmPassword: 'DifferentPass1!' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      expect(paths).toContain('confirmPassword');
    }
  });

  it('should reject empty fullName', () => {
    expect(signupSchema.safeParse({ ...validSignup, fullName: '' }).success).toBe(false);
  });

  it('should reject fullName longer than 100 characters', () => {
    expect(signupSchema.safeParse({ ...validSignup, fullName: 'x'.repeat(101) }).success).toBe(false);
  });

  it('should accept fullName of exactly 100 characters', () => {
    expect(signupSchema.safeParse({ ...validSignup, fullName: 'x'.repeat(100) }).success).toBe(true);
  });

  it('should reject missing fields', () => {
    expect(signupSchema.safeParse({}).success).toBe(false);
    expect(signupSchema.safeParse({ email: VALID_EMAIL }).success).toBe(false);
  });
});

// ─── Signin Schema ───────────────────────────────────────────────────
describe('signinSchema', () => {
  it('should accept valid credentials', () => {
    expect(signinSchema.safeParse({ email: VALID_EMAIL, password: 'any-password' }).success).toBe(true);
  });

  it('should reject invalid email', () => {
    expect(signinSchema.safeParse({ email: 'bad', password: 'test' }).success).toBe(false);
  });

  it('should reject empty password', () => {
    expect(signinSchema.safeParse({ email: VALID_EMAIL, password: '' }).success).toBe(false);
  });

  it('should not enforce password strength (that is signup only)', () => {
    // Signin just checks it's non-empty
    expect(signinSchema.safeParse({ email: VALID_EMAIL, password: 'x' }).success).toBe(true);
  });

  it('should reject missing fields', () => {
    expect(signinSchema.safeParse({}).success).toBe(false);
  });
});

// ─── MFA Verify Schema ──────────────────────────────────────────────
describe('mfaVerifySchema', () => {
  it('should accept valid 6-digit code', () => {
    expect(mfaVerifySchema.safeParse({ code: '123456' }).success).toBe(true);
  });

  it('should accept code with leading zeros', () => {
    expect(mfaVerifySchema.safeParse({ code: '000001' }).success).toBe(true);
  });

  it('should reject code shorter than 6 digits', () => {
    expect(mfaVerifySchema.safeParse({ code: '12345' }).success).toBe(false);
  });

  it('should reject code longer than 6 digits', () => {
    expect(mfaVerifySchema.safeParse({ code: '1234567' }).success).toBe(false);
  });

  it('should reject non-numeric code', () => {
    expect(mfaVerifySchema.safeParse({ code: 'abcdef' }).success).toBe(false);
  });

  it('should reject code with spaces', () => {
    expect(mfaVerifySchema.safeParse({ code: '123 56' }).success).toBe(false);
  });

  it('should reject empty code', () => {
    expect(mfaVerifySchema.safeParse({ code: '' }).success).toBe(false);
  });

  it('should reject missing code', () => {
    expect(mfaVerifySchema.safeParse({}).success).toBe(false);
  });
});

// ─── Note Create Schema ─────────────────────────────────────────────
describe('noteCreateSchema', () => {
  it('should accept valid note with all fields', () => {
    const result = noteCreateSchema.safeParse({
      title_encrypted: 'encrypted-title',
      body_encrypted: 'encrypted-body',
      category_id: VALID_UUID,
      pinned: true,
    });
    expect(result.success).toBe(true);
  });

  it('should accept note with only required fields', () => {
    const result = noteCreateSchema.safeParse({
      title_encrypted: 'title',
      body_encrypted: '',
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty title_encrypted', () => {
    expect(noteCreateSchema.safeParse({ title_encrypted: '', body_encrypted: 'body' }).success).toBe(false);
  });

  it('should accept null category_id', () => {
    const result = noteCreateSchema.safeParse({
      title_encrypted: 'title',
      body_encrypted: 'body',
      category_id: null,
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid UUID for category_id', () => {
    expect(noteCreateSchema.safeParse({
      title_encrypted: 'title',
      body_encrypted: 'body',
      category_id: 'not-a-uuid',
    }).success).toBe(false);
  });

  it('should default pinned to false', () => {
    const result = noteCreateSchema.safeParse({
      title_encrypted: 'title',
      body_encrypted: 'body',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.pinned).toBe(false);
    }
  });

  it('should reject missing title_encrypted', () => {
    expect(noteCreateSchema.safeParse({ body_encrypted: 'body' }).success).toBe(false);
  });
});

// ─── Note Update Schema ─────────────────────────────────────────────
describe('noteUpdateSchema', () => {
  it('should accept partial update with title only', () => {
    expect(noteUpdateSchema.safeParse({ title_encrypted: 'new-title' }).success).toBe(true);
  });

  it('should accept partial update with body only', () => {
    expect(noteUpdateSchema.safeParse({ body_encrypted: 'new-body' }).success).toBe(true);
  });

  it('should accept full update', () => {
    expect(noteUpdateSchema.safeParse({
      title_encrypted: 'title',
      body_encrypted: 'body',
      category_id: VALID_UUID,
      pinned: true,
      archived: false,
    }).success).toBe(true);
  });

  it('should accept empty object (no fields required)', () => {
    expect(noteUpdateSchema.safeParse({}).success).toBe(true);
  });

  it('should reject title_encrypted if empty string', () => {
    expect(noteUpdateSchema.safeParse({ title_encrypted: '' }).success).toBe(false);
  });

  it('should accept null category_id', () => {
    expect(noteUpdateSchema.safeParse({ category_id: null }).success).toBe(true);
  });

  it('should reject invalid category_id UUID', () => {
    expect(noteUpdateSchema.safeParse({ category_id: 'bad' }).success).toBe(false);
  });
});

// ─── Category Create Schema ─────────────────────────────────────────
describe('categoryCreateSchema', () => {
  const validCategory = {
    name: 'Work',
    icon: '📁',
    color: '#5B9BFF',
  };

  it('should accept valid category', () => {
    expect(categoryCreateSchema.safeParse(validCategory).success).toBe(true);
  });

  it('should accept category with parent_id', () => {
    expect(categoryCreateSchema.safeParse({ ...validCategory, parent_id: VALID_UUID }).success).toBe(true);
  });

  it('should accept null parent_id', () => {
    expect(categoryCreateSchema.safeParse({ ...validCategory, parent_id: null }).success).toBe(true);
  });

  it('should reject empty name', () => {
    expect(categoryCreateSchema.safeParse({ ...validCategory, name: '' }).success).toBe(false);
  });

  it('should reject name longer than MAX_CATEGORY_NAME_LENGTH (50)', () => {
    expect(categoryCreateSchema.safeParse({ ...validCategory, name: 'x'.repeat(51) }).success).toBe(false);
  });

  it('should accept name of exactly 50 characters', () => {
    expect(categoryCreateSchema.safeParse({ ...validCategory, name: 'x'.repeat(50) }).success).toBe(true);
  });

  it('should reject invalid icon not in CATEGORY_ICONS', () => {
    expect(categoryCreateSchema.safeParse({ ...validCategory, icon: '🤖' }).success).toBe(false);
  });

  it('should accept all valid icons', () => {
    const icons = ['📁', '💼', '🏠', '🚀', '📚', '💡', '🎯', '🔬', '✈️', '🎨',
      '🎵', '💰', '🏋️', '🍳', '📸', '🌍', '⭐', '🔧', '📊', '🧪'];
    for (const icon of icons) {
      expect(categoryCreateSchema.safeParse({ ...validCategory, icon }).success).toBe(true);
    }
  });

  it('should reject invalid color not in CATEGORY_COLORS', () => {
    expect(categoryCreateSchema.safeParse({ ...validCategory, color: '#000000' }).success).toBe(false);
  });

  it('should accept all valid colors', () => {
    const colors = ['#5B9BFF', '#BEFF46', '#FFA726', '#FF6B6B', '#AB47BC',
      '#26C6DA', '#FF7043', '#66BB6A', '#EC407A', '#8D6E63'];
    for (const color of colors) {
      expect(categoryCreateSchema.safeParse({ ...validCategory, color }).success).toBe(true);
    }
  });

  it('should reject invalid parent_id UUID', () => {
    expect(categoryCreateSchema.safeParse({ ...validCategory, parent_id: 'bad' }).success).toBe(false);
  });

  it('should reject missing required fields', () => {
    expect(categoryCreateSchema.safeParse({}).success).toBe(false);
    expect(categoryCreateSchema.safeParse({ name: 'Test' }).success).toBe(false);
    expect(categoryCreateSchema.safeParse({ name: 'Test', icon: '📁' }).success).toBe(false);
  });
});

// ─── Category Update Schema ─────────────────────────────────────────
describe('categoryUpdateSchema', () => {
  it('should accept partial update with name only', () => {
    expect(categoryUpdateSchema.safeParse({ name: 'New Name' }).success).toBe(true);
  });

  it('should accept partial update with icon only', () => {
    expect(categoryUpdateSchema.safeParse({ icon: '🚀' }).success).toBe(true);
  });

  it('should accept partial update with color only', () => {
    expect(categoryUpdateSchema.safeParse({ color: '#FF6B6B' }).success).toBe(true);
  });

  it('should accept empty object', () => {
    expect(categoryUpdateSchema.safeParse({}).success).toBe(true);
  });

  it('should reject empty name', () => {
    expect(categoryUpdateSchema.safeParse({ name: '' }).success).toBe(false);
  });

  it('should reject name exceeding 50 chars', () => {
    expect(categoryUpdateSchema.safeParse({ name: 'x'.repeat(51) }).success).toBe(false);
  });

  it('should reject invalid icon', () => {
    expect(categoryUpdateSchema.safeParse({ icon: '❓' }).success).toBe(false);
  });

  it('should reject invalid color', () => {
    expect(categoryUpdateSchema.safeParse({ color: 'red' }).success).toBe(false);
  });
});

// ─── Category Delete Schema ─────────────────────────────────────────
describe('categoryDeleteSchema', () => {
  it('should accept valid reassign UUID', () => {
    expect(categoryDeleteSchema.safeParse({ reassign_to: VALID_UUID }).success).toBe(true);
  });

  it('should accept null reassign_to (delete notes too)', () => {
    expect(categoryDeleteSchema.safeParse({ reassign_to: null }).success).toBe(true);
  });

  it('should reject invalid UUID', () => {
    expect(categoryDeleteSchema.safeParse({ reassign_to: 'not-uuid' }).success).toBe(false);
  });

  it('should reject missing reassign_to', () => {
    expect(categoryDeleteSchema.safeParse({}).success).toBe(false);
  });
});

// ─── Category Reorder Schema ────────────────────────────────────────
describe('categoryReorderSchema', () => {
  it('should accept valid reorder items', () => {
    const result = categoryReorderSchema.safeParse({
      items: [
        { id: VALID_UUID, sort_order: 0 },
        { id: '660e8400-e29b-41d4-a716-446655440001', sort_order: 1 },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('should accept empty items array', () => {
    expect(categoryReorderSchema.safeParse({ items: [] }).success).toBe(true);
  });

  it('should reject negative sort_order', () => {
    expect(categoryReorderSchema.safeParse({
      items: [{ id: VALID_UUID, sort_order: -1 }],
    }).success).toBe(false);
  });

  it('should reject non-integer sort_order', () => {
    expect(categoryReorderSchema.safeParse({
      items: [{ id: VALID_UUID, sort_order: 1.5 }],
    }).success).toBe(false);
  });

  it('should reject invalid UUID in items', () => {
    expect(categoryReorderSchema.safeParse({
      items: [{ id: 'bad', sort_order: 0 }],
    }).success).toBe(false);
  });

  it('should reject missing items field', () => {
    expect(categoryReorderSchema.safeParse({}).success).toBe(false);
  });

  it('should reject item missing sort_order', () => {
    expect(categoryReorderSchema.safeParse({
      items: [{ id: VALID_UUID }],
    }).success).toBe(false);
  });

  it('should reject item missing id', () => {
    expect(categoryReorderSchema.safeParse({
      items: [{ sort_order: 0 }],
    }).success).toBe(false);
  });
});

// ─── Share Note Schema ───────────────────────────────────────────────
describe('shareNoteSchema', () => {
  const validShare = {
    note_id: VALID_UUID,
    email: VALID_EMAIL,
    role: 'editor' as const,
  };

  it('should accept valid share as editor', () => {
    expect(shareNoteSchema.safeParse(validShare).success).toBe(true);
  });

  it('should accept valid share as viewer', () => {
    expect(shareNoteSchema.safeParse({ ...validShare, role: 'viewer' }).success).toBe(true);
  });

  it('should accept share with expires_at', () => {
    expect(shareNoteSchema.safeParse({
      ...validShare,
      expires_at: '2026-12-31T23:59:59Z',
    }).success).toBe(true);
  });

  it('should accept null expires_at', () => {
    expect(shareNoteSchema.safeParse({ ...validShare, expires_at: null }).success).toBe(true);
  });

  it('should reject invalid role', () => {
    expect(shareNoteSchema.safeParse({ ...validShare, role: 'admin' }).success).toBe(false);
  });

  it('should reject invalid note_id UUID', () => {
    expect(shareNoteSchema.safeParse({ ...validShare, note_id: 'bad' }).success).toBe(false);
  });

  it('should reject invalid email', () => {
    expect(shareNoteSchema.safeParse({ ...validShare, email: 'not-email' }).success).toBe(false);
  });

  it('should reject invalid expires_at format', () => {
    expect(shareNoteSchema.safeParse({ ...validShare, expires_at: 'tomorrow' }).success).toBe(false);
  });

  it('should reject missing required fields', () => {
    expect(shareNoteSchema.safeParse({}).success).toBe(false);
    expect(shareNoteSchema.safeParse({ note_id: VALID_UUID }).success).toBe(false);
    expect(shareNoteSchema.safeParse({ note_id: VALID_UUID, email: VALID_EMAIL }).success).toBe(false);
  });
});
