'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
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
  const [activeTab, setActiveTab] = useState<'finance' | 'appointments' | 'settings'>('appointments');
  const [selectedWorker, setSelectedWorker] = useState<Worker>('dina');

  useEffect(() => {
    const checkAuth = async () => {
      // Check Supabase session
      const { data: { session } } = await supabase.auth.getSession();

      // Check local storage user
      const user = getCurrentUser();

      if (!session || !user || user.role !== 'admin') {
        router.replace('/login');
        return;
      }

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container" style={{ padding: '1rem' }}>
      <PushNotifications worker={selectedWorker} />
      <WorkerNav selectedWorker={selectedWorker} onWorkerChange={setSelectedWorker} />

      {activeTab === 'finance' && <FinanceSection worker={selectedWorker} />}
      {activeTab === 'appointments' && <AppointmentsSection worker={selectedWorker} />}
      {activeTab === 'settings' && <SettingsSection worker={selectedWorker} />}

      <Navbar
        activeTab={activeTab}
        onTabChange={(tab: 'finance' | 'appointments' | 'settings') => setActiveTab(tab)}
      />
    </div>
  );
}