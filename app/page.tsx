'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getCurrentUser } from '@/lib/auth';
import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import WorkerNav from '@/components/layout/WorkerNav';
import FinanceSection from '@/components/finance/FinanceSection';
import AppointmentsSection from '@/components/appointments/AppointmentsSection';
import SettingsSection from '@/components/settings/SettingsSection';
import PushNotifications from '@/components/PushNotifications';
import WorkersSection from '@/components/admin/WorkersSection';
import SettingsSection from '@/components/admin/SettingsSection';
import FinanceSection from '@/components/admin/FinanceSection';
import LogoutButton from '@/components/LogoutButton';
import { Worker } from '@/types';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'appointments' | 'settings' | 'finance'>('appointments');
  const [selectedWorker, setSelectedWorker] = useState<Worker>('dina');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated()) {
      router.push('/login');
    } else {
      const user = getCurrentUser();
      if (user?.role === 'worker') setSelectedWorker(user.worker || 'dina');
    }
    setLoading(false);
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container">
      <PushNotifications worker={selectedWorker} />
      <WorkerNav selectedWorker={selectedWorker} onWorkerChange={setSelectedWorker} />

      {activeTab === 'finance' && <FinanceSection worker={selectedWorker} />}
      {activeTab === 'appointments' && <AppointmentsSection worker={selectedWorker} />}
      {activeTab === 'settings' && <SettingsSection worker={selectedWorker} />}

      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}