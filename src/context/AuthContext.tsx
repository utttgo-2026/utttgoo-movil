import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { demoAccounts, demoUsers, findDemoUserByEmail } from '@/data/mock';
import { delay } from '@/services/mockApi';
import type { User, UserRole } from '@/types/models';

const STORAGE_KEY = '@uttgo:users';

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
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const stored = JSON.parse(raw) as User[];
          // Merge stored users with demo users (stored take precedence by email)
          const demoByEmail = new Map(demoUsers.map((u) => [u.email.toLowerCase(), u]));
          const merged = [...demoUsers];
          for (const storedUser of stored) {
            const existing = merged.find((u) => u.email.toLowerCase() === storedUser.email.toLowerCase());
            if (existing) {
              Object.assign(existing, storedUser);
            } else {
              merged.push(storedUser);
            }
          }
          // Replace demoUsers reference is not possible, but we can use merged for lookups
          // We'll store merged in a ref-like approach via state
        }
      } catch {
        // ignore storage errors
      } finally {
        setLoaded(true);
      }
    };

    loadUsers();
  }, []);

  const getStoredUsers = useCallback(async (): Promise<User[]> => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw) as User[];
      }
    } catch {
      // ignore
    }
    return [];
  }, []);

  const saveUsers = useCallback(async (users: User[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    } catch {
      // ignore storage errors
    }
  }, []);

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

    // Check stored users
    const stored = await getStoredUsers();
    const storedUser = stored.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (storedUser && storedUser.password) {
      // Simple password check (stored as plain text for prototype)
      if (storedUser.password === password) {
        setUser({ ...storedUser, password: undefined });
        return { success: true };
      }
      return { success: false, error: 'Correo o contraseña incorrectos.' };
    }

    // Fallback: create buyer
    const buyer = demoUsers.find((item) => item.role === 'buyer');
    setUser({
      ...(buyer as User),
      id: `buyer-${Date.now()}`,
      email: normalizedEmail,
    });
    return { success: true };
  }, [getStoredUsers]);

  const register = useCallback(
    async (fullName: string, email: string, password: string): Promise<AuthResult> => {
      await delay(650);

      if (!fullName.trim() || !email.trim() || password.length < 6) {
        return { success: false, error: 'Completa todos los campos correctamente.' };
      }

      const normalizedEmail = email.trim().toLowerCase();

      const existing = demoUsers.find((u) => u.email.toLowerCase() === normalizedEmail);
      const stored = await getStoredUsers();
      const existingStored = stored.find((u) => u.email.toLowerCase() === normalizedEmail);

      if (existing || existingStored) {
        return { success: false, error: 'Ya existe una cuenta con este correo.' };
      }

      const newUser: User = {
        id: `buyer-${Date.now()}`,
        role: 'buyer',
        fullName: fullName.trim(),
        email: normalizedEmail,
        joinedAt: new Date().toISOString(),
        password,
      };

      const updated = [...stored, newUser];
      await saveUsers(updated);

      setUser({ ...newUser, password: undefined });
      return { success: true };
    },
    [getStoredUsers, saveUsers]
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
      isAuthenticated: Boolean(user) && loaded,
      login,
      register,
      signInAs,
      logout,
    }),
    [user, loaded, login, register, signInAs, logout]
  );

  if (!loaded) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
