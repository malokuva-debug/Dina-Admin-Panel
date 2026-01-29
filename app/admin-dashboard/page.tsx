'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import WorkersSection from '@/components/admin/WorkersSection';
import SettingsSection from '@/components/admin/SettingsSection';
import FinanceSection from '@/components/admin/FinanceSection';
import LogoutButton from '@/components/LogoutButton';

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'workers' | 'settings' | 'finance'>('workers');

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'admin') router.push('/worker-dashboard'); // redirect non-admins
  }, [user, router]);

  if (!user || user.role !== 'admin') return <p>Loading...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <LogoutButton />
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button onClick={() => setActiveTab('workers')}>Workers</button>
        <button onClick={() => setActiveTab('settings')}>Settings</button>
        <button onClick={() => setActiveTab('finance')}>Finance</button>
      </div>

      {/* Sections */}
      {activeTab === 'workers' && <WorkersSection />}
      {activeTab === 'settings' && <SettingsSection />}
      {activeTab === 'finance' && <FinanceSection />}
    </div>
  );
}