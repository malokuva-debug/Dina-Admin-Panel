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
  onAdded: () => void; // refresh callback
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
  const [selectedService, setSelectedService] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState<string>('09:00');

  useEffect(() => {
    // filter services by selected category
    if (selectedCategory) {
      const filtered = services.filter(s => s.category === selectedCategory);
      setFilteredServices(filtered);
      if (filtered.length > 0) setSelectedService(filtered[0].id);
      else setSelectedService('');
    } else {
      setFilteredServices([]);
      setSelectedService('');
    }
  }, [selectedCategory, services]);

  const handleAdd = async () => {
    if (!selectedWorker || !selectedService || !date || !time) {
      alert('Please fill all required fields');
      return;
    }

    const service = services.find(s => s.id === selectedService);
    if (!service) {
      alert('Selected service not found');
      return;
    }

    const newAppointment: Appointment = {
      id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`, // simple unique ID
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
        const { error } = await supabase.from('appointments').insert([newAppointment]);
        if (error) throw error;
      } else {
        const allAppointments: Appointment[] = storage.get(STORAGE_KEYS.APPOINTMENTS) || [];
        storage.set(STORAGE_KEYS.APPOINTMENTS, [...allAppointments, newAppointment]);
      }

      onAdded();
      onClose();
    } catch (err) {
      console.error('Failed to add appointment', err);
      alert('Failed to add appointment');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          width: '400px',
          maxWidth: '90%',
        }}
      >
        <h3 style={{ marginBottom: '15px' }}>Add Appointment</h3>

        {/* Worker */}
        <label>
          Worker:
          <select
            value={selectedWorker}
            onChange={e => setSelectedWorker(e.target.value as Worker)}
            style={{ width: '100%', margin: '5px 0 15px', padding: '8px' }}
          >
            {workers.map(w => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </label>

        {/* Category */}
        <label>
          Category:
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            style={{ width: '100%', margin: '5px 0 15px', padding: '8px' }}
          >
            <option value="">Select Category</option>
            {categories.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </label>

        {/* Service */}
        <label>
          Service:
          <select
            value={selectedService}
            onChange={e => setSelectedService(e.target.value)}
            style={{ width: '100%', margin: '5px 0 15px', padding: '8px' }}
          >
            {filteredServices.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} (${s.price})
              </option>
            ))}
          </select>
        </label>

        {/* Customer Name */}
        <label>
          Customer Name:
          <input
            type="text"
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
            style={{ width: '100%', margin: '5px 0 15px', padding: '8px' }}
          />
        </label>

        {/* Customer Phone */}
        <label>
          Customer Phone:
          <input
            type="text"
            value={customerPhone}
            onChange={e => setCustomerPhone(e.target.value)}
            style={{ width: '100%', margin: '5px 0 15px', padding: '8px' }}
          />
        </label>

        {/* Date & Time */}
        <label>
          Date:
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{ width: '100%', margin: '5px 0 15px', padding: '8px' }}
          />
        </label>

        <label>
          Time:
          <input
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            style={{ width: '100%', margin: '5px 0 15px', padding: '8px' }}
          />
        </label>

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: '#ccc',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            style={{
              padding: '10px 20px',
              background: '#34c759',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}