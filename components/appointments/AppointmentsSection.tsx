'use client';

import { useEffect, useState } from 'react';
import { Worker, Appointment } from '@/types';
import { useAppointments } from '@/hooks/useAppointments';
import AppointmentsList from './AppointmentsList';
import { supabase } from '@/lib/supabase';
import { storage, STORAGE_KEYS, storageMode } from '@/lib/storage';

interface AppointmentsSectionProps {
  worker: Worker;
}

interface Service {
  name: string;
  price: number;
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

  const [services, setServices] = useState<Service[]>([]);
  const [newAppointment, setNewAppointment] = useState({
    customerName: '',
    customerPhone: '',
    service: '',
    price: 0,
    date: new Date().toISOString().slice(0, 10),
    time: '09:00',
    worker
  });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    // Fetch services from Supabase
    const fetchServices = async () => {
      const { data, error } = await supabase.from('services').select('name, price');
      if (!error && data) setServices(data);
    };
    fetchServices();
  }, []);

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

  const handleAddAppointment = async () => {
    if (!newAppointment.service || !newAppointment.customerName) {
      alert('Please select a service and enter customer name.');
      return;
    }

    setAdding(true);
    const appointment: Appointment = {
      ...newAppointment,
      id: crypto.randomUUID(),
      is_done: false
    };

    try {
      if (storageMode === 'supabase') {
        const { error } = await supabase.from('appointments').insert([appointment]);
        if (error) throw error;
      } else {
        const allAppointments = (storage.get(STORAGE_KEYS.APPOINTMENTS) as Appointment[]) || [];
        storage.set(STORAGE_KEYS.APPOINTMENTS, [...allAppointments, appointment]);
      }
      // Refresh list and reset form
      await refresh();
      setNewAppointment({
        customerName: '',
        customerPhone: '',
        service: '',
        price: 0,
        date: new Date().toISOString().slice(0, 10),
        time: '09:00',
        worker
      });
    } catch (err) {
      console.error(err);
      alert('Failed to add appointment.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div id="appointments">
      <h2>Appointments</h2>

      {/* Month Filter */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', alignItems: 'center' }}>
        <input
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="card" style={{ background: '#ff3b3020', borderColor: '#ff3b30' }}>
          <p style={{ color: '#ff3b30', textAlign: 'center' }}>{error}</p>
        </div>
      )}

      {/* Appointments List */}
      <AppointmentsList 
        appointments={appointments}
        onDelete={handleDelete}
        onMarkDone={handleMarkDone}
        loading={loading}
      />

      {/* Add Appointment Form */}
      <div className="card" style={{ marginTop: '20px', padding: '20px' }}>
        <h3>Add Appointment</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Customer Name"
            value={newAppointment.customerName}
            onChange={(e) => setNewAppointment({ ...newAppointment, customerName: e.target.value })}
            style={{ flex: 1, padding: '8px' }}
          />
          <input
            type="tel"
            placeholder="Customer Phone"
            value={newAppointment.customerPhone}
            onChange={(e) => setNewAppointment({ ...newAppointment, customerPhone: e.target.value })}
            style={{ flex: 1, padding: '8px' }}
          />
          <select
            value={newAppointment.service}
            onChange={(e) => {
              const selected = services.find(s => s.name === e.target.value);
              setNewAppointment({
                ...newAppointment,
                service: selected?.name || '',
                price: selected?.price || 0
              });
            }}
            style={{ flex: 1, padding: '8px' }}
          >
            <option value="">Select Service</option>
            {services.map(s => (
              <option key={s.name} value={s.name}>{s.name}</option>
            ))}
          </select>
          <input
            type="date"
            value={newAppointment.date}
            onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
            style={{ flex: 1, padding: '8px' }}
          />
          <input
            type="time"
            value={newAppointment.time}
            onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
            style={{ flex: 1, padding: '8px' }}
          />
        </div>
        <button
          onClick={handleAddAppointment}
          disabled={adding}
          style={{
            padding: '12px',
            width: '100%',
            background: '#34c759',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          {adding ? 'Adding...' : 'Add Appointment'}
        </button>
      </div>
    </div>
  );
}