'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import WorkerFinanceSection from '@/components/finance/WorkerFinanceSection';
import AppointmentsSection from '@/components/appointments/AppointmentsSection';
import SettingsSection from '@/components/settings/SettingsSection';
import PushNotifications from '@/components/PushNotifications';
import { FiLogOut } from 'react-icons/fi'; // Logout icon from react-icons

export default function WorkerDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'appointments' | 'settings' | 'finance'>('appointments');

  // Redirect to login if not logged in
  useEffect(() => {
    if (!user) router.push('/login');
  }, [user, router]);

  if (!user) return <p>Loading...</p>;

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="container">
      {/* Top bar with logout */}
      <div className="flex justify-between items-center py-2 px-4 border-b">
        <h2 className="text-lg font-medium">{user.worker}</h2>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-red-500 hover:text-red-700"
        >
          <FiLogOut size={20} /> Logout
        </button>
      </div>

      {/* Notifications */}
      <PushNotifications worker={user.worker!} />

      {/* Main sections */}
      <div className="mt-4">
        {activeTab === 'finance' && <WorkerFinanceSection worker={user.worker!} />}
        {activeTab === 'appointments' && <AppointmentsSection worker={user.worker!} />}
        {activeTab === 'settings' && <SettingsSection worker={user.worker!} />}
      </div>

      {/* Bottom navbar */}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}