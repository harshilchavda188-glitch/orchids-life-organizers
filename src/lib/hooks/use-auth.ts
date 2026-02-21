"use client";

import { useState, useEffect, useCallback } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  authMethod: "email" | "phone" | "google";
  createdAt: string;
}

const AUTH_KEY = "smartlife_auth_user";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
    setIsLoaded(true);
  }, []);

  const signIn = useCallback((userData: User) => {
    localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
    setUser(userData);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
  }, []);

  return { user, isLoaded, signIn, signOut };
}
