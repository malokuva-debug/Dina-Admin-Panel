import { supabase } from './supabase';
import { storage } from './storage';
import type { User, Worker, Role } from '@/types/user';

const CURRENT_USER_KEY = 'currentUser';

export const EMAIL_MAP = {
  dina: 'dina@dinakida.com',
  kida: 'kida@dinakida.com',
  admin: 'admin@dinakida.com',
} as const;

export type UserKey = keyof typeof EMAIL_MAP;

/** ✅ ADD THIS */
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return Boolean(storage.get<User>(CURRENT_USER_KEY));
};

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  return storage.get<User>(CURRENT_USER_KEY);
};

export const setCurrentUser = (user: User | null) => {
  if (user) storage.set(CURRENT_USER_KEY, user);
  else storage.remove(CURRENT_USER_KEY);
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

  setCurrentUser(user);
  return user;
};

export const logout = async () => {
  await supabase.auth.signOut();
  setCurrentUser(null);
};