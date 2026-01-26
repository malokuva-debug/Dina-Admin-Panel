'use client';

import { useState } from 'react';
import { Worker } from '@/types';
import { useAppointments } from '@/hooks/useAppointments';
import AppointmentsList from './AppointmentsList';
import { supabase } from '@/lib/supabase';
import { storage, STORAGE_KEYS, storageMode } from '@/lib/storage';

interface AppointmentsSectionProps {
  worker: Worker;
}

export default function AppointmentsSection({ worker }: AppointmentsSectionProps) {
  const [filterMonth, setFilterMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );

  const { 
    appointments, 
    loading, 
    error,
    deleteAppointment,
    refresh
  } = useAppointments({ 
    worker, 
    month: filterMonth,
    autoLoad: true 
  });

  const handleDelete = async (id: string) => {
    const success = await deleteAppointment(id);
    if (!success) {
      alert('Failed to delete appointment');
    }
  };

  const handleMarkDone = async (id: string, isDone: boolean) => {
    try {
      if (storageMode === 'supabase') {
        // Update in Supabase
        const { error } = await supabase
          .from('appointments')
          .update({ is_done: isDone })
          .eq('id', id);

        if (error) throw error;
      } else {
        // Update in localStorage
        const allAppointments = storage.get(STORAGE_KEYS.APPOINTMENTS) || [];
        const updated = allAppointments.map((apt: any) =>
          apt.id === id ? { ...apt, is_done: isDone } : apt
        );
        storage.set(STORAGE_KEYS.APPOINTMENTS, updated);
      }

      // Refresh the list
      await refresh();
    } catch (error) {
      console.error('Error marking appointment:', error);
      alert('Failed to update appointment status');
    }
  };

  return (
    <div id="appointments">
      <h2>Appointments</h2>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', alignItems: 'center' }}>
        <input
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          placeholder="Select Month"
        />
      </div>

      {error && (
        <div className="card" style={{ background: '#ff3b3020', borderColor: '#ff3b30' }}>
          <p style={{ color: '#ff3b30', textAlign: 'center' }}>
            {error}
          </p>
        </div>
      )}

      <AppointmentsList 
        appointments={appointments}
        onDelete={handleDelete}
        onMarkDone={handleMarkDone}
        loading={loading}
      />
    </div>
  );
}