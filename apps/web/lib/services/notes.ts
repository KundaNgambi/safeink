import { createClient } from '@/lib/supabase/client';
import { encrypt, decrypt } from '@safeink/shared';
import type { Note, NoteDecrypted } from '@safeink/shared';

async function getEncryptionKey(): Promise<CryptoKey> {
  // For now, use a key derived from the user's session.
  // In production, this should use PBKDF2 with the user's master password.
  const { generateEncryptionKey, exportKey, importKey } = await import('@safeink/shared');

  const stored = sessionStorage.getItem('obscura_enc_key');
  if (stored) {
    return importKey(stored);
  }

  const key = await generateEncryptionKey();
  const exported = await exportKey(key);
  sessionStorage.setItem('obscura_enc_key', exported);
  return key;
}

async function decryptNote(note: Note): Promise<NoteDecrypted> {
  const key = await getEncryptionKey();
  try {
    return {
      id: note.id,
      user_id: note.user_id,
      title: await decrypt(note.title_encrypted, key),
      body: await decrypt(note.body_encrypted, key),
      category_id: note.category_id,
      pinned: note.pinned,
      archived: note.archived,
      deleted_at: note.deleted_at,
      created_at: note.created_at,
      updated_at: note.updated_at,
    };
  } catch {
    // If decryption fails (e.g. key mismatch), return placeholder
    return {
      id: note.id,
      user_id: note.user_id,
      title: '[Encrypted — unable to decrypt]',
      body: '',
      category_id: note.category_id,
      pinned: note.pinned,
      archived: note.archived,
      deleted_at: note.deleted_at,
      created_at: note.created_at,
      updated_at: note.updated_at,
    };
  }
}

export async function fetchNotes(): Promise<NoteDecrypted[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .is('deleted_at', null)
    .order('pinned', { ascending: false })
    .order('updated_at', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return Promise.all(data.map(decryptNote));
}

export async function createNote(title: string, body: string, categoryId: string | null): Promise<NoteDecrypted> {
  const supabase = createClient();
  const key = await getEncryptionKey();

  const title_encrypted = await encrypt(title, key);
  const body_encrypted = await encrypt(body, key);

  const { data, error } = await supabase
    .from('notes')
    .insert({
      title_encrypted,
      body_encrypted,
      category_id: categoryId,
      pinned: false,
    })
    .select()
    .single();

  if (error) throw error;
  return decryptNote(data);
}

export async function updateNote(
  id: string,
  updates: Partial<Pick<NoteDecrypted, 'title' | 'body' | 'category_id' | 'pinned' | 'archived'>>
): Promise<NoteDecrypted> {
  const supabase = createClient();
  const key = await getEncryptionKey();

  const dbUpdates: Record<string, unknown> = {};
  if (updates.title !== undefined) {
    dbUpdates.title_encrypted = await encrypt(updates.title, key);
  }
  if (updates.body !== undefined) {
    dbUpdates.body_encrypted = await encrypt(updates.body, key);
  }
  if (updates.category_id !== undefined) {
    dbUpdates.category_id = updates.category_id;
  }
  if (updates.pinned !== undefined) {
    dbUpdates.pinned = updates.pinned;
  }
  if (updates.archived !== undefined) {
    dbUpdates.archived = updates.archived;
  }

  const { data, error } = await supabase
    .from('notes')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return decryptNote(data);
}

export async function deleteNote(id: string): Promise<void> {
  const supabase = createClient();
  // Soft delete
  const { error } = await supabase
    .from('notes')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

export async function permanentlyDeleteNote(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
