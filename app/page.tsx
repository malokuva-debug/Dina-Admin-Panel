'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import Navbar from '@/components/layout/Navbar';
import WorkerNav from '@/components/layout/WorkerNav';
import FinanceSection from '@/components/finance/FinanceSection';
import AppointmentsSection from '@/components/appointments/AppointmentsSection';
import SettingsSection from '@/components/settings/SettingsSection';
import PushNotifications from '@/components/PushNotifications';
import ClientsPage from './clients/page';

type Tab = 'appointments' | 'settings' | 'finance' | 'clients';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('appointments');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    setLoading(false);
  }, [router]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container">
      <PushNotifications worker="dina" />
      <WorkerNav />

      {activeTab === 'appointments' && <AppointmentsSection worker="dina" />}
      {activeTab === 'clients' && <ClientsPage />}
      {activeTab === 'settings' && <SettingsSection worker="dina" />}
      {activeTab === 'finance' && <FinanceSection worker="dina" />}

      <Navbar
        activeTab={activeTab}
        onTabChange={(tab: Tab) => setActiveTab(tab)}
      />
    </div>
  );
}