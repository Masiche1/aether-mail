import React, { createContext, useContext, useState, ReactNode } from 'react';

type AuthUser = { id: number; username: string; email: string; first_name: string; last_name: string };
type Credentials = { username: string; password: string };
type Registration = Credentials & { email: string; first_name?: string; last_name?: string };

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  login: (credentials: Credentials) => Promise<void>;
  register: (details: Registration) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(() => localStorage.getItem('aethermail_token'));
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('aethermail_user');
    return stored ? JSON.parse(stored) : null;
  });

  const saveSession = (session: { token: string; user: AuthUser }) => {
    localStorage.setItem('aethermail_token', session.token);
    localStorage.setItem('aethermail_user', JSON.stringify(session.user));
    setToken(session.token);
    setUser(session.user);
  };

  const login = async (credentials: Credentials) => {
    const response = await fetch('/api/auth/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) throw new Error('Invalid username or password.');
    saveSession(await response.json());
  };

  const register = async (details: Registration) => {
    const response = await fetch('/api/auth/register/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(details),
    });
    if (!response.ok) throw new Error('Registration failed.');
    saveSession(await response.json());
  };

  const logout = async () => {
    if (token) await fetch('/api/auth/logout/', { method: 'POST', headers: { Authorization: `Token ${token}` } });
    localStorage.removeItem('aethermail_token');
    localStorage.removeItem('aethermail_user');
    setToken(null);
    setUser(null);
  };

  return <AuthContext.Provider value={{ token, user, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
