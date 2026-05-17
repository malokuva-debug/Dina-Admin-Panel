import { supabase } from './supabase';
import type { User, Worker, Role } from '@/types/user';

export const EMAIL_MAP = {
  admin: 'admin@dinakida.com',
} as const;

export type UserKey = keyof typeof EMAIL_MAP;

// In-memory only, cleared on refresh/PWA close
let currentUser: User | null = null;

export const resetSession = async () => {
  await supabase.auth.signOut();
  currentUser = null;
};

export const isAuthenticated = (): boolean => {
  return currentUser !== null;
};

export const getCurrentUser = (): User | null => {
  return currentUser;
};

export const setCurrentUser = (user: User | null) => {
  currentUser = user;
};

export const login = async (
  userKey: UserKey,
  password: string
): Promise<User | null> => {
  const email = EMAIL_MAP[userKey];

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) return null;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, worker')
    .eq('id', data.user.id)
    .single();

  if (profileError || !profile) return null;

  const user: User = {
    id: data.user.id,
    email: data.user.email!,
    name: userKey.charAt(0).toUpperCase() + userKey.slice(1),
    role: profile.role as Role,
    worker: profile.worker as Worker | undefined,
  };

  setCurrentUser(user); // ✅ only in memory
  return user;
};

export const logout = async () => {
  await supabase.auth.signOut();
  setCurrentUser(null);
};