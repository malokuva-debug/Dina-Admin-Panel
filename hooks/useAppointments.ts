import { useState, useEffect, useCallback } from 'react';
import { Appointment, Worker } from '@/types';
import { db, storage, STORAGE_KEYS, storageMode } from '@/lib/storage';
import { useNotifications } from './useNotifications';

interface UseAppointmentsOptions {
  worker?: Worker;
  month?: string;
  autoLoad?: boolean;
}

export function useAppointments(options: UseAppointmentsOptions = {}) {
  const { worker, month, autoLoad = true } = options;
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { notifyNewAppointment } = useNotifications();

  // Load appointments
  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (storageMode === 'supabase') {
        const filters: { worker?: string; month?: string } = {};
        if (worker) filters.worker = worker;
        if (month) filters.month = month;

        const data = await db.appointments.getAll(filters);
        setAppointments(data);
      } else {
        // localStorage mode
        let data = storage.get<Appointment[]>(STORAGE_KEYS.APPOINTMENTS) || [];

        // Apply filters
        if (worker) {
          data = data.filter(apt => apt.worker === worker);
        }

        if (month) {
          const [year, monthNum] = month.split('-');
          data = data.filter(apt => {
            const [aptYear, aptMonth] = apt.date.split('-');
            return aptYear === year && aptMonth === monthNum;
          });
        }

        // Sort by date and time
        data.sort((a, b) => {
          const dateCompare = a.date.localeCompare(b.date);
          if (dateCompare !== 0) return dateCompare;
          return a.time.localeCompare(b.time);
        });

        setAppointments(data);
      }
    } catch (err) {
      console.error('Error loading appointments:', err);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, [worker, month]);

  // Create appointment
  const createAppointment = async (
    appointment: Omit<Appointment, 'id'>
  ): Promise<Appointment | null> => {
    setLoading(true);
    setError(null);

    try {
      let newAppointment: Appointment | null = null;

      if (storageMode === 'supabase') {
        newAppointment = await db.appointments.create(appointment);
      } else {
        const appointments = storage.get<Appointment[]>(STORAGE_KEYS.APPOINTMENTS) || [];
        newAppointment = {
          ...appointment,
          id: Date.now().toString(),
        };
        storage.set(STORAGE_KEYS.APPOINTMENTS, [...appointments, newAppointment]);
      }

      if (newAppointment) {
        // Send notification to worker
        try {
          await notifyNewAppointment(appointment.worker, {
            service: appointment.service,
            date: appointment.date,
            time: appointment.time,
            customerName: appointment.customerName,
          });
        } catch (notifError) {
          console.warn('Failed to send notification:', notifError);
          // Don't fail the appointment creation if notification fails
        }

        await loadAppointments();
      }

      return newAppointment;
    } catch (err) {
      console.error('Error creating appointment:', err);
      setError('Failed to create appointment');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update appointment
  const updateAppointment = async (
    id: string,
    updates: Partial<Appointment>
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      if (storageMode === 'supabase') {
        // Supabase doesn't have update method in our db helper yet
        // You would need to add it to lib/storage.ts
        console.warn('Update appointment not implemented for Supabase yet');
        return false;
      } else {
        const appointments = storage.get<Appointment[]>(STORAGE_KEYS.APPOINTMENTS) || [];
        const updated = appointments.map(apt =>
          apt.id === id ? { ...apt, ...updates } : apt
        );
        storage.set(STORAGE_KEYS.APPOINTMENTS, updated);
        await loadAppointments();
        return true;
      }
    } catch (err) {
      console.error('Error updating appointment:', err);
      setError('Failed to update appointment');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete appointment
  const deleteAppointment = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const success = await db.appointments.delete(id);
      if (success) {
        await loadAppointments();
      }
      return success;
    } catch (err) {
      console.error('Error deleting appointment:', err);
      setError('Failed to delete appointment');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get appointments for a specific date
  const getAppointmentsByDate = (date: string): Appointment[] => {
    return appointments.filter(apt => apt.date === date);
  };

  // Get appointments for today
  const getTodayAppointments = (): Appointment[] => {
    const today = new Date().toISOString().split('T')[0];
    return getAppointmentsByDate(today);
  };

  // Get upcoming appointments
  const getUpcomingAppointments = (days: number = 7): Appointment[] => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    const todayStr = today.toISOString().split('T')[0];
    const futureDateStr = futureDate.toISOString().split('T')[0];

    return appointments.filter(apt => apt.date >= todayStr && apt.date <= futureDateStr);
  };

  // Check if time slot is available
  const isTimeSlotAvailable = (
    date: string,
    time: string,
    duration: number,
    checkWorker?: Worker
  ): boolean => {
    const dayAppointments = appointments.filter(
      apt => apt.date === date && (!checkWorker || apt.worker === checkWorker)
    );

    const requestedStart = new Date(`${date}T${time}`);
    const requestedEnd = new Date(requestedStart.getTime() + duration * 60000);

    return !dayAppointments.some(apt => {
      const aptStart = new Date(`${apt.date}T${apt.time}`);
      const aptEnd = new Date(aptStart.getTime() + (apt.duration || 30) * 60000);

      // Check for overlap
      return (
        (requestedStart >= aptStart && requestedStart < aptEnd) ||
        (requestedEnd > aptStart && requestedEnd <= aptEnd) ||
        (requestedStart <= aptStart && requestedEnd >= aptEnd)
      );
    });
  };

  // Auto-load on mount if enabled
  useEffect(() => {
    if (autoLoad) {
      loadAppointments();
    }
  }, [autoLoad, loadAppointments]);

  return {
    appointments,
    loading,
    error,
    loadAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointmentsByDate,
    getTodayAppointments,
    getUpcomingAppointments,
    isTimeSlotAvailable,
    refresh: loadAppointments,
  };
}