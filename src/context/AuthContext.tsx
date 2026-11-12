import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { ApiError, errorMessage } from '@/services/api/errors';
import { createAuthSession } from '@/services/authSession';
import type { UserPatch } from '@/types/api';
import type { User, UserRole } from '@/types/models';

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
    const current = ++revision.current;
    let mounted = true;
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
      return { success: true };
    } catch (error) {
      return { success: false, error: errorMessage(error) };
    }
  }, [session]);

  const loadProfile = useCallback(async (patch?: UserPatch): Promise<AuthResult> => {
    const current = revision.current;
    try {
      const updated = await session.refreshProfile(patch);
      if (current !== revision.current) return { success: false };
      setUser(updated);
      return { success: true };
    } catch (error) {
      if (current === revision.current) {
        setSessionError(errorMessage(error));
        if (error instanceof ApiError && error.status === 401) {
          setUser(null);
          setStatus('blocked');
        }
      }
      return { success: false, error: errorMessage(error) };
    }
  }, [session]);

  const logout = useCallback(async (): Promise<AuthResult> => {
    const current = ++revision.current;
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
    user, role: user?.role ?? null, status, sessionError,
    isAuthenticated: status === 'authenticated' && user !== null,
    login, register, restoreSession, refreshProfile, updateProfile: loadProfile, logout,
  }), [user, status, sessionError, login, register, restoreSession, refreshProfile, loadProfile, logout]);

  // Las pantallas pueden renderizar errores o explorar como invitado durante restauración.
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return context;
}
