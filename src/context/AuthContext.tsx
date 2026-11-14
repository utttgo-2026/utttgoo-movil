import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { errorMessage } from '@/services/api/errors';
import { createAuthSession } from '@/services/authSession';
import type { UserPatch } from '@/types/api';
import type { User, UserRole } from '@/types/models';
import { resendSignupOtp, verifySignupOtp } from '@/services/supabaseAuth';

type AuthResult = { success: boolean; error?: string };
type SessionStatus = 'restoring' | 'anonymous' | 'authenticated' | 'blocked';

interface AuthContextValue {
  user: User | null;
  role: UserRole | null;
  status: SessionStatus;
  sessionError?: string;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (fullName: string, email: string, password: string) => Promise<AuthResult>;
  verifyEmail: (email: string, otp: string) => Promise<AuthResult>;
  resendEmailCode: (email: string) => Promise<AuthResult>;
  restoreSession: () => Promise<void>;
  refreshProfile: () => Promise<AuthResult>;
  updateProfile: (patch: UserPatch) => Promise<AuthResult>;
  logout: () => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session] = useState(createAuthSession);
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<SessionStatus>('restoring');
  const [sessionError, setSessionError] = useState<string>();
  const revision = useRef(0);
  const pendingCredentials = useRef<{ email: string; password: string } | null>(null);

  const restoreSession = useCallback(async () => {
    const current = ++revision.current;
    setUser(null);
    setStatus('restoring');
    setSessionError(undefined);
    try {
      const restored = await session.restore();
      if (current !== revision.current) return;
      setUser(restored);
      setStatus(restored ? 'authenticated' : 'anonymous');
    } catch (error) {
      if (current !== revision.current) return;
      setStatus('blocked');
      setSessionError(errorMessage(error));
    }
  }, [session]);

  useEffect(() => {
    let mounted = true;
    const current = ++revision.current;
    void session.restore().then((restored) => {
      if (!mounted || current !== revision.current) return;
      setUser(restored);
      setStatus(restored ? 'authenticated' : 'anonymous');
    }).catch((error: unknown) => {
      if (!mounted || current !== revision.current) return;
      setStatus('blocked');
      setSessionError(errorMessage(error));
    });
    return () => { mounted = false; };
  }, [session]);

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const current = ++revision.current;
    setUser(null);
    setStatus('anonymous');
    setSessionError(undefined);
    try {
      const loggedIn = await session.login(email, password);
      if (current !== revision.current) return { success: false };
      setUser(loggedIn);
      setStatus('authenticated');
      return { success: true };
    } catch (error) {
      if (current === revision.current) {
        setStatus('blocked');
        setSessionError(errorMessage(error));
      }
      return { success: false, error: errorMessage(error) };
    }
  }, [session]);

  const register = useCallback(async (fullName: string, email: string, password: string): Promise<AuthResult> => {
    try {
      await session.register(fullName, email, password);
      pendingCredentials.current = { email: email.trim().toLowerCase(), password };
      return { success: true };
    } catch (error) {
      return { success: false, error: errorMessage(error) };
    }
  }, [session]);

  const verifyEmail = useCallback(async (email: string, otp: string): Promise<AuthResult> => {
    const credentials = pendingCredentials.current;
    if (!credentials || credentials.email !== email.trim().toLowerCase()) {
      return { success: false, error: 'Vuelve a crear la cuenta para continuar con la verificación.' };
    }
    try {
      await verifySignupOtp(email.trim().toLowerCase(), otp);
      // OTP válido consume el único paso que necesita la contraseña temporal.
      pendingCredentials.current = null;
      return await login(credentials.email, credentials.password);
    } catch (error) {
      return { success: false, error: errorMessage(error) };
    }
  }, [login]);

  const resendEmailCode = useCallback(async (email: string): Promise<AuthResult> => {
    try {
      await resendSignupOtp(email.trim().toLowerCase());
      return { success: true };
    } catch (error) {
      return { success: false, error: errorMessage(error) };
    }
  }, []);

  const loadProfile = useCallback(async (patch?: UserPatch): Promise<AuthResult> => {
    const current = ++revision.current;
    setUser(null);
    setStatus('restoring');
    setSessionError(undefined);
    try {
      const updated = await session.refreshProfile(patch);
      if (current !== revision.current) return { success: false };
      setUser(updated);
      setStatus('authenticated');
      return { success: true };
    } catch (error) {
      if (current === revision.current) {
        setUser(null);
        setStatus('blocked');
        setSessionError(errorMessage(error));
      }
      return { success: false, error: errorMessage(error) };
    }
  }, [session]);

  const logout = useCallback(async (): Promise<AuthResult> => {
    const current = ++revision.current;
    pendingCredentials.current = null;
    setUser(null);
    setStatus('anonymous');
    setSessionError(undefined);
    try {
      await session.logout();
      if (current !== revision.current) return { success: false, error: 'La operación de sesión fue cancelada.' };
      return { success: true };
    } catch (error) {
      if (current === revision.current) {
        setStatus('blocked');
        setSessionError(errorMessage(error));
      }
      return { success: false, error: errorMessage(error) };
    }
  }, [session]);

  const refreshProfile = useCallback(() => loadProfile(), [loadProfile]);
  const value = useMemo<AuthContextValue>(() => ({
    user,
    role: user?.role ?? null,
    status,
    sessionError,
    isAuthenticated: status === 'authenticated' && user !== null,
    login,
    register,
    verifyEmail,
    resendEmailCode,
    restoreSession,
    refreshProfile,
    updateProfile: loadProfile,
    logout,
  }), [user, status, sessionError, login, register, verifyEmail, resendEmailCode, restoreSession, refreshProfile, loadProfile, logout]);

  // Las pantallas pueden renderizar errores o explorar como invitado durante restauración.
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return context;
}

export function useAuthOptional(): AuthContextValue | null {
  return useContext(AuthContext) ?? null;
}
