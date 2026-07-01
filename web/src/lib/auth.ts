const SESSION_KEY = 'ggl_session_token';
const SESSION_USER_KEY = 'ggl_session_user';

import type { AuthUser } from '@/types';

export function getToken(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

export function getUser(): AuthUser | null {
  const raw = localStorage.getItem(SESSION_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setSession(token: string, user: AuthUser): void {
  localStorage.setItem(SESSION_KEY, token);
  localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_USER_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}
