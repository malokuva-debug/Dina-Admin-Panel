// AppointmentList.tsx
'use client';

import { useState } from 'react';
import { Appointment } from '@/types';
import { supabase } from '@/lib/supabase';

interface AppointmentsListProps {
  appointments: Appointment[];
  onDelete: (id: string) => void;
  onMarkDone?: (id: string, isDone: boolean) => void;
  onUpdateStatus?: (id: string, status: 'pending' | 'confirmed' | 'arrived' | 'done') => void;
  onUpdateCompletionTime?: (id: string, time: string) => void;
  onUpdateDuration?: (id: string, duration: number) => void;
  onUpdateDate?: (id: string, date: string) => void;
  onUpdateTime?: (id: string, time: string) => void;
  onUpdateCustomerName?: (id: string, name: string) => void;
  loading?: boolean;
}

export default function AppointmentsList({ 
  appointments, 
  onDelete,
  onMarkDone,
  onUpdateStatus,
  onUpdateCompletionTime,
  onUpdateDuration,
  onUpdateDate,
  onUpdateTime,
  onUpdateCustomerName,
  loading = false 
}: AppointmentsListProps) {
  const [editingDuration, setEditingDuration] = useState<string | null>(null);
  const [tempDuration, setTempDuration] = useState<number>(0);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [tempDate, setTempDate] = useState<string>('');
  const [editingTime, setEditingTime] = useState<string | null>(null);
  const [tempTime, setTempTime] = useState<string>('');
  const [editingName, setEditingName] = useState<string | null>(null);
  const [tempName, setTempName] = useState<string>('');
  const [clients, setClients] = useState<any[]>([]);
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

  const handleMarkDone = (id: string, currentStatus: boolean) => {
    if (onMarkDone) {
      onMarkDone(id, !currentStatus);
    }
  };

  const handleStatusChange = (id: string, newStatus: 'pending' | 'confirmed' | 'arrived' | 'done') => {
    if (onUpdateStatus) {
      onUpdateStatus(id, newStatus);
    }
  };

  const handleDurationClick = (id: string, currentDuration: number) => {
    setEditingDuration(id);
    setTempDuration(currentDuration);
  };

  const handleDurationSave = async (id: string, startTime: string) => {
    if (tempDuration && tempDuration > 0 && onUpdateDuration) {
      // Update the duration, which will auto-recalculate completion time
      await onUpdateDuration(id, tempDuration);
    }
    setEditingDuration(null);
    setTempDuration(0);
  };

  const handleDurationCancel = () => {
    setEditingDuration(null);
    setTempDuration(0);
  };

  const handleDateClick = (id: string, currentDate: string) => {
    setEditingDate(id);
    setTempDate(currentDate);
  };

  const handleDateSave = async (id: string) => {
    if (tempDate && onUpdateDate) {
      await onUpdateDate(id, tempDate);
    }
    setEditingDate(null);
    setTempDate('');
  };

  const handleDateCancel = () => {
    setEditingDate(null);
    setTempDate('');
  };

  const handleTimeClick = (id: string, currentTime: string) => {
    setEditingTime(id);
    setTempTime(currentTime);
  };

  const handleTimeSave = async (id: string) => {
    if (tempTime && onUpdateTime) {
      await onUpdateTime(id, tempTime);
    }
    setEditingTime(null);
    setTempTime('');
  };

  const handleTimeCancel = () => {
    setEditingTime(null);
    setTempTime('');
  };

  const handleNameClick = (id: string, currentName: string) => {
    setEditingName(id);
    setTempName(currentName);
  };

  const handleNameSave = async (id: string) => {
    if (tempName && onUpdateCustomerName) {
      await onUpdateCustomerName(id, tempName);
    }
    setEditingName(null);
    setTempName('');
  };

  const handleNameCancel = () => {
    setEditingName(null);
    setTempName('');
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
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid #2c2c2e',
              borderTop: '3px solid #007aff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 15px',
            }}
          />
          <p style={{ color: '#888' }}>Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <svg
            viewBox="0 0 24 24"
            style={{
              width: '60px',
              height: '60px',
              stroke: '#3a3a3c',
              fill: 'none',
              strokeWidth: 2,
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              margin: '0 auto 20px',
            }}
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <p style={{ color: '#888', fontSize: '16px' }}>
            No appointments found
          </p>
          <p style={{ color: '#555', fontSize: '14px', marginTop: '8px' }}>
            Appointments for this month will appear here
          </p>
        </div>
      </div>
    );
  }

  // Sort appointments by date and time (nearest first)
  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div id="appointmentsList">
      {sortedAppointments.map(apt => {
        const isDone = apt.is_done || false;
        const status = apt.status || 'pending';
        const duration = apt.duration || 60;
        const estimatedCompletion = calculateCompletionTime(apt.time, duration);
        const statusStyle = getStatusColor(status);
        
        return (
          <div 
            key={apt.id} 
            className="card"
            style={{
              opacity: isDone || status === 'done' ? 0.6 : 1,
              background: isDone || status === 'done' ? '#1a1a1c' : '#1c1c1e',
              border: status === 'arrived' ? '2px solid #ff9500' : 
                      status === 'confirmed' ? '2px solid #007aff' : 'none',
            }}
          >
            <div style={{ marginBottom: '15px' }}>
              {/* Header with service name and status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    marginBottom: '8px',
                    textDecoration: isDone || status === 'done' ? 'line-through' : 'none',
                  }}>
                    {apt.service}
                  </h3>
                  
                  {/* Date and Time */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <svg
                      viewBox="0 0 24 24"
                      style={{
                        width: '16px',
                        height: '16px',
                        stroke: '#888',
                        fill: 'none',
                        strokeWidth: 2,
                      }}
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    {editingDate === apt.id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input
                          type="date"
                          value={tempDate}
                          onChange={(e) => setTempDate(e.target.value)}
                          style={{
                            padding: '4px 8px',
                            background: '#2c2c2e',
                            border: '1px solid #007aff',
                            borderRadius: '6px',
                            color: '#fff',
                            fontSize: '13px',
                          }}
                          autoFocus
                        />
                        <button
                          onClick={() => handleDateSave(apt.id)}
                          style={{
                            padding: '4px 8px',
                            background: '#34c759',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          ✓
                        </button>
                        <button
                          onClick={handleDateCancel}
                          style={{
                            padding: '4px 8px',
                            background: '#ff3b30',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <span 
                        onClick={() => handleDateClick(apt.id, apt.date)}
                        style={{ 
                          color: '#888', 
                          fontSize: '14px',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          textDecorationStyle: 'dotted',
                        }}
                        title="Click to edit date"
                      >
                        {formatDate(apt.date)}
                      </span>
                    )}
                    <span style={{ color: '#888', fontSize: '14px' }}>at</span>
                    {editingTime === apt.id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input
                          type="time"
                          value={tempTime}
                          onChange={(e) => setTempTime(e.target.value)}
                          style={{
                            padding: '4px 8px',
                            background: '#2c2c2e',
                            border: '1px solid #007aff',
                            borderRadius: '6px',
                            color: '#fff',
                            fontSize: '13px',
                          }}
                          autoFocus
                        />
                        <button
                          onClick={() => handleTimeSave(apt.id)}
                          style={{
                            padding: '4px 8px',
                            background: '#34c759',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          ✓
                        </button>
                        <button
                          onClick={handleTimeCancel}
                          style={{
                            padding: '4px 8px',
                            background: '#ff3b30',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <span 
                        onClick={() => handleTimeClick(apt.id, apt.time)}
                        style={{ 
                          color: '#888', 
                          fontSize: '14px',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          textDecorationStyle: 'dotted',
                        }}
                        title="Click to edit time"
                      >
                        {formatTime(apt.time)}
                      </span>
                    )}
                  </div>

                  {/* Estimated Completion Time */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <svg
                      viewBox="0 0 24 24"
                      style={{
                        width: '16px',
                        height: '16px',
                        stroke: '#007aff',
                        fill: 'none',
                        strokeWidth: 2,
                      }}
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    {editingDuration === apt.id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input
                          type="number"
                          min="5"
                          max="300"
                          step="5"
                          value={tempDuration}
                          onChange={(e) => setTempDuration(parseInt(e.target.value) || 0)}
                          style={{
                            padding: '4px 8px',
                            background: '#2c2c2e',
                            border: '1px solid #007aff',
                            borderRadius: '6px',
                            color: '#fff',
                            fontSize: '13px',
                            width: '70px',
                          }}
                          autoFocus
                        />
                        <span style={{ color: '#888', fontSize: '13px' }}>min</span>
                        <button
                          onClick={() => handleDurationSave(apt.id, apt.time)}
                          style={{
                            padding: '4px 8px',
                            background: '#34c759',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          ✓
                        </button>
                        <button
                          onClick={handleDurationCancel}
                          style={{
                            padding: '4px 8px',
                            background: '#ff3b30',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <span 
                        onClick={() => handleDurationClick(apt.id, duration)}
                        style={{ 
                          color: '#007aff', 
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          textDecorationStyle: 'dotted',
                        }}
                        title="Click to edit duration"
                      >
                        Done by: {formatTime(estimatedCompletion)} ({duration} min)
                      </span>
                    )}
                  </div>

                  {/* Customer Name */}
{apt.customer_name && (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
    <svg
      viewBox="0 0 24 24"
      style={{
        width: '16px',
        height: '16px',
        stroke: '#888',
        fill: 'none',
        strokeWidth: 2,
      }}
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>

    {editingName === apt.id ? (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
        <input
          type="text"
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          style={{
            padding: '4px 8px',
            background: '#2c2c2e',
            border: '1px solid #007aff',
            borderRadius: '6px',
            color: '#fff',
            fontSize: '13px',
            flex: 1,
          }}
          autoFocus
          placeholder="Customer name"
        />
        <button
          onClick={() => handleNameSave(apt.id)}
          style={{
            padding: '4px 8px',
            background: '#34c759',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          ✓
        </button>
        <button
          onClick={handleNameCancel}
          style={{
            padding: '4px 8px',
            background: '#ff3b30',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
      </div>
    ) : (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
        <span 
          onClick={() => handleNameClick(apt.id, apt.customer_name || '')}
          style={{ 
            color: '#888', 
            fontSize: '14px', 
            fontWeight: '500',
            cursor: 'pointer',
            textDecoration: 'underline',
            textDecorationStyle: 'dotted',
          }}
          title="Click to edit name"
        >
          {apt.customer_name}
        </span>
        
        {/* + Icon only if customer does NOT exist */}
        {!clients.some(c => c.name === apt.customer_name) && (
          <span
            style={{
              color: '#34c759',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: '600',
              userSelect: 'none',
            }}
            title="Add to clients"
            onClick={async () => {
              try {
                // Insert client into Supabase
                const { data, error } = await supabase.from('clients').insert({
                  name: apt.customer_name,
                  phone: apt.customer_phone || '',
                }).select();

                if (error) throw error;

                alert(`Added ${apt.customer_name} as a new client`);

                // Update local state
                if (data && data.length > 0) {
                  setClients(prev => [...prev, data[0]]);
                }
              } catch (err) {
                console.error('Failed to add client:', err);
                alert('Failed to add client');
              }
            }}
          >
            +
          </span>
        )}
      </div>
    )}
  </div>
)}

                  {/* Phone Number with Call Button */}
                  {apt.customer_phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg
                        viewBox="0 0 24 24"
                        style={{
                          width: '16px',
                          height: '16px',
                          stroke: '#888',
                          fill: 'none',
                          strokeWidth: 2,
                        }}
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                      <span style={{ color: '#888', fontSize: '14px' }}>
                        {formatPhone(apt.customer_phone)}
                      </span>
                      <button
                        onClick={() => handleCall(apt.customer_phone!)}
                        style={{
                          marginLeft: '8px',
                          padding: '6px 12px',
                          background: '#34c759',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          style={{
                            width: '14px',
                            height: '14px',
                            stroke: 'white',
                            fill: 'none',
                            strokeWidth: 2,
                          }}
                        >
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                        Call
                      </button>
                    </div>
                  )}
                </div>

                {/* Price and Worker Badge */}
                <div style={{ textAlign: 'right', paddingLeft: '15px' }}>
                  <div style={{ 
                    fontSize: '22px', 
                    fontWeight: '700', 
                    color: isDone || status === 'done' ? '#888' : '#007aff',
                    marginBottom: '8px',
                  }}>
                    ${apt.price.toFixed(2)}
                  </div>
                  <div style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    background: '#007aff20',
                    color: '#007aff',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'capitalize',
                    marginBottom: '8px',
                  }}>
                    {apt.worker}
                  </div>
                  <div style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    background: statusStyle.bg,
                    color: statusStyle.color,
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '600',
                  }}>
                    {statusStyle.text}
                  </div>
                </div>
              </div>
            </div>

            {/* Status Action Buttons */}
            {onUpdateStatus && status !== 'done' && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                {status === 'pending' && (
                  <button
                    onClick={() => handleStatusChange(apt.id, 'confirmed')}
                    style={{
                      flex: 1,
                      minWidth: '120px',
                      padding: '10px',
                      background: '#007aff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12l5 5l10 -10"></path>
                    </svg>
                    Confirm
                  </button>
                )}
                
                {status === 'confirmed' && (
                  <button
                    onClick={() => handleStatusChange(apt.id, 'arrived')}
                    style={{
                      flex: 1,
                      minWidth: '120px',
                      padding: '10px',
                      background: '#ff9500',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 11l3 3l8 -8"></path>
                      <path d="M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9"></path>
                    </svg>
                    Mark Arrived
                  </button>
                )}
                
                {status === 'arrived' && (
                  <button
                    onClick={() => handleStatusChange(apt.id, 'done')}
                    style={{
                      flex: 1,
                      minWidth: '120px',
                      padding: '10px',
                      background: '#34c759',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12l5 5l10 -10"></path>
                    </svg>
                    Complete
                  </button>
                )}
              </div>
            )}

            {/* Delete Button */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleDelete(apt.id, apt.service)}
                className="btn-remove"
                style={{ 
                  flex: 1,
                  padding: '12px',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}