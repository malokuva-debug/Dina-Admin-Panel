'use client';

import { useState, useEffect } from 'react';
import { Worker, Category, Service, Appointment, Client } from '@/types';
import { supabase } from '@/lib/supabase';
import { storage, STORAGE_KEYS, storageMode } from '@/lib/storage';

interface AddAppointmentModalProps {
  workers: Worker[];
  categories: Category[];
  services: Service[];
  clients: Client[]; // pass existing clients here
  onClose: () => void;
  onAdded: () => void;
}

export default function AddAppointmentModal({
  workers,
  categories,
  services,
  clients,
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

  const [suggestions, setSuggestions] = useState<Client[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Filter services when category changes
  useEffect(() => {
    if (!selectedCategory) {
      setFilteredServices([]);
      setSelectedService('');
      return;
    }
    const filtered = services.filter(s => s.category_id === selectedCategory);
    setFilteredServices(filtered);
    setSelectedService(filtered[0]?.id ?? '');
  }, [selectedCategory, services]);

  // Filter client suggestions when typing
  useEffect(() => {
    if (!customerName) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const filtered = clients.filter(c =>
      c.name.toLowerCase().includes(customerName.toLowerCase())
    );
    setSuggestions(filtered);
    setShowDropdown(true);
  }, [customerName, clients]);

  const handleSelectClient = (client: Client) => {
    setCustomerName(client.name);
    setCustomerPhone(client.phone);
    setShowDropdown(false);
  };

  const handleAdd = async () => {
    if (!selectedWorker || !selectedService || !date || !time || !customerName) {
      alert('Please fill all required fields');
      return;
    }

    const service = services.find(s => s.id === selectedService);
    if (!service) {
      alert('Selected service not found');
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
      customer_name: customerName,
      customer_phone: customerPhone,
      is_done: false,
      status: 'pending',
    };

    try {
      if (storageMode === 'supabase') {
        const { error } = await supabase
          .from('appointments')
          .insert([{
            worker: newAppointment.worker,
            service: newAppointment.service,
            date: newAppointment.date,
            time: newAppointment.time,
            price: newAppointment.price,
            duration: newAppointment.duration,
            customer_name: newAppointment.customer_name,
            customer_phone: newAppointment.customer_phone,
            is_done: newAppointment.is_done,
            status: newAppointment.status,
          }]);
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
            {workers.map(w => <option key={w} value={w}>{w}</option>)}
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
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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

        {/* Customer Name with autocomplete */}
        <div className="row" style={{ position: 'relative' }}>
          <span>Customer Name</span>
          <input
            type="text"
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
            onFocus={() => customerName && setShowDropdown(true)}
            autoComplete="off"
          />
          {showDropdown && suggestions.length > 0 && (
            <div
              className="absolute bg-white border w-full max-h-40 overflow-auto mt-1 z-50"
              style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
            >
              {suggestions.map(s => (
                <div
                  key={s.id}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelectClient(s)}
                >
                  {s.name} ({s.phone})
                </div>
              ))}
              <div
                className="p-2 hover:bg-gray-100 cursor-pointer font-semibold"
                onClick={() => setShowDropdown(false)}
              >
                Add "{customerName}" as new client
              </div>
            </div>
          )}
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