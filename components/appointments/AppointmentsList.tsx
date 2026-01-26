'use client';

import { Appointment } from '@/types';

interface AppointmentsListProps {
  appointments: Appointment[];
  onDelete: (id: string) => void;
  onMarkDone?: (id: string, isDone: boolean) => void;
  loading?: boolean;
}

export default function AppointmentsList({ 
  appointments, 
  onDelete,
  onMarkDone,
  loading = false 
}: AppointmentsListProps) {
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

  return (
    <div id="appointmentsList">
      {appointments.map(apt => {
        const isDone = (apt as any).is_done || false;
        
        return (
          <div 
            key={apt.id} 
            className="card"
            style={{
              opacity: isDone ? 0.6 : 1,
              background: isDone ? '#1a1a1c' : '#1c1c1e',
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
                    textDecoration: isDone ? 'line-through' : 'none',
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
                    <span style={{ color: '#888', fontSize: '14px' }}>
                      {formatDate(apt.date)} at {formatTime(apt.time)}
                    </span>
                  </div>

                  {/* Customer Name */}
                    {(apt as any).customer_name && (
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
                      <span style={{ color: '#888', fontSize: '14px', fontWeight: '500' }}>
                        {(apt as any).customer_name}
                      </span>
                    </div>
                  )}

                  {/* Phone Number with Call Button */}
                  {(apt as any).customer_phone && (
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
                        {formatPhone((apt as any).customer_phone)}
                      </span>
                      <button
                        onClick={() => handleCall((apt as any).customer_phone)}
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
                    color: isDone ? '#888' : '#007aff',
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
                  }}>
                    {apt.worker}
                  </div>
                  {isDone && (
                    <div style={{
                      marginTop: '8px',
                      padding: '4px 10px',
                      background: '#34c75920',
                      color: '#34c759',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '600',
                    }}>
                      ✓ Done
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {onMarkDone && (
                <button
                  onClick={() => handleMarkDone(apt.id, isDone)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: isDone ? '#ff9500' : '#34c759',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  {isDone ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"></path>
                        <path d="M12 7v5l3 3"></path>
                      </svg>
                      Mark as Pending
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12l5 5l10 -10"></path>
                      </svg>
                      Mark as Done
                    </>
                  )}
                </button>
              )}
              
              <button
                onClick={() => handleDelete(apt.id, apt.service)}
                className="btn-remove"
                style={{ 
                  flex: onMarkDone ? 0.5 : 1,
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