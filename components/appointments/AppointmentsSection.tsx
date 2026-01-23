'use client';

import { useState } from 'react';
import { Worker } from '@/types';
import { useAppointments } from '@/hooks/useAppointments';
import AppointmentsList from './AppointmentsList';

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
    deleteAppointment 
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
        loading={loading}
      />
    </div>
  );
}