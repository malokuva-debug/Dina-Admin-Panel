// lib/auth.ts
import { supabase } from './supabase';
import { storage } from './storage';

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: 'admin' | 'worker';
  worker?: 'dina' | 'kida';
}

// LocalStorage key
const CURRENT_USER_KEY = 'currentUser';

// ----------------------
// LocalStorage helpers
// ----------------------
export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  return storage.get<User>(CURRENT_USER_KEY);
};

export const setCurrentUser = (user: User | null) => {
  if (user) storage.set(CURRENT_USER_KEY, user);
  else storage.remove(CURRENT_USER_KEY);
};

// ----------------------
// Password-only mapping (for UI)
// ----------------------
export const EMAIL_MAP = {
  dina: 'dina@dinakida.com',
  kida: 'kida@dinakida.com',
  admin: 'admin@dinakida.com',
} as const;

export type UserKey = keyof typeof EMAIL_MAP;

// ----------------------
// Login with Supabase Auth
// ----------------------
export const login = async (userKey: UserKey, password: string): Promise<User | null> => {
  try {
    const email = EMAIL_MAP[userKey];

    // Supabase sign-in
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      console.error('Login failed:', error);
      return null;
    }

    // Get role & worker from profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, worker')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile not found:', profileError);
      return null;
    }

    const user: User = {
  id: data.user.id,
  email: data.user.email!,
  name: userKey.charAt(0).toUpperCase() + userKey.slice(1) || '', // ensure string
  role: profile.role as 'admin' | 'worker',
  worker: profile.worker as 'dina' | 'kida' | undefined,
};

    setCurrentUser(user);
    return user;
  } catch (err) {
    console.error('Login error:', err);
    return null;
  }
};

// ----------------------
// Logout
// ----------------------
export const logout = async (): Promise<void> => {
  try {
    await supabase.auth.signOut();
    setCurrentUser(null);
  } catch (err) {
    console.error('Logout error:', err);
  }
};

// ----------------------
// Authentication helpers
// ----------------------
export const isAuthenticated = (): boolean => !!getCurrentUser();

export const hasRole = (role: 'admin' | 'worker'): boolean =>
  getCurrentUser()?.role === role;

export const getUserWorker = (): 'dina' | 'kida' | null => getCurrentUser()?.worker || null;

// ----------------------
// Sign up (optional)
// ----------------------
export const signUp = async (email: string, password: string, name?: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error || !data.user) throw error;

    const user: User = {
      id: data.user.id,
      email: data.user.email!,
      name,
      role: 'worker',
    };

    setCurrentUser(user);
    return user;
  } catch (err) {
    console.error('SignUp error:', err);
    return null;
  }
};

// ----------------------
// Password reset
// ----------------------
export const resetPassword = async (email: string): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Reset password error:', err);
    return false;
  }
};

// ----------------------
// Update password
// ----------------------
export const updatePassword = async (newPassword: string): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Update password error:', err);
    return false;
  }
};

// ----------------------
// Auth state listener
// ----------------------
export const onAuthStateChange = (callback: (user: User | null) => void): (() => void) => {
  // Supabase v2 returns { data: { subscription } }
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      const user: User = {
        id: session.user.id,
        email: session.user.email!,
        name: session.user.user_metadata?.name || '',
      };
      callback(user);
    } else {
      callback(null);
    }
  });

  // unsubscribe correctly
  return () => data.subscription.unsubscribe();
};