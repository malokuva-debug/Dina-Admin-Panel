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
    date: '',
    time: '',
    service: '',
    price: 0,
    customerName: '',
    customerPhone: '',
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
        window.dispatchEvent(new Event('appointments-updated'));
      }

      await refresh();
    } catch (error) {
      console.error('Error marking appointment:', error);
      alert('Failed to update appointment status');
    }
  };

  const handleAddAppointment = async () => {
    if (!newAppointment.date || !newAppointment.time || !newAppointment.service) {
      alert('Please fill in date, time, and service.');
      return;
    }

    const appointment: Appointment = {
      id: uuidv4(),
      date: newAppointment.date,
      time: newAppointment.time,
      service: newAppointment.service,
      price: newAppointment.price,
      worker: worker,
      customerName: newAppointment.customerName,
      customerPhone: newAppointment.customerPhone,
      is_done: false,
    };

    try {
      if (storageMode === 'supabase') {
        const { error } = await supabase.from('appointments').insert([appointment]);
        if (error) throw error;
      } else {
        const allAppointments = (storage.get(STORAGE_KEYS.APPOINTMENTS) as Appointment[]) || [];
        storage.set(STORAGE_KEYS.APPOINTMENTS, [...allAppointments, appointment]);
        window.dispatchEvent(new Event('appointments-updated'));
      }

      // Clear form
      setNewAppointment({
        date: '',
        time: '',
        service: '',
        price: 0,
        customerName: '',
        customerPhone: '',
      });

      await refresh();
    } catch (error) {
      console.error('Failed to add appointment:', error);
      alert('Failed to add appointment.');
    }
  };

  return (
    <div id="appointments">
      <h2>Appointments</h2>

      {/* Filter by month */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', alignItems: 'center' }}>
        <input
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          placeholder="Select Month"
        />
      </div>

      {/* Add Appointment Form */}
      <div className="card" style={{ marginBottom: '15px', padding: '15px' }}>
        <h3>Add Appointment</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
            type="text"
            placeholder="Service"
            value={newAppointment.service}
            onChange={(e) => setNewAppointment({ ...newAppointment, service: e.target.value })}
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
              padding: '12px',
              background: '#34c759',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Add Appointment
          </button>
        </div>
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