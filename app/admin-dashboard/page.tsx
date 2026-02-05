'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getCurrentUser } from '@/lib/auth';
import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import WorkerNav from '@/components/layout/WorkerNav';
import FinanceSection from '@/components/finance/FinanceSection';
import AppointmentsSection from '@/components/appointments/AppointmentsSection';
import SettingsSection from '@/components/settings/SettingsSection';
import PushNotifications from '@/components/PushNotifications';
import { Worker } from '@/types';
import { storage, STORAGE_KEYS } from '@/lib/storage';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'appointments' | 'settings' | 'finance'>('appointments');
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const user = getCurrentUser();
    
    // Load the previously selected worker using your storage system
    const savedWorker = storage.get<Worker>(STORAGE_KEYS.CURRENT_WORKER);
    
    if (user?.role === 'worker') {
      // If user is a worker, use their assigned worker
      const workerToSet = user.worker || 'dina';
      setSelectedWorker(workerToSet);
      storage.set(STORAGE_KEYS.CURRENT_WORKER, workerToSet);
    } else if (savedWorker) {
      // If there's a saved preference, use that
      setSelectedWorker(savedWorker);
    } else {
      // Default fallback
      setSelectedWorker('dina');
      storage.set(STORAGE_KEYS.CURRENT_WORKER, 'dina');
    }
    
    setLoading(false);
  }, [router]);

  // Save worker selection using your storage system
  const handleWorkerChange = (worker: Worker) => {
    setSelectedWorker(worker);
    storage.set(STORAGE_KEYS.CURRENT_WORKER, worker);
  };

  if (loading || !selectedWorker) return <p>Loading...</p>;

  return (
    <div className="container">
      <PushNotifications worker={selectedWorker} />
      <WorkerNav selectedWorker={selectedWorker} onWorkerChange={handleWorkerChange} />
      {activeTab === 'appointments' && <Appointments />}
{activeTab === 'clients' && <ClientsPage />}
{activeTab === 'settings' && <Settings />}
{activeTab === 'finance' && <Finance />}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}