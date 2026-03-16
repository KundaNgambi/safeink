import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Supabase client before importing the store
const mockSignInWithPassword = vi.fn();
const mockSignUp = vi.fn();
const mockSignInWithOAuth = vi.fn();
const mockSignOut = vi.fn();
const mockGetSession = vi.fn();
const mockGetUser = vi.fn();
const mockOnAuthStateChange = vi.fn();
const mockMfaChallengeAndVerify = vi.fn();
const mockMfaEnroll = vi.fn();
const mockMfaListFactors = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signInWithOAuth: mockSignInWithOAuth,
      signOut: mockSignOut,
      getSession: mockGetSession,
      getUser: mockGetUser,
      onAuthStateChange: mockOnAuthStateChange,
      mfa: {
        challengeAndVerify: mockMfaChallengeAndVerify,
        enroll: mockMfaEnroll,
        listFactors: mockMfaListFactors,
      },
    },
  }),
}));

import { useAuthStore } from '../store/auth';

function resetAuthStore() {
  useAuthStore.setState({
    user: null,
    session: null,
    loading: true,
    initialized: false,
  });
}

describe('AuthStore', () => {
  beforeEach(() => {
    resetAuthStore();
    vi.clearAllMocks();
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
  });

  // ─── Initialize ──────────────────────────────────────────────────
  describe('initialize', () => {
    it('should get session and set user on init', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      const mockSession = { user: mockUser, access_token: 'token' };
      mockGetSession.mockResolvedValue({ data: { session: mockSession } });

      await useAuthStore.getState().initialize();

      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().session).toEqual(mockSession);
      expect(useAuthStore.getState().loading).toBe(false);
      expect(useAuthStore.getState().initialized).toBe(true);
    });

    it('should set user to null when no session', async () => {
      mockGetSession.mockResolvedValue({ data: { session: null } });

      await useAuthStore.getState().initialize();

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().session).toBeNull();
      expect(useAuthStore.getState().loading).toBe(false);
    });

    it('should not re-initialize if already initialized', async () => {
      mockGetSession.mockResolvedValue({ data: { session: null } });
      await useAuthStore.getState().initialize();
      mockGetSession.mockClear();

      await useAuthStore.getState().initialize();
      expect(mockGetSession).not.toHaveBeenCalled();
    });

    it('should subscribe to auth state changes', async () => {
      mockGetSession.mockResolvedValue({ data: { session: null } });
      await useAuthStore.getState().initialize();
      expect(mockOnAuthStateChange).toHaveBeenCalled();
    });
  });

  // ─── Sign In ─────────────────────────────────────────────────────
  describe('signIn', () => {
    it('should sign in successfully', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      const mockSession = { user: mockUser, access_token: 'token' };
      mockSignInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const result = await useAuthStore.getState().signIn('test@example.com', 'password');

      expect(result.error).toBeNull();
      expect(result.mfaRequired).toBe(false);
      expect(useAuthStore.getState().user).toEqual(mockUser);
    });

    it('should return error on invalid credentials', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials', status: 400 },
      });

      const result = await useAuthStore.getState().signIn('bad@email.com', 'wrong');

      expect(result.error).toBeTruthy();
      expect(result.error!.message).toBe('Invalid login credentials');
      expect(useAuthStore.getState().user).toBeNull();
    });

    it('should call signInWithPassword with correct params', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      });

      await useAuthStore.getState().signIn('test@example.com', 'pass123');

      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'pass123',
      });
    });
  });

  // ─── Sign Up ─────────────────────────────────────────────────────
  describe('signUp', () => {
    it('should sign up successfully with session', async () => {
      const mockUser = { id: 'user-1', email: 'new@example.com' };
      const mockSession = { user: mockUser, access_token: 'token' };
      mockSignUp.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const result = await useAuthStore.getState().signUp('new@example.com', 'Password123!', 'John Doe');

      expect(result.error).toBeNull();
      expect(result.needsEmailConfirmation).toBe(false);
      expect(useAuthStore.getState().user).toEqual(mockUser);
    });

    it('should indicate email confirmation needed when no session returned', async () => {
      const mockUser = { id: 'user-1', email: 'new@example.com' };
      mockSignUp.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      });

      const result = await useAuthStore.getState().signUp('new@example.com', 'Password123!', 'John');

      expect(result.needsEmailConfirmation).toBe(true);
    });

    it('should return error on duplicate email', async () => {
      mockSignUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'User already registered' },
      });

      const result = await useAuthStore.getState().signUp('existing@example.com', 'Password123!', 'Jane');

      expect(result.error).toBeTruthy();
      expect(result.error!.message).toBe('User already registered');
    });

    it('should pass fullName in user metadata', async () => {
      mockSignUp.mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      });

      await useAuthStore.getState().signUp('test@example.com', 'Pass123!', 'Jane Doe');

      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Pass123!',
        options: { data: { full_name: 'Jane Doe' } },
      });
    });
  });

  // ─── Sign Out ────────────────────────────────────────────────────
  describe('signOut', () => {
    it('should clear user and session on sign out', async () => {
      useAuthStore.setState({
        user: { id: 'user-1' } as any,
        session: { access_token: 'token' } as any,
      });
      mockSignOut.mockResolvedValue({ error: null });

      await useAuthStore.getState().signOut();

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().session).toBeNull();
    });

    it('should call supabase signOut', async () => {
      mockSignOut.mockResolvedValue({ error: null });
      await useAuthStore.getState().signOut();
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  // ─── OAuth ───────────────────────────────────────────────────────
  describe('signInWithOAuth', () => {
    it('should call supabase with google provider', async () => {
      mockSignInWithOAuth.mockResolvedValue({ error: null });

      const result = await useAuthStore.getState().signInWithOAuth('google');

      expect(result.error).toBeNull();
      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: { redirectTo: expect.stringContaining('/auth/callback') },
      });
    });

    it('should return error when OAuth fails', async () => {
      mockSignInWithOAuth.mockResolvedValue({
        error: { message: 'Provider not configured' },
      });

      const result = await useAuthStore.getState().signInWithOAuth('apple');

      expect(result.error).toBeTruthy();
    });
  });

  // ─── MFA ─────────────────────────────────────────────────────────
  describe('MFA', () => {
    it('should verify MFA code', async () => {
      mockMfaChallengeAndVerify.mockResolvedValue({
        data: { id: 'challenge-1' },
        error: null,
      });
      mockGetSession.mockResolvedValue({
        data: { session: { user: { id: 'user-1' } } },
      });

      const result = await useAuthStore.getState().verifyMfa('factor-1', '123456');

      expect(result.error).toBeNull();
      expect(mockMfaChallengeAndVerify).toHaveBeenCalledWith({
        factorId: 'factor-1',
        code: '123456',
      });
    });

    it('should return error on invalid MFA code', async () => {
      mockMfaChallengeAndVerify.mockResolvedValue({
        data: null,
        error: { message: 'Invalid TOTP code' },
      });

      const result = await useAuthStore.getState().verifyMfa('factor-1', '000000');

      expect(result.error).toBeTruthy();
    });

    it('should get MFA factors', async () => {
      mockMfaListFactors.mockResolvedValue({
        data: {
          totp: [{ id: 'factor-1', status: 'verified' }],
        },
      });

      const result = await useAuthStore.getState().getMfaFactors();

      expect(result.totp).toHaveLength(1);
      expect(result.totp[0].id).toBe('factor-1');
      expect(result.totp[0].status).toBe('verified');
    });

    it('should return empty totp when no factors', async () => {
      mockMfaListFactors.mockResolvedValue({ data: { totp: [] } });

      const result = await useAuthStore.getState().getMfaFactors();

      expect(result.totp).toHaveLength(0);
    });

    it('should enroll MFA', async () => {
      mockMfaEnroll.mockResolvedValue({
        data: {
          id: 'factor-1',
          totp: { qr_code: 'data:image/svg...', secret: 'JBSWY3DPEHPK3PXP' },
        },
        error: null,
      });

      const result = await useAuthStore.getState().enrollMfa();

      expect('factorId' in result).toBe(true);
      if ('factorId' in result) {
        expect(result.factorId).toBe('factor-1');
        expect(result.secret).toBe('JBSWY3DPEHPK3PXP');
      }
    });
  });
});
