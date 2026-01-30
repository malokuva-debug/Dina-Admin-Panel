import { supabase } from './supabase';
import type { User, Worker, Role } from '@/types/user';

export const EMAIL_MAP = {
  admin: 'admin@dinakida.com',
} as const;

export type UserKey = keyof typeof EMAIL_MAP;

// Always resets Supabase session on page load
export const resetSession = async () => {
  await supabase.auth.signOut();
};

// Stateless: only checks Supabase session (not localStorage)
export const isAuthenticated = async (): Promise<boolean> => {
  const { data } = await supabase.auth.getSession();
  return Boolean(data.session);
};

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  return storage.get<User>(CURRENT_USER_KEY);
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

  return user;
};

export const logout = async () => {
  await supabase.auth.signOut();
};