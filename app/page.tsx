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

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'appointments' | 'settings' | 'finance'>('appointments');
  const [selectedWorker, setSelectedWorker] = useState<Worker>('dina');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated()) {
      router.push('/login');
    } else {
      const user = getCurrentUser();
      
      // Load the previously selected worker from localStorage
      const savedWorker = localStorage.getItem('selectedWorker') as Worker | null;
      
      if (user?.role === 'worker') {
        // If user is a worker, use their assigned worker
        setSelectedWorker(user.worker || 'dina');
      } else if (savedWorker) {
        // If there's a saved preference, use that
        setSelectedWorker(savedWorker);
      }
      // Otherwise, keep the default 'dina'
    }
    setLoading(false);
  }, [router]);

  // Save worker selection to localStorage whenever it changes
  const handleWorkerChange = (worker: Worker) => {
    setSelectedWorker(worker);
    localStorage.setItem('selectedWorker', worker);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container">
      <PushNotifications worker={selectedWorker} />
      <WorkerNav selectedWorker={selectedWorker} onWorkerChange={handleWorkerChange} />
      {activeTab === 'finance' && <FinanceSection worker={selectedWorker} />}
      {activeTab === 'appointments' && <AppointmentsSection worker={selectedWorker} />}
      {activeTab === 'settings' && <SettingsSection worker={selectedWorker} />}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}