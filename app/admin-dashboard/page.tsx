'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { resetSession, isAuthenticated, getCurrentUser } from '@/lib/auth';
import Navbar from '@/components/layout/Navbar';
import WorkerNav from '@/components/layout/WorkerNav';
import AppointmentsSection from '@/components/appointments/AppointmentsSection';
import SettingsSection from '@/components/settings/SettingsSection';
import PushNotifications from '@/components/PushNotifications';
import type { Worker } from '@/types';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'appointments' | 'settings'>('appointments');
  const [selectedWorker, setSelectedWorker] = useState<Worker>('dina');

  useEffect(() => {
    const init = async () => {
      // Force logout / reset session on page load
      await resetSession();

      // Redirect to login if not authenticated or not admin
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
    <div style={{ padding: '1rem', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ marginBottom: '1rem', fontSize: '1.8rem', fontWeight: 'bold' }}>
        Admin Dashboard
      </h1>

      {/* Notifications */}
      <PushNotifications worker={selectedWorker} />

      {/* Worker navigation */}
      <WorkerNav selectedWorker={selectedWorker} onWorkerChange={setSelectedWorker} />

      {/* Sections */}
      <div style={{ marginTop: '1rem' }}>
        {activeTab === 'appointments' && <AppointmentsSection worker={selectedWorker} />}
        {activeTab === 'settings' && <SettingsSection worker={selectedWorker} />}
      </div>

      {/* Bottom Navbar */}
      <div style={{ marginTop: '2rem' }}>
        <Navbar
          activeTab={activeTab}
          onTabChange={(tab: 'appointments' | 'settings') => setActiveTab(tab)}
          hideFinance // optional prop to hide finance tab
        />
      </div>
    </div>
  );
}