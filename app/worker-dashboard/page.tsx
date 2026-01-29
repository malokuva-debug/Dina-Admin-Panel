'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import WorkerFinanceSection from '@/components/finance/WorkerFinanceSection';
import AppointmentsSection from '@/components/appointments/AppointmentsSection';
import SettingsSection from '@/components/settings/SettingsSection';
import PushNotifications from '@/components/PushNotifications';

export default function WorkerDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'appointments' | 'settings' | 'finance'>('appointments');

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user]);

  if (!user) return <p>Loading...</p>;

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="container">
      {/* Logout Icon/Button */}
      <div className="flex justify-end p-4">
        <button 
          onClick={handleLogout} 
          className="text-red-600 hover:text-red-800 font-bold"
          title="Logout"
        >
          ⎋ Logout
        </button>
      </div>

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