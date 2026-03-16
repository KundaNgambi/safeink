'use client';

import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type { User, Session, AuthError } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;

  initialize: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null; needsEmailConfirmation: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null; mfaRequired: boolean }>;
  signInWithOAuth: (provider: 'google' | 'apple' | 'azure') => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  verifyMfa: (factorId: string, code: string) => Promise<{ error: AuthError | null }>;
  enrollMfa: () => Promise<{ factorId: string; qrCode: string; secret: string } | { error: AuthError }>;
  getMfaFactors: () => Promise<{ totp: Array<{ id: string; status: string }> }>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    if (get().initialized) return;
    const supabase = createClient();

    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    set({
      session,
      user: session?.user ?? null,
      loading: false,
      initialized: true,
    });

    // Listen for auth state changes
    supabase.auth.onAuthStateChange((_event, session) => {
      set({
        session,
        user: session?.user ?? null,
        loading: false,
      });
    });
  },

  signUp: async (email, password, fullName) => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (!error && data.user) {
      set({ user: data.user, session: data.session });
    }

    return {
      error,
      needsEmailConfirmation: !error && !data.session,
    };
  },

  signIn: async (email, password) => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Check if it's an MFA challenge
      if (error.message?.includes('MFA') || (error as any).status === 401) {
        return { error: null, mfaRequired: true };
      }
      return { error, mfaRequired: false };
    }

    set({ user: data.user, session: data.session });
    return { error: null, mfaRequired: false };
  },

  signInWithOAuth: async (provider) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error };
  },

  signOut: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },

  verifyMfa: async (factorId, code) => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code,
    });

    if (!error && data) {
      // Refresh session after MFA verification
      const { data: { session } } = await supabase.auth.getSession();
      set({ session, user: session?.user ?? null });
    }

    return { error };
  },

  enrollMfa: async () => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'Authenticator App',
    });

    if (error) return { error };

    return {
      factorId: data.id,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
    };
  },

  getMfaFactors: async () => {
    const supabase = createClient();
    const { data } = await supabase.auth.mfa.listFactors();
    return {
      totp: data?.totp?.map((f) => ({ id: f.id, status: f.status })) ?? [],
    };
  },
}));
