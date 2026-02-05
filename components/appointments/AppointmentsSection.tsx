// AppointmentSection.tsx
'use client';

import { useEffect, useState } from 'react';
import { Worker, Appointment, Category, Service, Client, AppointmentStatus } from '@/types';
import { useAppointments } from '@/hooks/useAppointments';
import AppointmentsList from './AppointmentsList';
import { supabase } from '@/lib/supabase';
import { storage, STORAGE_KEYS, storageMode } from '@/lib/storage';
import AddAppointmentModal from '@/components/modals/AddAppointmentModal';

interface AppointmentsSectionProps {
  worker: Worker;
}

export default function AppointmentsSection({ worker }: AppointmentsSectionProps) {
  const [filterMonth, setFilterMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const { appointments, loading, error, deleteAppointment, refresh } = useAppointments({ worker, month: filterMonth, autoLoad: true });

  const [modalOpen, setModalOpen] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [workers, setWorkers] = useState<Worker[]>(['dina', 'kida']);
  const [clients, setClients] = useState<Client[]>([]); // <-- ADD THIS

  // Fetch categories, services, and clients
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: cats } = await supabase.from('categories').select('*');
        const { data: svcs } = await supabase.from('services').select('*');
        const { data: cls } = await supabase.from('clients').select('*'); // <-- fetch clients

        if (cats) setCategories(cats as Category[]);
        if (svcs) setServices(svcs as Service[]);
        if (cls) setClients(cls as Client[]);
      } catch (err) {
        console.error('Failed to fetch categories, services, or clients:', err);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    const success = await deleteAppointment(id);
    if (!success) alert('Failed to delete appointment');
  };

  const handleMarkDone = async (id: string, isDone: boolean) => {
    try {
      if (storageMode === 'supabase') {
        const { error } = await supabase
          .from('appointments')
          .update({ 
            is_done: isDone,
            status: isDone ? 'done' : 'pending'
          })
          .eq('id', id);
        if (error) throw error;
      } else {
        const allAppointments = (storage.get(STORAGE_KEYS.APPOINTMENTS) as Appointment[]) || [];
        const updated = allAppointments.map((apt) =>
          apt.id === id ? { ...apt, is_done: isDone, status: isDone ? 'done' : 'pending' } : apt
        );
        storage.set(STORAGE_KEYS.APPOINTMENTS, updated);
      }
      await refresh();
    } catch (error) {
      console.error('Error marking appointment:', error);
      alert('Failed to update appointment status');
    }
  };

  const handleUpdateStatus = async (id: string, status: AppointmentStatus) => {
    try {
      if (storageMode === 'supabase') {
        const { error } = await supabase
          .from('appointments')
          .update({ 
            status,
            is_done: status === 'done'
          })
          .eq('id', id);
        if (error) throw error;
      } else {
        const allAppointments = (storage.get(STORAGE_KEYS.APPOINTMENTS) as Appointment[]) || [];
        const updated = allAppointments.map((apt) =>
          apt.id === id ? { ...apt, status, is_done: status === 'done' } : apt
        );
        storage.set(STORAGE_KEYS.APPOINTMENTS, updated);
      }
      await refresh();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update appointment status');
    }
  };

  const handleUpdateCompletionTime = async (id: string, time: string) => {
    try {
      if (storageMode === 'supabase') {
        const { error } = await supabase
          .from('appointments')
          .update({ estimated_completion_time: time })
          .eq('id', id);
        if (error) throw error;
      } else {
        const allAppointments = (storage.get(STORAGE_KEYS.APPOINTMENTS) as Appointment[]) || [];
        const updated = allAppointments.map((apt) =>
          apt.id === id ? { ...apt, estimated_completion_time: time } : apt
        );
        storage.set(STORAGE_KEYS.APPOINTMENTS, updated);
      }
      await refresh();
    } catch (error) {
      console.error('Error updating completion time:', error);
      alert('Failed to update completion time');
    }
  };

  const handleUpdateDuration = async (id: string, duration: number) => {
    try {
      if (storageMode === 'supabase') {
        const { error } = await supabase
          .from('appointments')
          .update({ duration })
          .eq('id', id);
        if (error) throw error;
      } else {
        const allAppointments = (storage.get(STORAGE_KEYS.APPOINTMENTS) as Appointment[]) || [];
        const updated = allAppointments.map((apt) =>
          apt.id === id ? { ...apt, duration } : apt
        );
        storage.set(STORAGE_KEYS.APPOINTMENTS, updated);
      }
      await refresh();
    } catch (error) {
      console.error('Error updating duration:', error);
      alert('Failed to update duration');
    }
  };

  const handleUpdateDate = async (id: string, date: string) => {
    try {
      if (storageMode === 'supabase') {
        const { error } = await supabase
          .from('appointments')
          .update({ date })
          .eq('id', id);
        if (error) throw error;
      } else {
        const allAppointments = (storage.get(STORAGE_KEYS.APPOINTMENTS) as Appointment[]) || [];
        const updated = allAppointments.map((apt) =>
          apt.id === id ? { ...apt, date } : apt
        );
        storage.set(STORAGE_KEYS.APPOINTMENTS, updated);
      }
      await refresh();
    } catch (error) {
      console.error('Error updating date:', error);
      alert('Failed to update date');
    }
  };

  const handleUpdateTime = async (id: string, time: string) => {
    try {
      if (storageMode === 'supabase') {
        const { error } = await supabase
          .from('appointments')
          .update({ time })
          .eq('id', id);
        if (error) throw error;
      } else {
        const allAppointments = (storage.get(STORAGE_KEYS.APPOINTMENTS) as Appointment[]) || [];
        const updated = allAppointments.map((apt) =>
          apt.id === id ? { ...apt, time } : apt
        );
        storage.set(STORAGE_KEYS.APPOINTMENTS, updated);
      }
      await refresh();
    } catch (error) {
      console.error('Error updating time:', error);
      alert('Failed to update time');
    }
  };

  const handleUpdateCustomerName = async (id: string, customer_name: string) => {
    try {
      if (storageMode === 'supabase') {
        const { error } = await supabase
          .from('appointments')
          .update({ customer_name })
          .eq('id', id);
        if (error) throw error;
      } else {
        const allAppointments = (storage.get(STORAGE_KEYS.APPOINTMENTS) as Appointment[]) || [];
        const updated = allAppointments.map((apt) =>
          apt.id === id ? { ...apt, customer_name } : apt
        );
        storage.set(STORAGE_KEYS.APPOINTMENTS, updated);
      }
      await refresh();
    } catch (error) {
      console.error('Error updating customer name:', error);
      alert('Failed to update customer name');
    }
  };

  return (
    <div id="appointments">
      <h2>Appointments</h2>

      {/* Month Filter */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', alignItems: 'center' }}>
        <input type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} />
      </div>

      {error && (
        <div className="card" style={{ background: '#ff3b3020', borderColor: '#ff3b30' }}>
          <p style={{ color: '#ff3b30', textAlign: 'center' }}>{error}</p>
        </div>
      )}

      <AppointmentsList
        appointments={appointments}
        onDelete={handleDelete}
        onMarkDone={() => {}}
        onUpdateStatus={() => {}}
        onUpdateCompletionTime={() => {}}
        onUpdateDuration={() => {}}
        onUpdateDate={() => {}}
        onUpdateTime={() => {}}
        onUpdateCustomerName={() => {}}
        loading={loading}
      />

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button
          onClick={() => setModalOpen(true)}
          style={{
            padding: '12px 24px',
            background: '#34c759',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Add Appointment
        </button>
      </div>

      {modalOpen && (
        <AddAppointmentModal
          workers={workers}
          categories={categories}
          services={services}
          clients={clients}  // <-- NOW DEFINED
          onClose={() => setModalOpen(false)}
          onAdded={refresh}
        />
      )}
    </div>
  );
}