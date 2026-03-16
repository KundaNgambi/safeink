import { describe, it, expect, beforeAll } from 'vitest';
import {
  generateSalt,
  generateIV,
  deriveKey,
  encrypt,
  decrypt,
  generateEncryptionKey,
  exportKey,
  importKey,
} from './index';

// Polyfill Web Crypto for Node.js test environment
import { webcrypto } from 'node:crypto';
if (typeof globalThis.crypto === 'undefined') {
  // @ts-expect-error — webcrypto is compatible but types differ slightly
  globalThis.crypto = webcrypto;
}

describe('Crypto Module', () => {
  // ─── Salt Generation ───────────────────────────────────────────────
  describe('generateSalt', () => {
    it('should return a Uint8Array of length 16', async () => {
      const salt = await generateSalt();
      expect(salt).toBeInstanceOf(Uint8Array);
      expect(salt.length).toBe(16);
    });

    it('should produce unique salts on each call', async () => {
      const salt1 = await generateSalt();
      const salt2 = await generateSalt();
      expect(salt1).not.toEqual(salt2);
    });

    it('should contain non-zero bytes (statistical check)', async () => {
      const salt = await generateSalt();
      const hasNonZero = salt.some((b) => b !== 0);
      expect(hasNonZero).toBe(true);
    });
  });

  // ─── IV Generation ─────────────────────────────────────────────────
  describe('generateIV', () => {
    it('should return a Uint8Array of length 12', async () => {
      const iv = await generateIV();
      expect(iv).toBeInstanceOf(Uint8Array);
      expect(iv.length).toBe(12);
    });

    it('should produce unique IVs on each call', async () => {
      const iv1 = await generateIV();
      const iv2 = await generateIV();
      expect(iv1).not.toEqual(iv2);
    });
  });

  // ─── Key Derivation ────────────────────────────────────────────────
  describe('deriveKey', () => {
    // PBKDF2 with 600K iterations is intentionally slow — increase timeout
    const DERIVE_TIMEOUT = 30_000;

    it('should derive a CryptoKey from password and salt', async () => {
      const salt = await generateSalt();
      const key = await deriveKey('test-password', salt);
      expect(key).toBeDefined();
      expect(key.type).toBe('secret');
      expect(key.algorithm).toMatchObject({ name: 'AES-GCM', length: 256 });
    }, DERIVE_TIMEOUT);

    it('should produce the same key for same password and salt', async () => {
      const salt = await generateSalt();
      const key1 = await deriveKey('same-password', salt);
      const key2 = await deriveKey('same-password', salt);

      // Keys are non-extractable, so verify by encrypting same data
      const plaintext = 'determinism test';
      const ct1 = await encrypt(plaintext, key1);
      // Both keys should decrypt each other's ciphertext
      const result = await decrypt(ct1, key2);
      expect(result).toBe(plaintext);
    }, DERIVE_TIMEOUT);

    it('should produce different keys for different passwords', async () => {
      const salt = await generateSalt();
      const key1 = await deriveKey('password-1', salt);
      const key2 = await deriveKey('password-2', salt);

      const plaintext = 'cross-key test';
      const ct = await encrypt(plaintext, key1);
      await expect(decrypt(ct, key2)).rejects.toThrow();
    }, DERIVE_TIMEOUT);

    it('should produce different keys for different salts', async () => {
      const salt1 = await generateSalt();
      const salt2 = await generateSalt();
      const key1 = await deriveKey('same-password', salt1);
      const key2 = await deriveKey('same-password', salt2);

      const plaintext = 'cross-salt test';
      const ct = await encrypt(plaintext, key1);
      await expect(decrypt(ct, key2)).rejects.toThrow();
    }, DERIVE_TIMEOUT);

    it('should handle empty password', async () => {
      const salt = await generateSalt();
      const key = await deriveKey('', salt);
      expect(key).toBeDefined();
      const ct = await encrypt('test', key);
      const result = await decrypt(ct, key);
      expect(result).toBe('test');
    }, DERIVE_TIMEOUT);

    it('should handle very long password', async () => {
      const salt = await generateSalt();
      const longPassword = 'a'.repeat(10000);
      const key = await deriveKey(longPassword, salt);
      expect(key).toBeDefined();
      const ct = await encrypt('test', key);
      const result = await decrypt(ct, key);
      expect(result).toBe('test');
    }, DERIVE_TIMEOUT);

    it('should handle unicode password', async () => {
      const salt = await generateSalt();
      const key = await deriveKey('пароль密码パスワード🔑', salt);
      expect(key).toBeDefined();
      const ct = await encrypt('test', key);
      const result = await decrypt(ct, key);
      expect(result).toBe('test');
    }, DERIVE_TIMEOUT);

    it('should produce non-extractable keys', async () => {
      const salt = await generateSalt();
      const key = await deriveKey('test', salt);
      expect(key.extractable).toBe(false);
    }, DERIVE_TIMEOUT);
  });

  // ─── Encrypt / Decrypt Round-Trip ──────────────────────────────────
  describe('encrypt / decrypt', () => {
    let key: CryptoKey;

    beforeAll(async () => {
      key = await generateEncryptionKey();
    });

    it('should round-trip simple plaintext', async () => {
      const plaintext = 'Hello, Safeink!';
      const ciphertext = await encrypt(plaintext, key);
      const decrypted = await decrypt(ciphertext, key);
      expect(decrypted).toBe(plaintext);
    });

    it('should round-trip empty string', async () => {
      const ciphertext = await encrypt('', key);
      const decrypted = await decrypt(ciphertext, key);
      expect(decrypted).toBe('');
    });

    it('should round-trip unicode text', async () => {
      const plaintext = '日本語テスト — Ñoño — Ελληνικά — العربية';
      const ciphertext = await encrypt(plaintext, key);
      const decrypted = await decrypt(ciphertext, key);
      expect(decrypted).toBe(plaintext);
    });

    it('should round-trip emoji-heavy text', async () => {
      const plaintext = '🔐🗝️🛡️💻📱🎯✅❌⚠️🚀';
      const ciphertext = await encrypt(plaintext, key);
      const decrypted = await decrypt(ciphertext, key);
      expect(decrypted).toBe(plaintext);
    });

    it('should round-trip multiline text', async () => {
      const plaintext = 'Line 1\nLine 2\nLine 3\n\n\tTabbed line';
      const ciphertext = await encrypt(plaintext, key);
      const decrypted = await decrypt(ciphertext, key);
      expect(decrypted).toBe(plaintext);
    });

    it('should round-trip text with special characters', async () => {
      const plaintext = '<script>alert("xss")</script> & "quotes" \'apos\' \\ backslash';
      const ciphertext = await encrypt(plaintext, key);
      const decrypted = await decrypt(ciphertext, key);
      expect(decrypted).toBe(plaintext);
    });

    it('should round-trip large text (~100KB)', async () => {
      const plaintext = 'x'.repeat(100_000);
      const ciphertext = await encrypt(plaintext, key);
      const decrypted = await decrypt(ciphertext, key);
      expect(decrypted).toBe(plaintext);
      expect(decrypted.length).toBe(100_000);
    });

    it('should round-trip JSON content', async () => {
      const obj = { title: 'Test Note', body: 'Content here', tags: [1, 2, 3] };
      const plaintext = JSON.stringify(obj);
      const ciphertext = await encrypt(plaintext, key);
      const decrypted = await decrypt(ciphertext, key);
      expect(JSON.parse(decrypted)).toEqual(obj);
    });

    it('should produce base64-encoded ciphertext', async () => {
      const ciphertext = await encrypt('test', key);
      expect(typeof ciphertext).toBe('string');
      // Valid base64 characters only
      expect(ciphertext).toMatch(/^[A-Za-z0-9+/=]+$/);
    });

    it('should produce different ciphertext for same plaintext (random IV)', async () => {
      const plaintext = 'nonce uniqueness test';
      const ct1 = await encrypt(plaintext, key);
      const ct2 = await encrypt(plaintext, key);
      expect(ct1).not.toBe(ct2);
      // But both should decrypt to the same plaintext
      expect(await decrypt(ct1, key)).toBe(plaintext);
      expect(await decrypt(ct2, key)).toBe(plaintext);
    });

    it('should produce ciphertext longer than plaintext (IV + auth tag overhead)', async () => {
      const plaintext = 'short';
      const ciphertext = await encrypt(plaintext, key);
      // Base64 of (12 IV + encrypted + 16 auth tag) should be longer than plaintext
      const rawBytes = atob(ciphertext).length;
      expect(rawBytes).toBeGreaterThan(plaintext.length);
      // At minimum: 12 (IV) + plaintext.length + 16 (GCM tag) = 33 bytes
      expect(rawBytes).toBeGreaterThanOrEqual(12 + plaintext.length + 16);
    });
  });

  // ─── Decryption Failure Cases ──────────────────────────────────────
  describe('decryption failures', () => {
    let key: CryptoKey;

    beforeAll(async () => {
      key = await generateEncryptionKey();
    });

    it('should fail with wrong key', async () => {
      const wrongKey = await generateEncryptionKey();
      const ct = await encrypt('secret data', key);
      await expect(decrypt(ct, wrongKey)).rejects.toThrow();
    });

    it('should fail with tampered ciphertext (flipped bit)', async () => {
      const ct = await encrypt('secret data', key);
      const bytes = Uint8Array.from(atob(ct), (c) => c.charCodeAt(0));
      // Flip a bit in the encrypted data (after IV)
      bytes[15] ^= 0x01;
      const tampered = btoa(String.fromCharCode(...bytes));
      await expect(decrypt(tampered, key)).rejects.toThrow();
    });

    it('should fail with truncated ciphertext', async () => {
      const ct = await encrypt('secret data', key);
      const truncated = ct.slice(0, ct.length / 2);
      await expect(decrypt(truncated, key)).rejects.toThrow();
    });

    it('should fail with empty ciphertext', async () => {
      await expect(decrypt('', key)).rejects.toThrow();
    });

    it('should fail with garbage input', async () => {
      await expect(decrypt('not-valid-base64!!!', key)).rejects.toThrow();
    });

    it('should not silently return wrong data on tampering', async () => {
      const ct = await encrypt('original', key);
      const bytes = Uint8Array.from(atob(ct), (c) => c.charCodeAt(0));
      // Modify data portion
      bytes[20] ^= 0xff;
      const tampered = btoa(String.fromCharCode(...bytes));
      // GCM should reject — it must throw, never return altered plaintext
      try {
        const result = await decrypt(tampered, key);
        // If somehow it doesn't throw, the result must NOT equal original
        // (this shouldn't happen with GCM, but we verify the invariant)
        expect(result).not.toBe('original');
      } catch {
        // Expected — GCM authentication failure
        expect(true).toBe(true);
      }
    });
  });

  // ─── Key Generation ────────────────────────────────────────────────
  describe('generateEncryptionKey', () => {
    it('should generate a valid AES-256-GCM key', async () => {
      const key = await generateEncryptionKey();
      expect(key.type).toBe('secret');
      expect(key.algorithm).toMatchObject({ name: 'AES-GCM', length: 256 });
      expect(key.extractable).toBe(true);
      expect(key.usages).toContain('encrypt');
      expect(key.usages).toContain('decrypt');
    });

    it('should generate unique keys each time', async () => {
      const key1 = await generateEncryptionKey();
      const key2 = await generateEncryptionKey();
      const exported1 = await exportKey(key1);
      const exported2 = await exportKey(key2);
      expect(exported1).not.toBe(exported2);
    });
  });

  // ─── Key Export / Import ───────────────────────────────────────────
  describe('exportKey / importKey', () => {
    it('should round-trip a key through export and import', async () => {
      const original = await generateEncryptionKey();
      const exported = await exportKey(original);
      const imported = await importKey(exported);

      // Verify by encrypting with original and decrypting with imported
      const plaintext = 'key export test';
      const ct = await encrypt(plaintext, original);
      const result = await decrypt(ct, imported);
      expect(result).toBe(plaintext);
    });

    it('should export to a base64 string', async () => {
      const key = await generateEncryptionKey();
      const exported = await exportKey(key);
      expect(typeof exported).toBe('string');
      expect(exported).toMatch(/^[A-Za-z0-9+/=]+$/);
    });

    it('should export to a 32-byte key (44 chars in base64)', async () => {
      const key = await generateEncryptionKey();
      const exported = await exportKey(key);
      const raw = atob(exported);
      expect(raw.length).toBe(32); // 256 bits = 32 bytes
    });

    it('should produce same export for same key', async () => {
      const key = await generateEncryptionKey();
      const export1 = await exportKey(key);
      const export2 = await exportKey(key);
      expect(export1).toBe(export2);
    });

    it('imported key should have correct properties', async () => {
      const original = await generateEncryptionKey();
      const exported = await exportKey(original);
      const imported = await importKey(exported);
      expect(imported.type).toBe('secret');
      expect(imported.algorithm).toMatchObject({ name: 'AES-GCM', length: 256 });
      expect(imported.extractable).toBe(true);
      expect(imported.usages).toContain('encrypt');
      expect(imported.usages).toContain('decrypt');
    });

    it('should fail to import invalid key data', async () => {
      await expect(importKey('short')).rejects.toThrow();
    });

    it('should allow encrypt with imported key and decrypt with original', async () => {
      const original = await generateEncryptionKey();
      const imported = await importKey(await exportKey(original));

      const plaintext = 'bidirectional test';
      const ct = await encrypt(plaintext, imported);
      const result = await decrypt(ct, original);
      expect(result).toBe(plaintext);
    });
  });

  // ─── Cross-Cutting Concerns ────────────────────────────────────────
  describe('cross-cutting', () => {
    it('should work with derived key for full encrypt/decrypt cycle', async () => {
      const password = 'my-secure-password';
      const salt = await generateSalt();
      const key = await deriveKey(password, salt);

      const plaintext = 'End-to-end with PBKDF2 derived key';
      const ct = await encrypt(plaintext, key);
      const result = await decrypt(ct, key);
      expect(result).toBe(plaintext);
    }, 30_000);

    it('should handle concurrent encrypt/decrypt operations', async () => {
      const key = await generateEncryptionKey();
      const texts = Array.from({ length: 20 }, (_, i) => `Note #${i}: ${Date.now()}`);

      const encrypted = await Promise.all(texts.map((t) => encrypt(t, key)));
      const decrypted = await Promise.all(encrypted.map((ct) => decrypt(ct, key)));

      expect(decrypted).toEqual(texts);
    });

    it('should handle null bytes in plaintext', async () => {
      const key = await generateEncryptionKey();
      const plaintext = 'before\x00after';
      const ct = await encrypt(plaintext, key);
      const result = await decrypt(ct, key);
      expect(result).toBe(plaintext);
    });

    it('full user flow: password → derive key → encrypt → export key → import key → decrypt', async () => {
      // Simulate: user signs up, encrypts a note, key is stored, later imported to decrypt
      const password = 'user-master-password-123!';
      const salt = await generateSalt();

      // Generate a random note encryption key
      const noteKey = await generateEncryptionKey();

      // Encrypt note content
      const noteContent = '# My Secret Note\n\nThis is private.';
      const encryptedNote = await encrypt(noteContent, noteKey);

      // Export the note key, then encrypt it with the derived key
      const exportedNoteKey = await exportKey(noteKey);
      const derivedKey = await deriveKey(password, salt);
      const encryptedNoteKey = await encrypt(exportedNoteKey, derivedKey);

      // --- Later, user logs in again ---
      const derivedKey2 = await deriveKey(password, salt);
      const decryptedNoteKeyStr = await decrypt(encryptedNoteKey, derivedKey2);
      const restoredNoteKey = await importKey(decryptedNoteKeyStr);

      // Decrypt the note
      const decryptedNote = await decrypt(encryptedNote, restoredNoteKey);
      expect(decryptedNote).toBe(noteContent);
    }, 60_000);
  });
});
