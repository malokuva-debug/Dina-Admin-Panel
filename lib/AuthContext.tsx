// lib/AuthContext.tsx
'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types'; // make sure your User type has a `role` field

// 1. Define context type
interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (userKey: string, password: string) => Promise<void>;
  logout: () => void;
}

// 2. Create context with default empty values
const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  login: async () => {},
  logout: () => {},
});

// 3. Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // Optional: load user from localStorage/session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  // Simple login function
  const login = async (userKey: string, password: string) => {
    // Replace this with your actual auth logic
    // Example: hardcoded users
    const mockUsers: Record<string, User> = {
      dina: { id: '1', name: 'Dina Admin', role: 'admin' },
      worker1: { id: '2', name: 'Worker One', role: 'worker' },
    };

    const foundUser = mockUsers[userKey];
    if (!foundUser || password !== '1234') throw new Error('Invalid credentials');

    setUser(foundUser);
    // Redirect based on role
    if (foundUser.role === 'admin') router.push('/admin-dashboard');
    else router.push('/worker-dashboard');
  };

  // Logout function
  const logout = () => {
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 4. Hook to use context
export const useAuth = () => useContext(AuthContext);