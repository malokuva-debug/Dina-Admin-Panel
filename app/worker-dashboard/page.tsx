'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, isAuthenticated, getUserWorker, hasRole } from '@/lib/auth';

export default function WorkerDashboard() {
  const router = useRouter();

  useEffect(() => {
    // Redirect if not logged in or not worker
    if (!isAuthenticated() || !hasRole('worker')) {
      router.push('/login');
    }
  }, []);

  const worker = getUserWorker();

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Worker Dashboard</h1>
      <p>Welcome, {worker?.toUpperCase() || 'Worker'}!</p>
      <p>You can view and manage your appointments here.</p>
    </div>
  );
}