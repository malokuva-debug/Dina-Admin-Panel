'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import WorkerNav from '@/components/layout/WorkerNav';
import FinanceSection from '@/components/finance/FinanceSection';
import AppointmentsSection from '@/components/appointments/AppointmentsSection';
import SettingsSection from '@/components/settings/SettingsSection';
import PushNotifications from '@/components/PushNotifications';
import { useState } from 'react';

export default function AdminDashboard() {
  const { user } = useAuth();          // ✅ reactive user state
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'appointments' | 'settings' | 'finance'>('appointments');
  const [selectedWorker, setSelectedWorker] = useState<'dina' | 'kida'>('dina');

  // redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      // if worker role, select their worker automatically
      if (user.role === 'worker' && user.worker) {
        setSelectedWorker(user.worker);
      }
    }
    setLoading(false);
  }, [user]);

  if (loading) return <p>Loading...</p>;
  if (!user) return null; // prevent render if user not set yet

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