import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  authMethod: 'email' | 'phone' | 'google';
  createdAt: string;
}

const AUTH_KEY = 'smartlife_auth_user';
const USERS_KEY = 'smartlife_users';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(AUTH_KEY).then((stored) => {
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {}
      }
      setIsLoaded(true);
    });
  }, []);

  const signIn = useCallback(async (userData: User) => {
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(userData));
    setUser(userData);
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(AUTH_KEY);
    setUser(null);
  }, []);

  return { user, isLoaded, signIn, signOut };
}

export async function getStoredUsers(): Promise<Record<string, { name: string; email: string; password: string }>> {
  const stored = await AsyncStorage.getItem(USERS_KEY);
  return stored ? JSON.parse(stored) : {};
}

export async function storeUser(email: string, data: { name: string; email: string; password: string }) {
  const users = await getStoredUsers();
  users[email.toLowerCase()] = data;
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}
