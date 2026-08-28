"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { User } from "./types";
import { clearToken, getToken, gqlRequest, setToken } from "./graphql-client";
import { GUEST_MUTATION, LOGIN_MUTATION, ME_QUERY, REGISTER_MUTATION } from "./queries";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, username: string, password: string) => Promise<User>;
  guest: () => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function refreshUser() {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await gqlRequest<{ me: User | null }>(ME_QUERY);
      setUser(data.me);
    } catch {
      setUser(null);
      clearToken();
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email: string, password: string) {
    const data = await gqlRequest<{ login: { token: string; user: User } }>(LOGIN_MUTATION, {
      email,
      password,
    });
    setToken(data.login.token);
    setUser(data.login.user);
    return data.login.user;
  }

  async function register(email: string, username: string, password: string) {
    const data = await gqlRequest<{ register: { token: string; user: User } }>(
      REGISTER_MUTATION,
      { email, username, password }
    );
    setToken(data.register.token);
    setUser(data.register.user);
    return data.register.user;
  }

  async function guest() {
    const data = await gqlRequest<{ guest: { token: string; user: User } }>(GUEST_MUTATION);
    setToken(data.guest.token);
    setUser(data.guest.user);
    return data.guest.user;
  }

  function logout() {
    clearToken();
    setUser(null);
    router.push("/");
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, guest, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
