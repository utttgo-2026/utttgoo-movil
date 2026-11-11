import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

import { createApiClient, ApiRequestError } from '@/services/apiClient';
import type { User, UserRole } from '@/types/models';

const TOKEN_KEY = 'uttgo.auth.token';

type AuthResult = { success: boolean; error?: string };
type AuthResponse = { token?: string; accessToken?: string; jwt?: string; user?: BackendUser };
type BackendUser = {
  id?: string;
  email?: string;
  displayName?: string;
  fullName?: string;
  role?: UserRole;
};

interface AuthContextValue {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (fullName: string, email: string, password: string) => Promise<AuthResult>;
  signInAs: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiRequestError) {
    if (error.details.code === 'INVALID_CREDENTIALS' || error.details.status === 401) {
      return 'Correo o contraseña incorrectos.';
    }
    return error.details.message || fallback;
  }
  if (error instanceof Error && error.message === 'EXPO_PUBLIC_API_BASE_URL is required.') {
    return 'El acceso institucional no está disponible en este entorno.';
  }
  return fallback;
}

function toUser(value: BackendUser, email: string): User {
  return {
    id: value.id ?? email,
    role: value.role ?? 'buyer',
    fullName: value.displayName ?? value.fullName ?? email,
    email: value.email ?? email,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (token) {
          const client = createApiClient({ getToken: async () => token });
          const me = await client<BackendUser>('/api/v1/auth/me');
          setUser(toUser(me, me.email ?? ''));
        }
      } catch {
        await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => undefined);
      } finally {
        setLoaded(true);
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      return { success: false, error: 'Ingresa tu correo institucional y contraseña.' };
    }

    try {
      const client = createApiClient();
      const response = await client<AuthResponse>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: normalizedEmail, password }),
      });
      const token = response.accessToken ?? response.token ?? response.jwt;
      if (!token) {
        return { success: false, error: 'La respuesta de acceso no contiene una sesión válida.' };
      }
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      const backendUser = response.user ?? await createApiClient({ getToken: async () => token })<BackendUser>('/api/v1/auth/me');
      setUser(toUser(backendUser, normalizedEmail));
      return { success: true };
    } catch (error) {
      return { success: false, error: getErrorMessage(error, 'No se pudo iniciar sesión.') };
    }
  }, []);

  const register = useCallback(async (fullName: string, email: string, password: string): Promise<AuthResult> => {
    try {
      const client = createApiClient();
      await client('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase(), password, displayName: fullName.trim() }),
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: getErrorMessage(error, 'No se pudo crear la cuenta.') };
    }
  }, []);

  const signInAs = useCallback((_role: UserRole) => {
    // Demo guest navigation does not authenticate or create a productive user.
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => undefined);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    role: user?.role ?? 'buyer',
    isAuthenticated: Boolean(user) && loaded,
    login,
    register,
    signInAs,
    logout,
  }), [user, loaded, login, register, signInAs, logout]);

  if (!loaded) return null;
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return context;
}
