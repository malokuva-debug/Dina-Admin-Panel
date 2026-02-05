'use client';

import { useState, useEffect } from 'react';
import { Worker, Category, Service, Appointment } from '@/types';
import { supabase } from '@/lib/supabase';
import { storage, STORAGE_KEYS, storageMode } from '@/lib/storage';

interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  notes?: string | null;
}

interface AddAppointmentModalProps {
  workers: Worker[];
  categories: Category[];
  services: Service[];
  clients: Client[];
  onClose: () => void;
  onAdded: () => void; // callback to refresh
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
  const [matchedClients, setMatchedClients] = useState<Client[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Lock scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Filter services by category
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

  // Filter clients by name input
  useEffect(() => {
    if (!customerName) {
      setMatchedClients([]);
      return;
    }
    const matches = clients.filter(c =>
      c.name.toLowerCase().includes(customerName.toLowerCase())
    );
    setMatchedClients(matches);
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
        const { error } = await supabase.from('appointments').insert([{
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

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal active" onClick={handleBackdropClick}>
      <div className="modal-content">
        <h3>Add Appointment</h3>

        {/* Worker */}
        <div className="row">
          <span>Worker</span>
          <select value={selectedWorker} onChange={e => setSelectedWorker(e.target.value as Worker)}>
            {workers.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>

        {/* Category */}
        <div className="row">
          <span>Category</span>
          <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
            <option value="">Select Category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Service */}
        <div className="row">
          <span>Service</span>
          <select value={selectedService} onChange={e => setSelectedService(e.target.value)}>
            <option value="">Select Service</option>
            {filteredServices.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} (${s.price})
              </option>
            ))}
          </select>
        </div>

        {/* Customer Name */}
        <div className="row relative">
          <span>Customer Name</span>
          <input
            type="text"
            value={customerName}
            onChange={e => {
              setCustomerName(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
          />
          {showDropdown && matchedClients.length > 0 && (
            <ul className="absolute top-full left-0 right-0 bg-white border max-h-48 overflow-y-auto z-50">
              {matchedClients.map(c => (
                <li
                  key={c.id}
                  className="p-2 cursor-pointer hover:bg-gray-200"
                  onClick={() => handleSelectClient(c)}
                >
                  {c.name} - {c.phone}
                </li>
              ))}
              <li
                className="p-2 cursor-pointer hover:bg-gray-200 font-semibold"
                onClick={() => setShowDropdown(false)}
              >
                Add as new client
              </li>
            </ul>
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
        <div className="flex gap-3 mt-4">
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