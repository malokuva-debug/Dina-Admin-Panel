'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, isAuthenticated, hasRole } from '@/lib/auth';

export default function AdminDashboard() {
  const router = useRouter();

  useEffect(() => {
    // Redirect if not logged in or not admin
    if (!isAuthenticated() || !hasRole('admin')) {
      router.push('/login');
    }
  }, []);

  const user = getCurrentUser();

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user?.name || 'Admin'}!</p>
      <p>You can manage everything here.</p>
    </div>
  );
}