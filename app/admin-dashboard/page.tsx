'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import AppointmentsSection from '@/components/appointments/AppointmentsSection';
import SettingsSection from '@/components/settings/SettingsSection';
import WorkerFinanceSection from '@/components/finance/WorkerFinanceSection';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'appointments' | 'settings' | 'finance'>('appointments');
  const [selectedWorker, setSelectedWorker] = useState<string | null>(null);

  // Redirect if not logged in or not admin
  useEffect(() => {
    if (!user) return; // wait until auth loaded
    if (user && user.role !== 'admin') {
      router.push('/worker-dashboard'); // redirect non-admins
    }
  }, [user, router]);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="container">
      {/* Admin header */}
      <div className="flex justify-between items-center mb-4">
        <h1>Admin Dashboard</h1>
        <button
          onClick={logout}
          className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Worker selector */}
      <div className="mb-4">
        <label className="mr-2 font-semibold">Select Worker:</label>
        <select
          value={selectedWorker || ''}
          onChange={(e) => setSelectedWorker(e.target.value)}
          className="border rounded p-1"
        >
          <option value="">All Workers</option>
          <option value="Alice">Alice</option>
          <option value="Bob">Bob</option>
          {/* Replace with dynamic list of workers */}
        </select>
      </div>

      {/* Sections */}
      {activeTab === 'appointments' && (
        <AppointmentsSection worker={selectedWorker || undefined} />
      )}
      {activeTab === 'finance' && selectedWorker && (
        <WorkerFinanceSection worker={selectedWorker} />
      )}
      {activeTab === 'settings' && <SettingsSection worker={selectedWorker || undefined} />}

      {/* Bottom Navbar */}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}