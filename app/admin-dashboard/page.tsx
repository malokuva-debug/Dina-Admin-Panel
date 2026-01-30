'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getCurrentUser } from '@/lib/auth';

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
  const checkAuth = async () => {
    // Always reset session on page load
    await resetSession();

    // Now user is guaranteed to be logged out
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }

    const user = getCurrentUser();
    if (user?.role === 'worker') {
      setSelectedWorker(user.worker || 'dina');
    }

    setLoading(false);
  };

  checkAuth();
}, [router]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container">
      {/* No logout, no currentUser container */}
      <PushNotifications worker={selectedWorker} />
      <WorkerNav selectedWorker={selectedWorker} onWorkerChange={setSelectedWorker} />

      {activeTab === 'finance' && <FinanceSection worker={selectedWorker} />}
      {activeTab === 'appointments' && <AppointmentsSection worker={selectedWorker} />}
      {activeTab === 'settings' && <SettingsSection worker={selectedWorker} />}

      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}