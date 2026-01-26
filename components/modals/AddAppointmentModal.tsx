'use client';

import { useState, useEffect } from 'react';
import { Worker, Category, Service, Appointment } from '@/types';
import { supabase } from '@/lib/supabase';
import { storage, STORAGE_KEYS, storageMode } from '@/lib/storage';

interface AddAppointmentModalProps {
  workers: Worker[];
  categories: Category[];
  services: Service[];
  onClose: () => void;
  onAdded: () => void; // callback to refresh
}

export default function AddAppointmentModal({
  workers,
  categories,
  services,
  onClose,
  onAdded,
}: AddAppointmentModalProps) {
  const [selectedWorker, setSelectedWorker] = useState<Worker>('dina');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('09:00');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

 useEffect(() => {
  console.log('Selected category id:', selectedCategory);
  console.log(
    'Service category_ids:',
    services.map(s => s.category_id)
  );

  if (!selectedCategory) {
    setFilteredServices([]);
    setSelectedService('');
    return;
  }

  const filtered = services.filter(
    s => s.category_id === selectedCategory
  );

  console.log('Filtered services:', filtered);

  setFilteredServices(filtered);
  setSelectedService(filtered[0]?.id ?? '');
}, [selectedCategory, services]);

    const handleAdd = async () => {
  if (!selectedWorker || !selectedService || !date || !time) {
    alert('Please fill all required fields');
    return;
  }

  const service = services.find(s => s.id === selectedService);
  if (!service) {
    alert('Service not found');
    return;
  }

  const newAppointment: Appointment = {
    id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    worker: selectedWorker,
    service: service.name,
    price: service.price,
    duration: service.duration,
    date,
    time,
    customerName,
    customerPhone,
    is_done: false,
  };

  try {
    if (storageMode === 'supabase') {
      const { error } = await supabase
        .from('appointments')
        .insert([newAppointment]);

      if (error) throw error;
    } else {
      const allAppointments: Appointment[] =
        storage.get(STORAGE_KEYS.APPOINTMENTS) || [];

      storage.set(STORAGE_KEYS.APPOINTMENTS, [
        ...allAppointments,
        newAppointment,
      ]);
    }

    onAdded();
    onClose();
  } catch (err) {
    console.error('Failed to add appointment', err);
    alert('Failed to add appointment');
  }
};

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal active" onClick={handleBackdropClick}>
      <div className="modal-content">
        <h3>Add Appointment</h3>

        {/* Worker Dropdown */}
        <div className="row">
          <span>Worker</span>
          <select value={selectedWorker} onChange={e => setSelectedWorker(e.target.value as Worker)}>
            {workers.map(w => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>

        {/* Category Dropdown */}
<div className="row">
  <span>Category</span>
  <select
  value={selectedCategory}
  onChange={e => setSelectedCategory(e.target.value)}
>
  <option value="">Select Category</option>
  {categories.map(c => (
    <option key={c.id} value={c.id}>
      {c.name}
    </option>
  ))}
</select>
</div>

{/* Service Dropdown */}
<div className="row">
  <span>Service</span>
  <select
  value={selectedService}
  onChange={e => setSelectedService(e.target.value)}
>
  <option value="">Select Service</option>
  {filteredServices.map(s => (
    <option key={s.id} value={s.id}>
      {s.name} (${s.price})
    </option>
  ))}
</select>
</div>

        {/* Customer Name */}
        <div className="row">
          <span>Customer Name</span>
          <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} />
        </div>

        {/* Customer Phone */}
        <div className="row">
          <span>Phone</span>
          <input type="text" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
        </div>

        {/* Date & Time */}
        <div className="row">
          <span>Date</span>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div className="row">
          <span>Time</span>
          <input type="time" value={time} onChange={e => setTime(e.target.value)} />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button className="btn-primary" onClick={handleAdd}>Add</button>
          <button
            style={{
              background: '#3a3a3c',
              color: 'white',
              padding: '14px',
              borderRadius: '12px',
              flex: 1,
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
            }}
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
