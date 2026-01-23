'use client';

import { Appointment } from '@/types';

interface AppointmentsListProps {
  appointments: Appointment[];
  onDelete: (id: string) => void;
  loading?: boolean;
}

export default function AppointmentsList({ 
  appointments, 
  onDelete, 
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

  const handleDelete = (id: string, service: string) => {
    if (confirm(`Delete appointment for ${service}?`)) {
      onDelete(id);
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
      {appointments.map(apt => (
        <div key={apt.id} className="card">
          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                  {apt.service}
                </h3>
                
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
                    {formatDate(apt.date)}
                  </span>
                </div>

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
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span style={{ color: '#888', fontSize: '14px' }}>
                    {formatTime(apt.time)}
                  </span>
                </div>

                {apt.customerName && (
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
                    <span style={{ color: '#888', fontSize: '14px' }}>
                      {apt.customerName}
                    </span>
                  </div>
                )}

                {apt.customerPhone && (
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
                      {apt.customerPhone}
                    </span>
                  </div>
                )}
              </div>

              <div style={{ textAlign: 'right', paddingLeft: '15px' }}>
                <div style={{ 
                  fontSize: '22px', 
                  fontWeight: '700', 
                  color: '#007aff',
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
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => handleDelete(apt.id, apt.service)}
              className="btn-remove"
              style={{ flex: 1 }}
            >
              Delete Appointment
            </button>
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}