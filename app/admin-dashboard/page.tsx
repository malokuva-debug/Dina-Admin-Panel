'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getCurrentUser } from '@/lib/auth';
import Navbar from '@/components/layout/Navbar';
import WorkerNav from '@/components/layout/WorkerNav';
import FinanceSection from '@/components/finance/FinanceSection';
import AppointmentsSection from '@/components/appointments/AppointmentsSection';
import SettingsSection from '@/components/settings/SettingsSection';
import PushNotifications from '@/components/PushNotifications';
import ClientsPage from './clients/page'; // <-- add your clients page import
import { Worker } from '@/types';
import { storage, STORAGE_KEYS } from '@/lib/storage';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'appointments' | 'clients' | 'settings' | 'finance'>('appointments'); // added 'clients'
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const user = getCurrentUser();
    const savedWorker = storage.get<Worker>(STORAGE_KEYS.CURRENT_WORKER);

    if (user?.role === 'worker') {
      const workerToSet = user.worker || 'dina';
      setSelectedWorker(workerToSet);
      storage.set(STORAGE_KEYS.CURRENT_WORKER, workerToSet);
    } else if (savedWorker) {
      setSelectedWorker(savedWorker);
    } else {
      setSelectedWorker('dina');
      storage.set(STORAGE_KEYS.CURRENT_WORKER, 'dina');
    }

    setLoading(false);
  }, [router]);

  const handleWorkerChange = (worker: Worker) => {
    setSelectedWorker(worker);
    storage.set(STORAGE_KEYS.CURRENT_WORKER, worker);
  };

  if (loading || !selectedWorker) return <p>Loading...</p>;

  return (
    <div className="container">
      <PushNotifications worker={selectedWorker} />
      <WorkerNav selectedWorker={selectedWorker} onWorkerChange={handleWorkerChange} />

      {/* Render active tab */}
      {activeTab === 'appointments' && <AppointmentsSection worker={selectedWorker} />}
      {activeTab === 'clients' && <ClientsPage />} {/* <-- Clients logic */}
      {activeTab === 'settings' && <SettingsSection worker={selectedWorker} />}
      {activeTab === 'finance' && <FinanceSection worker={selectedWorker} />}

      {/* Navbar */}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}