'use client';

import { useState, useEffect } from 'react';
import { Worker, ServiceCategory, Service, Appointment } from '@/types';
import { supabase } from '@/lib/supabase';
import { storage, STORAGE_KEYS, storageMode } from '@/lib/storage';

interface AddAppointmentModalProps {
  workers: Worker[];
  categories: ServiceCategory[];
  services: Service[];
  onClose: () => void;
  onAdded: () => void;
}

export default function AddAppointmentModal({
  workers,
  categories,
  services,
  onClose,
  onAdded
}: AddAppointmentModalProps) {
  const [selectedWorker, setSelectedWorker] = useState<string>(workers[0] || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]?.id || '');
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('12:00');

  // Filter services when category changes
  useEffect(() => {
    const filtered = services.filter(s => s.categoryId === selectedCategory);
    setFilteredServices(filtered);
    setSelectedService(filtered[0]?.id || '');
  }, [selectedCategory, services]);

  const handleSave = async () => {
    if (!selectedWorker || !selectedService || !date || !time) {
      alert('Please fill in all required fields');
      return;
    }

    // Find service details
    const serviceObj = services.find(s => s.id === selectedService);
    if (!serviceObj) {
      alert('Invalid service selected');
      return;
    }

    // Generate simple unique ID
    const id = Date.now().toString() + Math.floor(Math.random() * 1000);

    const newAppointment: Appointment = {
      id,
      worker: selectedWorker,
      service: serviceObj.name,
      category: categories.find(c => c.id === selectedCategory)?.name || '',
      price: serviceObj.price,
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

      onAdded(); // refresh list
      onClose();  // close modal
    } catch (error) {
      console.error('Error adding appointment:', error);
      alert('Failed to add appointment');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Add Appointment</h3>

        <label>
          Worker
          <select value={selectedWorker} onChange={e => setSelectedWorker(e.target.value)}>
            {workers.map(w => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </label>

        <label>
          Category
          <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>

        <label>
          Service
          <select value={selectedService} onChange={e => setSelectedService(e.target.value)}>
            {filteredServices.map(s => (
              <option key={s.id} value={s.id}>{s.name} (${s.price.toFixed(2)})</option>
            ))}
          </select>
        </label>

        <label>
          Customer Name
          <input value={customerName} onChange={e => setCustomerName(e.target.value)} />
        </label>

        <label>
          Customer Phone
          <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
        </label>

        <label>
          Date
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </label>

        <label>
          Time
          <input type="time" value={time} onChange={e => setTime(e.target.value)} />
        </label>

        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <button onClick={handleSave} style={{ flex: 1 }}>Save</button>
          <button onClick={onClose} style={{ flex: 1, background: '#ff3b30', color: 'white' }}>Cancel</button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex; justify-content: center; align-items: center;
          z-index: 9999;
        }
        .modal-card {
          background: #1c1c1e;
          padding: 20px;
          border-radius: 12px;
          width: 400px;
          max-width: 90%;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        label {
          display: flex;
          flex-direction: column;
          font-size: 14px;
        }
        input, select {
          margin-top: 4px;
          padding: 8px;
          border-radius: 6px;
          border: 1px solid #555;
          background: #2c2c2e;
          color: white;
        }
        button {
          padding: 10px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          background: #007aff;
          color: white;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}