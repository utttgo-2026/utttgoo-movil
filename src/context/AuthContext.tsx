import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { demoAccounts, demoUsers, findDemoUserByEmail } from '@/data/mock';
import { delay } from '@/services/mockApi';
import type { User, UserRole } from '@/types/models';

type AuthResult = { success: boolean; error?: string };

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    await delay(650);

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      return { success: false, error: 'Ingresa tu correo y contraseña.' };
    }

    if (password.length < 6) {
      return { success: false, error: 'La contraseña debe tener al menos 6 caracteres.' };
    }

    const account = demoAccounts.find(
      (item) => item.email.toLowerCase() === normalizedEmail
    );

    if (account) {
      const demoUser = findDemoUserByEmail(account.email);
      if (demoUser) {
        setUser(demoUser);
        return { success: true };
      }
    }

    const buyer = demoUsers.find((item) => item.role === 'buyer');
    setUser({
      ...(buyer as User),
      id: `buyer-${Date.now()}`,
      email: normalizedEmail,
    });
    return { success: true };
  }, []);

  const register = useCallback(
    async (fullName: string, email: string, password: string): Promise<AuthResult> => {
      await delay(650);

      if (!fullName.trim() || !email.trim() || password.length < 6) {
        return { success: false, error: 'Completa todos los campos correctamente.' };
      }

      setUser({
        id: `buyer-${Date.now()}`,
        role: 'buyer',
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        joinedAt: new Date().toISOString(),
      });
      return { success: true };
    },
    []
  );

  const signInAs = useCallback((role: UserRole) => {
    const demoUser = demoUsers.find((item) => item.role === role);
    if (demoUser) {
      setUser(demoUser);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role: user?.role ?? 'buyer',
      isAuthenticated: Boolean(user),
      login,
      register,
      signInAs,
      logout,
    }),
    [user, login, register, signInAs, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
