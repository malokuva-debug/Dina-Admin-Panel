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
  }, [user, router]);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="container">
      {/* Header with logout */}
      <div className="flex justify-between items-center mb-4">
        <p className="font-semibold">{user.name}</p>
        <button onClick={logout} className="p-2 rounded hover:bg-gray-200">
          {/* Logout SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V5" />
          </svg>
        </button>
      </div>

      <p className="mb-4">Assigned to: {user.worker}</p>

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