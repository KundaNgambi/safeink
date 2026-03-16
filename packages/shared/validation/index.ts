import { z } from 'zod';
import { CATEGORY_COLORS, CATEGORY_ICONS, MAX_CATEGORY_NAME_LENGTH } from '../types';

export const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Must contain at least one digit')
  .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character');

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  confirmPassword: z.string(),
  fullName: z.string().min(1, 'Name is required').max(100),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const signinSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const mfaVerifySchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits').regex(/^\d{6}$/, 'Code must be numeric'),
});

export const noteCreateSchema = z.object({
  title_encrypted: z.string().min(1),
  body_encrypted: z.string(),
  category_id: z.string().uuid().nullable().optional(),
  pinned: z.boolean().optional().default(false),
});

export const noteUpdateSchema = z.object({
  title_encrypted: z.string().min(1).optional(),
  body_encrypted: z.string().optional(),
  category_id: z.string().uuid().nullable().optional(),
  pinned: z.boolean().optional(),
  archived: z.boolean().optional(),
});

export const categoryCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(MAX_CATEGORY_NAME_LENGTH),
  icon: z.string().refine((val) => (CATEGORY_ICONS as readonly string[]).includes(val), 'Invalid icon'),
  color: z.string().refine((val) => (CATEGORY_COLORS as readonly string[]).includes(val), 'Invalid color'),
  parent_id: z.string().uuid().nullable().optional(),
});

export const categoryUpdateSchema = z.object({
  name: z.string().min(1).max(MAX_CATEGORY_NAME_LENGTH).optional(),
  icon: z.string().refine((val) => (CATEGORY_ICONS as readonly string[]).includes(val), 'Invalid icon').optional(),
  color: z.string().refine((val) => (CATEGORY_COLORS as readonly string[]).includes(val), 'Invalid color').optional(),
});

export const categoryDeleteSchema = z.object({
  reassign_to: z.string().uuid().nullable(),
});

export const categoryReorderSchema = z.object({
  items: z.array(z.object({
    id: z.string().uuid(),
    sort_order: z.number().int().min(0),
  })),
});

export const shareNoteSchema = z.object({
  note_id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['editor', 'viewer']),
  expires_at: z.string().datetime().nullable().optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type SigninInput = z.infer<typeof signinSchema>;
export type NoteCreateInput = z.infer<typeof noteCreateSchema>;
export type NoteUpdateInput = z.infer<typeof noteUpdateSchema>;
export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
export type CategoryDeleteInput = z.infer<typeof categoryDeleteSchema>;
export type CategoryReorderInput = z.infer<typeof categoryReorderSchema>;
