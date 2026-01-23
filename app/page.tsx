'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import WorkerNav from '@/components/layout/WorkerNav';
import FinanceSection from '@/components/finance/FinanceSection';
import AppointmentsSection from '@/components/appointments/AppointmentsSection';
import SettingsSection from '@/components/settings/SettingsSection';
import MagicBellNotifications from '@/components/MagicBellNotifications';
import { Worker } from '@/types';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'appointments' | 'settings' | 'finance'>('appointments');
  const [selectedWorker, setSelectedWorker] = useState<Worker>('dina');

  return (
    <div className="container">
      <MagicBellNotifications worker={selectedWorker} />
      
      <WorkerNav 
        selectedWorker={selectedWorker} 
        onWorkerChange={setSelectedWorker} 
      />

      {activeTab === 'finance' && <FinanceSection worker={selectedWorker} />}
      {activeTab === 'appointments' && <AppointmentsSection worker={selectedWorker} />}
      {activeTab === 'settings' && <SettingsSection worker={selectedWorker} />}

      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}