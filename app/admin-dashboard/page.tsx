'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { isAuthenticated, getCurrentUser, logout } from '@/lib/auth';

import Navbar from '@/components/layout/Navbar';
import WorkerNav from '@/components/layout/WorkerNav';
import FinanceSection from '@/components/finance/FinanceSection';
import AppointmentsSection from '@/components/appointments/AppointmentsSection';
import SettingsSection from '@/components/settings/SettingsSection';
import PushNotifications from '@/components/PushNotifications';

import type { Worker } from '@/types';

export default function AdminPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'appointments' | 'settings' | 'finance'>(
    'appointments'
  );
  const [selectedWorker, setSelectedWorker] = useState<Worker>('dina');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }

    const user = getCurrentUser();
    if (user?.role === 'worker') {
      setSelectedWorker(user.worker || 'dina');
    }

    setLoading(false);
  }, [router]);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
    router.refresh();
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <strong>{getCurrentUser()?.name}</strong>

        <button
          onClick={handleLogout}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: '#111',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>

      <PushNotifications worker={selectedWorker} />
      <WorkerNav selectedWorker={selectedWorker} onWorkerChange={setSelectedWorker} />

      {activeTab === 'finance' && <FinanceSection worker={selectedWorker} />}
      {activeTab === 'appointments' && <AppointmentsSection worker={selectedWorker} />}
      {activeTab === 'settings' && <SettingsSection worker={selectedWorker} />}

      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}