import { deriveKey, exportKey } from '@safeink/shared';
import { createClient } from '@/lib/supabase/client';

const SESSION_KEY = 'obscura_enc_key';

/**
 * Derive an encryption key from the user's password and a stable salt,
 * then store it in sessionStorage so notes can be encrypted/decrypted.
 */
export async function deriveAndStoreKey(password: string, salt: Uint8Array): Promise<void> {
  const key = await deriveKey(password, salt);
  const exported = await exportKey(key);
  sessionStorage.setItem(SESSION_KEY, exported);
}

/**
 * Generate a random salt (16 bytes) and return it as a base64 string
 * suitable for storing in Supabase user_metadata.
 */
export function generateSaltBase64(): string {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return btoa(String.fromCharCode(...salt));
}

/**
 * Convert a base64 salt string back to a Uint8Array.
 */
export function saltFromBase64(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

/**
 * On signup: generate salt, store in user_metadata, derive encryption key.
 */
export async function setupEncryptionOnSignup(password: string): Promise<void> {
  const supabase = createClient();
  const saltB64 = generateSaltBase64();

  // Store the salt in user metadata so it's available on any device
  await supabase.auth.updateUser({
    data: { encryption_salt: saltB64 },
  });

  const salt = saltFromBase64(saltB64);
  await deriveAndStoreKey(password, salt);
}

/**
 * On login: retrieve salt from user_metadata, derive encryption key.
 */
export async function setupEncryptionOnLogin(password: string): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const saltB64 = user.user_metadata?.encryption_salt;
  if (!saltB64) {
    // Legacy user without a salt — generate one now and re-encrypt.
    // For now, just set up a new salt (existing notes won't be decryptable
    // until a migration is run, but new notes will work cross-device).
    await setupEncryptionOnSignup(password);
    return;
  }

  const salt = saltFromBase64(saltB64);
  await deriveAndStoreKey(password, salt);
}
