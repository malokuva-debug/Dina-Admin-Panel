'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { resetSession, getCurrentUser } from '@/lib/auth';
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
    const init = async () => {
      // Force logout / reset session on page load
      await resetSession();

      // Redirect to login if not admin
      const user = getCurrentUser();
      if (!user || user.role !== 'admin') {
        router.replace('/login');
        return;
      }

      setLoading(false);
    };

    init();
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