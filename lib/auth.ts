// lib/auth.ts
// Authentication utilities (placeholder for future implementation)

import { supabase } from './supabase';
import { storage } from './storage';

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: 'admin' | 'worker';
  worker?: 'dina' | 'kida';
}

// Storage key for current user
const CURRENT_USER_KEY = 'currentUser';

// Get current user from localStorage (simple implementation)
export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  return storage.get<User>(CURRENT_USER_KEY);
};

// Set current user
export const setCurrentUser = (user: User | null): void => {
  if (user) {
    storage.set(CURRENT_USER_KEY, user);
  } else {
    storage.remove(CURRENT_USER_KEY);
  }
};

// Simple login (placeholder - implement with Supabase Auth later)
export const login = async (email: string, password: string): Promise<User | null> => {
  try {
    // TODO: Implement actual authentication with Supabase
    // For now, this is a placeholder
    
    // Example with Supabase Auth (uncomment when ready):
    /*
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    const user: User = {
      id: data.user.id,
      email: data.user.email!,
      name: data.user.user_metadata?.name,
      role: data.user.user_metadata?.role || 'admin',
    };

    setCurrentUser(user);
    return user;
    */

    // Placeholder: Simple demo login
    const user: User = {
      id: '1',
      email,
      name: 'Admin User',
      role: 'admin',
    };

    setCurrentUser(user);
    return user;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
};

// Logout
export const logout = async (): Promise<void> => {
  try {
    // TODO: Implement with Supabase Auth
    // await supabase.auth.signOut();
    
    setCurrentUser(null);
  } catch (error) {
    console.error('Logout error:', error);
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

// Check if user has specific role
export const hasRole = (role: 'admin' | 'worker'): boolean => {
  const user = getCurrentUser();
  return user?.role === role;
};

// Get user's worker assignment
export const getUserWorker = (): 'dina' | 'kida' | null => {
  const user = getCurrentUser();
  return user?.worker || null;
};

// Sign up (placeholder)
export const signUp = async (
  email: string,
  password: string,
  name?: string
): Promise<User | null> => {
  try {
    // TODO: Implement with Supabase Auth
    /*
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: 'admin',
        },
      },
    });

    if (error) throw error;

    const user: User = {
      id: data.user!.id,
      email: data.user!.email!,
      name,
      role: 'admin',
    };

    setCurrentUser(user);
    return user;
    */

    // Placeholder
    return null;
  } catch (error) {
    console.error('Sign up error:', error);
    return null;
  }
};

// Reset password (placeholder)
export const resetPassword = async (email: string): Promise<boolean> => {
  try {
    // TODO: Implement with Supabase Auth
    /*
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) throw error;
    return true;
    */

    return false;
  } catch (error) {
    console.error('Reset password error:', error);
    return false;
  }
};

// Update password (placeholder)
export const updatePassword = async (newPassword: string): Promise<boolean> => {
  try {
    // TODO: Implement with Supabase Auth
    /*
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return true;
    */

    return false;
  } catch (error) {
    console.error('Update password error:', error);
    return false;
  }
};

// Listen to auth state changes (for Supabase)
export const onAuthStateChange = (
  callback: (user: User | null) => void
): (() => void) => {
  // TODO: Implement with Supabase Auth
  /*
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      if (session?.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name,
          role: session.user.user_metadata?.role || 'admin',
        };
        callback(user);
      } else {
        callback(null);
      }
    }
  );

  return () => {
    subscription.unsubscribe();
  };
  */

  // Placeholder: no-op
  return () => {};
};