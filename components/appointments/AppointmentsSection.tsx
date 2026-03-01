'use client';

import { useEffect, useState } from 'react';
import { Worker, Appointment, Category, Service, Client, AppointmentStatus } from '@/types';
import { useAppointments } from '@/hooks/useAppointments';
import AppointmentsList from './AppointmentsList';
import { supabase } from '@/lib/supabase';
import { storage, STORAGE_KEYS, storageMode } from '@/lib/storage';
import AddAppointmentModal from '@/components/modals/AddAppointmentModal';
import { useShakeDetection } from '@/hooks/useShakeDetection';

const EyeIcon = ({ open }: { open: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.77 21.77 0 0 1 5.06-6.94" />
        <path d="M1 1l22 22" />
        <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.77 21.77 0 0 1-4.87 6.7" />
      </>
    )}
  </svg>
);

interface AppointmentsSectionProps {
  worker: Worker;
}

interface UndoState {
  appointmentId: string;
  previousStatus: AppointmentStatus;
  timestamp: number;
}

export default function AppointmentsSection({ worker }: AppointmentsSectionProps) {
  const [filterMonth, setFilterMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [showDone, setShowDone] = useState(false);
  const { appointments, loading, error, deleteAppointment, refresh } = useAppointments({ worker, month: filterMonth, autoLoad: true });

  const [modalOpen, setModalOpen] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [workers, setWorkers] = useState<Worker[]>(['dina', 'kida']);
  const [clients, setClients] = useState<Client[]>([]);

  // Undo state management
  const [undoState, setUndoState] = useState<UndoState | null>(null);
  const [showUndoPopup, setShowUndoPopup] = useState(false);

  // Shake detection
  useShakeDetection(() => {
    if (undoState && Date.now() - undoState.timestamp < 10000) { // 10 second window
      setShowUndoPopup(true);
    }
  });

  // Auto-hide undo popup after 5 seconds
  useEffect(() => {
    if (showUndoPopup) {
      const timer = setTimeout(() => {
        setShowUndoPopup(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showUndoPopup]);

  // Fetch categories, services, and clients
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: cats } = await supabase.from('categories').select('*');
        const { data: svcs } = await supabase.from('services').select('*');
        const { data: cls } = await supabase.from('clients').select('*');

        if (cls) {
          const normalizedClients: Client[] = cls
            .filter(
              (c): c is { id: string; name: string; phone: string; email?: string } =>
                typeof c.phone === 'string' && c.phone.trim() !== ''
            )
            .map(c => ({
              id: c.id,
              name: c.name,
              phone: c.phone,
              email: c.email ?? undefined,
            }));

          setClients(normalizedClients);
        }

        if (cats) setCategories(cats as Category[]);
        if (svcs) setServices(svcs as Service[]);
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

  const handleUpdateStatus = async (id: string, newStatus: AppointmentStatus) => {
    try {
      // Store previous status for undo
      const appointment = appointments.find(a => a.id === id);
      if (appointment) {
        setUndoState({
          appointmentId: id,
          previousStatus: appointment.status || 'pending',
          timestamp: Date.now()
        });
      }

      if (storageMode === 'supabase') {
        const { error } = await supabase
          .from('appointments')
          .update({ 
            status: newStatus,
            is_done: newStatus === 'done'
          })
          .eq('id', id);
        if (error) throw error;
      } else {
        const allAppointments = (storage.get(STORAGE_KEYS.APPOINTMENTS) as Appointment[]) || [];
        const updated = allAppointments.map((apt) =>
          apt.id === id ? { ...apt, status: newStatus, is_done: newStatus === 'done' } : apt
        );
        storage.set(STORAGE_KEYS.APPOINTMENTS, updated);
      }
      await refresh();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update appointment status');
    }
  };

  const handleUndoStatusChange = async () => {
    if (!undoState) return;

    try {
      if (storageMode === 'supabase') {
        const { error } = await supabase
          .from('appointments')
          .update({ 
            status: undoState.previousStatus,
            is_done: undoState.previousStatus === 'done'
          })
          .eq('id', undoState.appointmentId);
        if (error) throw error;
      } else {
        const allAppointments = (storage.get(STORAGE_KEYS.APPOINTMENTS) as Appointment[]) || [];
        const updated = allAppointments.map((apt) =>
          apt.id === undoState.appointmentId 
            ? { ...apt, status: undoState.previousStatus, is_done: undoState.previousStatus === 'done' } 
            : apt
        );
        storage.set(STORAGE_KEYS.APPOINTMENTS, updated);
      }
      
      setShowUndoPopup(false);
      setUndoState(null);
      await refresh();
    } catch (error) {
      console.error('Error undoing status change:', error);
      alert('Failed to undo status change');
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

  const handleUpdateWorker = async (id: string, newWorker: 'dina' | 'kida') => {
    try {
      if (storageMode === 'supabase') {
        const { error } = await supabase
          .from('appointments')
          .update({ worker: newWorker })
          .eq('id', id);
        if (error) throw error;
      } else {
        const allAppointments = (storage.get(STORAGE_KEYS.APPOINTMENTS) as Appointment[]) || [];
        const updated = allAppointments.map((apt) =>
          apt.id === id ? { ...apt, worker: newWorker } : apt
        );
        storage.set(STORAGE_KEYS.APPOINTMENTS, updated);
      }
      await refresh();
    } catch (error) {
      console.error('Error updating worker:', error);
      alert('Failed to transfer appointment');
    }
  };

  const handleUpdateService = async (
    id: string,
    service: string,
    price: number,
    duration: number
  ) => {
    try {
      if (storageMode === 'supabase') {
        const { error } = await supabase
          .from('appointments')
          .update({ service, price, duration })
          .eq('id', id);
        if (error) throw error;
      } else {
        const allAppointments =
          (storage.get(STORAGE_KEYS.APPOINTMENTS) as Appointment[]) || [];
        const updated = allAppointments.map(apt =>
          apt.id === id ? { ...apt, service, price, duration } : apt
        );
        storage.set(STORAGE_KEYS.APPOINTMENTS, updated);
      }
      await refresh();
    } catch (error) {
      console.error('Error updating service:', error);
      alert('Failed to update service');
    }
  };

  const handleAddAdditionalService = async (
    id: string,
    additionalName: string,
    additionalPrice: number
  ) => {
    try {
      const appointment = appointments.find(a => a.id === id);
      if (!appointment) return;

      const newPrice = appointment.price + additionalPrice;

      const updatedAdditionalServices = [
        ...(appointment.additional_services || []),
        { name: additionalName, price: additionalPrice }
      ];

      if (storageMode === 'supabase') {
        const { error } = await supabase
          .from('appointments')
          .update({
            price: newPrice,
            additional_services: updatedAdditionalServices
          })
          .eq('id', id);

        if (error) throw error;
      } else {
        const allAppointments =
          (storage.get(STORAGE_KEYS.APPOINTMENTS) as Appointment[]) || [];

        const updated = allAppointments.map(apt =>
          apt.id === id
            ? { ...apt, price: newPrice, additional_services: updatedAdditionalServices }
            : apt
        );

        storage.set(STORAGE_KEYS.APPOINTMENTS, updated);
      }

      await refresh();
    } catch (error) {
      console.error('Error adding additional service:', error);
      alert('Failed to add additional service');
    }
  };

  const handleRemoveAdditionalService = async (id: string, index: number) => {
    try {
      const appointment = appointments.find(a => a.id === id);
      if (!appointment || !appointment.additional_services) return;

      const serviceToRemove = appointment.additional_services[index];
      const updatedServices = appointment.additional_services.filter((_, i) => i !== index);
      const newPrice = appointment.price - serviceToRemove.price;

      if (storageMode === 'supabase') {
        const { error } = await supabase
          .from('appointments')
          .update({
            price: newPrice,
            additional_services: updatedServices.length ? updatedServices : null
          })
          .eq('id', id);

        if (error) throw error;
      } else {
        const allAppointments =
          (storage.get(STORAGE_KEYS.APPOINTMENTS) as Appointment[]) || [];

        const updated = allAppointments.map(apt =>
          apt.id === id
            ? { ...apt, price: newPrice, additional_services: updatedServices }
            : apt
        );

        storage.set(STORAGE_KEYS.APPOINTMENTS, updated);
      }

      await refresh();
    } catch (error) {
      console.error('Error removing additional service:', error);
      alert('Failed to remove additional service');
    }
  };

  const handleRevertDiscount = async (id: string) => {
    try {
      const appointment = appointments.find(a => a.id === id);
      if (!appointment || !appointment.discount_applied) return;

      const restoredPrice = appointment.price * 2;

      if (storageMode === 'supabase') {
        const { error } = await supabase
          .from('appointments')
          .update({ price: restoredPrice, discount_applied: false })
          .eq('id', id);

        if (error) throw error;
      } else {
        const allAppointments =
          (storage.get(STORAGE_KEYS.APPOINTMENTS) as Appointment[]) || [];

        const updated = allAppointments.map(apt =>
          apt.id === id
            ? { ...apt, price: restoredPrice, discount_applied: false }
            : apt
        );

        storage.set(STORAGE_KEYS.APPOINTMENTS, updated);
      }

      await refresh();
    } catch (error) {
      console.error('Error reverting discount:', error);
      alert('Failed to revert discount');
    }
  };

  const handleFifthVisitDiscount = async (id: string) => {
    try {
      const appointment = appointments.find(a => a.id === id);
      if (!appointment) return;

      const discountedPrice = appointment.price * 0.5;

      if (storageMode === 'supabase') {
        const { error } = await supabase
          .from('appointments')
          .update({ price: discountedPrice, discount_applied: true })
          .eq('id', id);

        if (error) throw error;
      } else {
        const allAppointments =
          (storage.get(STORAGE_KEYS.APPOINTMENTS) as Appointment[]) || [];

        const updated = allAppointments.map(apt =>
          apt.id === id
            ? { ...apt, price: discountedPrice, discount_applied: true }
            : apt
        );

        storage.set(STORAGE_KEYS.APPOINTMENTS, updated);
      }

      await refresh();
    } catch (error) {
      console.error('Error applying discount:', error);
      alert('Failed to apply 5th visit discount');
    }
  };

  const visibleAppointments = showDone
  ? appointments
  : appointments.filter(a => !a.is_done && a.status !== 'done' && a.status !== 'cancelled');

  const getStatusText = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmed': return 'Confirmed';
      case 'arrived': return 'Arrived';
      case 'done': return 'Done';
      case 'cancelled': return 'Cancelled';
      default: return 'Pending';
    }
  };

  return (
    <div id="appointments">
      <h2>Appointments</h2>

      {/* Undo Status Change Popup */}
      {showUndoPopup && undoState && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#2c2c2e',
            border: '2px solid #007aff',
            borderRadius: '16px',
            padding: '20px 24px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            zIndex: 9999,
            minWidth: '280px',
            maxWidth: '90%',
            animation: 'slideUp 0.3s ease-out'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <p style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              marginBottom: '12px',
              color: '#fff'
            }}>
              Undo Status Change?
            </p>
            <p style={{ 
              fontSize: '14px', 
              color: '#888', 
              marginBottom: '20px' 
            }}>
              Revert to "{getStatusText(undoState.previousStatus)}"
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowUndoPopup(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#3a3a3c',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleUndoStatusChange}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#007aff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Undo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop for popup */}
      {showUndoPopup && (
        <div
          onClick={() => setShowUndoPopup(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 9998
          }}
        />
      )}

      {/* Month Filter + Show Done Toggle */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '15px',
          alignItems: 'center'
        }}
      >
        <input
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          style={{
            height: '42px',
            minHeight: '42px',
            padding: '0 10px',
            borderRadius: '8px',
            fontSize: '14px',
            boxSizing: 'border-box',
            appearance: 'auto',
            outline: 'none'
          }}
        />

        <button
          onClick={() => setShowDone(prev => !prev)}
          title={showDone ? 'Hide done appointments' : 'Show done appointments'}
          style={{
            height: '42px',
            width: '42px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: showDone ? 1 : 0.6,
            transform: 'translateY(-5px)'
          }}
        >
          <EyeIcon open={showDone} />
        </button>
      </div>

      <AppointmentsList
        appointments={visibleAppointments}
        onDelete={handleDelete}
        onMarkDone={handleMarkDone}
        onUpdateStatus={handleUpdateStatus}
        onUpdateCompletionTime={handleUpdateCompletionTime}
        onUpdateDuration={handleUpdateDuration}
        onUpdateDate={handleUpdateDate}
        onUpdateTime={handleUpdateTime}
        onUpdateCustomerName={handleUpdateCustomerName}
        onUpdateWorker={handleUpdateWorker}
        onUpdateService={handleUpdateService}
        onAddAdditionalService={handleAddAdditionalService}
        onFifthVisitDiscount={handleFifthVisitDiscount}
        onRemoveAdditionalService={handleRemoveAdditionalService}
        onRevertDiscount={handleRevertDiscount}
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
          clients={clients}
          onClose={() => setModalOpen(false)}
          onAdded={refresh}
        />
      )}

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, -40%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
    </div>
  );
}