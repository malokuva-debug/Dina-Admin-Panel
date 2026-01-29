'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import WorkersSection from '@/components/admin/WorkersSection';
import SettingsSection from '@/components/admin/SettingsSection';
import FinanceSection from '@/components/admin/FinanceSection';
import PushNotifications from '@/components/PushNotifications';
import Navbar from '@/components/layout/Navbar';
import LogoutButton from '@/components/LogoutButton';

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'workers' | 'settings' | 'finance'>('workers');
  const [selectedWorker, setSelectedWorker] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'admin') router.push('/worker-dashboard'); // redirect non-admins
  }, [user, router]);

  if (!user || user.role !== 'admin') return <p>Loading...</p>;

  return (
    <div className="container">
      <div className="flex justify-end mb-4">
        <LogoutButton />
      </div>

      {/* Notifications for selected worker (optional) */}
      <PushNotifications worker={selectedWorker || ''} />

      {/* Sections */}
      {activeTab === 'workers' && <WorkersSection selectedWorker={selectedWorker} setSelectedWorker={setSelectedWorker} />}
      {activeTab === 'finance' && <FinanceSection worker={selectedWorker || undefined} />}
      {activeTab === 'settings' && <SettingsSection />}

      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}