'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, logout, getCurrentUser, setCurrentUser } from '@/lib/auth';
import Navbar from '@/components/layout/Navbar';
import WorkerNav from '@/components/layout/WorkerNav';
import FinanceSection from '@/components/finance/FinanceSection';
import AppointmentsSection from '@/components/appointments/AppointmentsSection';
import SettingsSection from '@/components/settings/SettingsSection';
import PushNotifications from '@/components/PushNotifications';
import type { Worker } from '@/types';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'appointments' | 'settings' | 'finance'>('appointments');
  const [selectedWorker, setSelectedWorker] = useState<Worker>('dina');

  useEffect(() => {
    // Check memory-only session
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
      router.replace('/login'); // redirect to login every refresh or PWA reopen
      return;
    }

    setLoading(false);
  }, [router]);

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: '1rem' }}>
      <PushNotifications worker={selectedWorker} />
      <WorkerNav selectedWorker={selectedWorker} onWorkerChange={setSelectedWorker} />

      {activeTab === 'appointments' && <AppointmentsSection worker={selectedWorker} />}
      {activeTab === 'settings' && <SettingsSection worker={selectedWorker} />}
      {activeTab === 'finance' && <FinanceSection worker={selectedWorker} />}

      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}