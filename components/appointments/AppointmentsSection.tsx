'use client';

import { useState } from 'react';
import { Worker, Appointment } from '@/types';
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
  const [newAppointment, setNewAppointment] = useState({
    service: '',
    date: '',
    time: '',
    price: 0,
    customerName: '',
    customerPhone: ''
  });

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
        const { error } = await supabase
          .from('appointments')
          .update({ is_done: isDone })
          .eq('id', id);

        if (error) throw error;
      } else {
        const allAppointments = (storage.get(STORAGE_KEYS.APPOINTMENTS) as any[]) || [];
        const updated = allAppointments.map((apt) =>
          apt.id === id ? { ...apt, is_done: isDone } : apt
        );
        storage.set(STORAGE_KEYS.APPOINTMENTS, updated);
      }

      await refresh();
    } catch (error) {
      console.error('Error marking appointment:', error);
      alert('Failed to update appointment status');
    }
  };

  const handleAddAppointment = () => {
    if (!newAppointment.service || !newAppointment.date || !newAppointment.time) {
      alert('Service, date, and time are required.');
      return;
    }

    const appointment: Appointment = {
      id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`, // unique ID without uuid
      worker: worker,
      service: newAppointment.service,
      date: newAppointment.date,
      time: newAppointment.time,
      price: newAppointment.price,
      customerName: newAppointment.customerName,
      customerPhone: newAppointment.customerPhone,
      is_done: false,
    };

    if (storageMode === 'supabase') {
      supabase.from('appointments').insert([appointment]).then(({ error }) => {
        if (error) {
          alert('Failed to add appointment.');
        } else {
          refresh();
          setNewAppointment({ service: '', date: '', time: '', price: 0, customerName: '', customerPhone: '' });
        }
      });
    } else {
      const allAppointments = (storage.get(STORAGE_KEYS.APPOINTMENTS) as any[]) || [];
      storage.set(STORAGE_KEYS.APPOINTMENTS, [...allAppointments, appointment]);
      refresh();
      setNewAppointment({ service: '', date: '', time: '', price: 0, customerName: '', customerPhone: '' });
    }
  };

  return (
    <div id="appointments">
      <h2>Appointments</h2>

      {/* Month filter */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', alignItems: 'center' }}>
        <input
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
        />
      </div>

      {/* New Appointment Form */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Service"
          value={newAppointment.service}
          onChange={(e) => setNewAppointment({ ...newAppointment, service: e.target.value })}
        />
        <input
          type="date"
          value={newAppointment.date}
          onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
        />
        <input
          type="time"
          value={newAppointment.time}
          onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
        />
        <input
          type="number"
          placeholder="Price"
          value={newAppointment.price}
          onChange={(e) => setNewAppointment({ ...newAppointment, price: parseFloat(e.target.value) })}
        />
        <input
          type="text"
          placeholder="Customer Name"
          value={newAppointment.customerName}
          onChange={(e) => setNewAppointment({ ...newAppointment, customerName: e.target.value })}
        />
        <input
          type="tel"
          placeholder="Customer Phone"
          value={newAppointment.customerPhone}
          onChange={(e) => setNewAppointment({ ...newAppointment, customerPhone: e.target.value })}
        />
        <button
          onClick={handleAddAppointment}
          style={{
            background: '#34c759',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '6px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Add Appointment
        </button>
      </div>

      {error && <div className="card" style={{ background: '#ff3b3020', borderColor: '#ff3b30' }}><p style={{ color: '#ff3b30', textAlign: 'center' }}>{error}</p></div>}

      <AppointmentsList 
        appointments={appointments}
        onDelete={handleDelete}
        onMarkDone={handleMarkDone}
        loading={loading}
      />
    </div>
  );
}