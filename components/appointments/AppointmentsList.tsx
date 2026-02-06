// AppointmentList.tsx
'use client';

import { useState } from 'react';
import { Appointment } from '@/types';

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

  const calculateCompletionTime = (startTime: string, durationMinutes: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    return `${String(endDate.getHours()).padStart(2,'0')}:${String(endDate.getMinutes()).padStart(2,'0')}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
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
    if (cleaned.length === 10) return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
    return phone;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return { bg: '#007aff20', color: '#007aff', text: 'Confirmed' };
      case 'arrived': return { bg: '#ff950020', color: '#ff9500', text: 'Arrived' };
      case 'done': return { bg: '#34c75920', color: '#34c759', text: 'Done' };
      default: return { bg: '#88888820', color: '#888', text: 'Pending' };
    }
  };

  // sort appointments nearest first
  const sortedAppointments = [...appointments].sort((a,b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());

  if (loading) return (
    <div className="card">
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #2c2c2e', borderTop: '3px solid #007aff', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto 15px' }} />
        <p style={{ color:'#888' }}>Loading appointments...</p>
      </div>
    </div>
  );

  if (appointments.length === 0) return (
    <div className="card">
      <div style={{ textAlign:'center', padding:'40px 20px' }}>
        <svg viewBox="0 0 24 24" style={{ width:'60px', height:'60px', stroke:'#3a3a3c', fill:'none', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', margin:'0 auto 20px'}}>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <p style={{ color:'#888', fontSize:'16px' }}>No appointments found</p>
        <p style={{ color:'#555', fontSize:'14px', marginTop:'8px'}}>Appointments for this month will appear here</p>
      </div>
    </div>
  );

  return (
    <div id="appointmentsList">
      {sortedAppointments.map((apt) => {
        const isDone = apt.is_done || false;
        const status = apt.status || 'pending';
        const duration = apt.duration || 60;
        const estimatedCompletion = calculateCompletionTime(apt.time, duration);
        const statusStyle = getStatusColor(status);

        return (
          <div key={apt.id} className="card" style={{
            opacity: isDone || status === 'done' ? 0.6 : 1,
            background: isDone || status === 'done' ? '#1a1a1c' : '#1c1c1e',
            border: status === 'arrived' ? '2px solid #ff9500' : status === 'confirmed' ? '2px solid #007aff' : 'none',
            marginBottom: '15px',
          }}>
            {/* Header */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px' }}>
              <div style={{ flex:1 }}>
                <h3 style={{ fontSize:'18px', fontWeight:'600', marginBottom:'8px', textDecoration: isDone ? 'line-through' : 'none'}}>
                  {apt.service}
                </h3>

                {/* Date & Time */}
                <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px'}}>
                  <span onClick={()=>handleDateClick(apt.id, apt.date)} style={{ color:'#888', cursor:'pointer', textDecoration:'underline', textDecorationStyle:'dotted'}}>{formatDate(apt.date)}</span>
                  <span style={{ color:'#888' }}>at</span>
                  <span onClick={()=>handleTimeClick(apt.id, apt.time)} style={{ color:'#888', cursor:'pointer', textDecoration:'underline', textDecorationStyle:'dotted'}}>{formatTime(apt.time)}</span>
                </div>

                {/* Duration */}
                <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px'}}>
                  <span onClick={()=>handleDurationClick(apt.id, duration)} style={{ color:'#007aff', fontWeight:'600', cursor:'pointer', textDecoration:'underline', textDecorationStyle:'dotted'}}>
                    Done by: {formatTime(estimatedCompletion)} ({duration} min)
                  </span>
                </div>

                {/* Customer */}
                {apt.customer_name && (
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px'}}>
                    <span onClick={()=>handleNameClick(apt.id, apt.customer_name)} style={{ color:'#888', fontWeight:500, cursor:'pointer', textDecoration:'underline', textDecorationStyle:'dotted'}}>
                      {apt.customer_name}
                    </span>
                    <button onClick={() => handleAddClientFromAppointment(apt.customer_name, apt.customer_phone)} style={{ background:'#007aff', border:'none', borderRadius:'50%', width:'20px', height:'20px', cursor:'pointer'}} title="Add as client">+</button>
                  </div>
                )}

                {/* Phone */}
                {apt.customer_phone && (
                  <div style={{ display:'flex', alignItems:'center', gap:'8px'}}>
                    <span style={{ color:'#888' }}>{formatPhone(apt.customer_phone)}</span>
                    <button onClick={()=>handleCall(apt.customer_phone)} style={{ marginLeft:'8px', padding:'6px 12px', background:'#34c759', color:'white', border:'none', borderRadius:'8px', fontWeight:600, cursor:'pointer'}}>Call</button>
                  </div>
                )}
              </div>

              {/* Price & Worker */}
              <div style={{ textAlign:'right', paddingLeft:'15px'}}>
                <div style={{ fontSize:'22px', fontWeight:'700', color:isDone?'#888':'#007aff', marginBottom:'8px'}}>${apt.price.toFixed(2)}</div>
                <div style={{ display:'inline-block', padding:'4px 10px', background:'#007aff20', color:'#007aff', borderRadius:'6px', fontSize:'12px', fontWeight:600, marginBottom:'8px'}}>{apt.worker}</div>
                <div style={{ display:'inline-block', padding:'4px 10px', background:statusStyle.bg, color:statusStyle.color, borderRadius:'6px', fontSize:'11px', fontWeight:600}}>{statusStyle.text}</div>
              </div>
            </div>

            {/* Status Buttons */}
            {onUpdateStatus && status !== 'done' && (
              <div style={{ display:'flex', gap:'8px', marginBottom:'10px', flexWrap:'wrap'}}>
                {status==='pending' && <button onClick={()=>handleStatusChange(apt.id,'confirmed')}>Confirm</button>}
                {status==='confirmed' && <button onClick={()=>handleStatusChange(apt.id,'arrived')}>Mark Arrived</button>}
                {status==='arrived' && <button onClick={()=>handleStatusChange(apt.id,'done')}>Complete</button>}
              </div>
            )}

            {/* Delete */}
            <div style={{ display:'flex', gap:'10px'}}>
              <button onClick={()=>handleDelete(apt.id, apt.service)}>Delete</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}