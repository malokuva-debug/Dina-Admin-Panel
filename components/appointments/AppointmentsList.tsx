// AppointmentList.tsx
'use client';

import { useState, useMemo } from 'react';
import { Appointment } from '@/types';

interface AppointmentsListProps {
  appointments: Appointment[];
  onDelete: (id: string) => void;
  onMarkDone?: (id: string, isDone: boolean) => void;
  onUpdateStatus?: (
    id: string,
    status: 'pending' | 'confirmed' | 'arrived' | 'done'
  ) => void;
  onUpdateCompletionTime?: (id: string, time: string) => void;
  onUpdateDuration?: (id: string, duration: number) => void;
  loading?: boolean;
}

export default function AppointmentsList({
  appointments,
  onDelete,
  onMarkDone,
  onUpdateStatus,
  onUpdateCompletionTime,
  onUpdateDuration,
  loading = false,
}: AppointmentsListProps) {
  const [editingDuration, setEditingDuration] = useState<string | null>(null);
  const [tempDuration, setTempDuration] = useState<number>(0);

  // 🔥 SORT BY NEAREST DATE + TIME
  const sortedAppointments = useMemo(() => {
    return [...appointments].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`).getTime();
      const dateB = new Date(`${b.date}T${b.time}`).getTime();
      return dateA - dateB;
    });
  }, [appointments]);

  const calculateCompletionTime = (startTime: string, durationMinutes: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);

    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

    const endHours = String(endDate.getHours()).padStart(2, '0');
    const endMinutes = String(endDate.getMinutes()).padStart(2, '0');

    return `${endHours}:${endMinutes}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatPhone = (phone: string) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const handleCall = (phone: string) => {
    if (!phone) return;
    const cleaned = phone.replace(/\D/g, '');
    window.location.href = `tel:+1${cleaned}`;
  };

  const handleDelete = (id: string, service: string) => {
    if (confirm(`Delete appointment for ${service}?`)) {
      onDelete(id);
    }
  };

  const handleStatusChange = (
    id: string,
    newStatus: 'pending' | 'confirmed' | 'arrived' | 'done'
  ) => {
    onUpdateStatus?.(id, newStatus);
  };

  const handleDurationClick = (id: string, currentDuration: number) => {
    setEditingDuration(id);
    setTempDuration(currentDuration);
  };

  const handleDurationSave = async (id: string) => {
    if (tempDuration > 0 && onUpdateDuration) {
      await onUpdateDuration(id, tempDuration);
    }
    setEditingDuration(null);
    setTempDuration(0);
  };

  const handleDurationCancel = () => {
    setEditingDuration(null);
    setTempDuration(0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { bg: '#007aff20', color: '#007aff', text: 'Confirmed' };
      case 'arrived':
        return { bg: '#ff950020', color: '#ff9500', text: 'Arrived' };
      case 'done':
        return { bg: '#34c75920', color: '#34c759', text: 'Done' };
      default:
        return { bg: '#88888820', color: '#888', text: 'Pending' };
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p style={{ color: '#888' }}>Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ color: '#888' }}>No appointments found</p>
        </div>
      </div>
    );
  }

  return (
    <div id="appointmentsList">
      {sortedAppointments.map((apt) => {
        const status = apt.status || 'pending';
        const duration = apt.duration || 60;
        const estimatedCompletion = calculateCompletionTime(apt.time, duration);
        const statusStyle = getStatusColor(status);

        return (
          <div key={apt.id} className="card">
            <h3>{apt.service}</h3>
            <p>
              {formatDate(apt.date)} at {formatTime(apt.time)}
            </p>
            <p>
              Done by: {formatTime(estimatedCompletion)} ({duration} min)
            </p>
            <p>{apt.customer_name}</p>
            <p>{formatPhone(apt.customer_phone || '')}</p>

            <div
              style={{
                display: 'inline-block',
                padding: '4px 10px',
                background: statusStyle.bg,
                color: statusStyle.color,
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
              }}
            >
              {statusStyle.text}
            </div>

            <button onClick={() => handleDelete(apt.id, apt.service)}>
              Delete
            </button>
          </div>
        );
      })}
    </div>
  );
}