'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import FinanceSection from '@/components/finance/FinanceSection';
import AppointmentsSection from '@/components/appointments/AppointmentsSection';
import SettingsSection from '@/components/settings/SettingsSection';
import PushNotifications from '@/components/PushNotifications';

export default function WorkerDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'appointments' | 'settings' | 'finance'>('appointments');

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user]);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="container">
      <h1>Welcome, {user.name}</h1>
      <p>You are assigned to: {user.worker}</p>

      {/* Notifications */}
      <PushNotifications worker={user.worker!} />

      {/* Sections */}
      {activeTab === 'finance' && <WorkerFinanceSection worker={user.worker!} />}
      {activeTab === 'appointments' && <AppointmentsSection worker={user.worker!} />}
      {activeTab === 'settings' && <SettingsSection worker={user.worker!} />}

      {/* Bottom Navbar */}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}