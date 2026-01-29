'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User as AuthUser, getCurrentUser, setCurrentUser, onAuthStateChange } from './auth';
import { Worker } from '@/types';

// Frontend User type
export interface User {
  id: string;
  name: string;
  role: 'admin' | Worker; // matches types/index.ts
}

// Context type
interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);
  const router = useRouter();

  // Map auth user (from lib/auth.ts) to frontend User type
  const mapAuthUserToUser = (authUser: AuthUser | null): User | null => {
    if (!authUser) return null;

    let role: 'admin' | Worker;
    if (authUser.role === 'admin') {
      role = 'admin';
    } else if (authUser.role === 'worker') {
      if (!authUser.worker) {
        console.warn('Worker type missing for user', authUser);
        return null;
      }
      role = authUser.worker;
    } else {
      console.warn('Invalid role for user', authUser);
      return null;
    }

    return {
      id: authUser.id,
      name: authUser.name || '',
      role,
    };
  };

  const setUser = (authUser: AuthUser | null) => {
    const mappedUser = mapAuthUserToUser(authUser);
    setUserState(mappedUser);
    setCurrentUser(authUser); // keep localStorage in sync with auth.ts
  };

  const logout = async () => {
    try {
      setUser(null);
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Initialize from localStorage
  useEffect(() => {
    const authUser = getCurrentUser();
    setUser(authUser);

    // Listen to auth state changes (optional, from supabase)
    const unsubscribe = onAuthStateChange((authUser) => {
      setUser(authUser);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook for convenience
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};