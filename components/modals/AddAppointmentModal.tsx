'use client';

import { useState, useEffect } from 'react';
import { Worker, Category, Service, Appointment } from '@/types';
import { supabase } from '@/lib/supabase';

interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
}

interface AddAppointmentModalProps {
  workers: Worker[];
  categories: Category[];
  services: Service[];
  clients: Client[];
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
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState('');
  const [customer_name, setCustomerName] = useState(''); // renamed
  const [customer_phone, setCustomerPhone] = useState(''); // renamed
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('09:00');
  const [matchedClients, setMatchedClients] = useState<Client[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

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

  useEffect(() => {
    if (!customer_name.trim()) {
      setMatchedClients([]);
      return;
    }
    const matches = clients.filter(c =>
      c.name.toLowerCase().includes(customer_name.toLowerCase())
    );
    setMatchedClients(matches);
  }, [customer_name, clients]);

  const exactMatchExists = clients.some(
    c => c.name.toLowerCase() === customer_name.toLowerCase()
  );

  const handleSelectClient = (client: Client) => {
    setCustomerName(client.name);
    setCustomerPhone(client.phone);
    setShowDropdown(false);
  };

  function mapAppointmentToDb(appointment: Appointment) {
    return {
      time: appointment.time,
      date: appointment.date,
      worker: appointment.worker,
      service: appointment.service,
      price: appointment.price,
      duration: appointment.duration,
      customer_name: appointment.customer_name, // use renamed
      customer_phone: appointment.customer_phone, // use renamed
      is_done: appointment.is_done ?? false,
    };
  }

  const handleAdd = async () => {
  // Check all required fields
  if (!selectedWorker || !selectedService || !date || !time || !customer_name || !customer_phone) {
    alert('Please fill all required fields, including phone number');
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
    customer_name,
    customer_phone,
    is_done: false,
  };

  try {
    // 1️⃣ Insert the appointment
    const { error: appointmentError } = await supabase
      .from('appointments')
      .insert([mapAppointmentToDb(newAppointment)]);
    if (appointmentError) throw appointmentError;

    // 2️⃣ Check if client exists
    const { data: existingClients } = await supabase
      .from('clients')
      .select('id')
      .eq('name', customer_name)
      .eq('phone', customer_phone);

    if (!existingClients?.length) {
      // 3️⃣ Insert new client if not exists
      const { error: clientError } = await supabase
        .from('clients')
        .insert([{ name: customer_name, phone: customer_phone }]);
      if (clientError) throw clientError;
    }

    onAdded();
    onClose();
  } catch (err) {
    console.error('Failed to add appointment or client', err);
    alert('Failed to add appointment or client');
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
          <select
            value={selectedWorker}
            onChange={e => setSelectedWorker(e.target.value as Worker)}
          >
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
              <option key={c.id} value={c.id}>{c.name}</option>
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
        <div className="row relative">
          <span>Customer Name</span>
          <input
            type="text"
            value={customer_name}
            onChange={e => {
              setCustomerName(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
          />
          {showDropdown && customer_name && (
            <ul
              className="absolute top-full left-0 right-0 z-50 max-h-48 overflow-y-auto"
              style={{
                background: '#3a3a3c',
                borderRadius: '8px',
                border: '1px solid #555',
              }}
            >
              {matchedClients.map(c => (
                <li
                  key={c.id}
                  onClick={() => handleSelectClient(c)}
                  style={{
                    padding: '10px',
                    cursor: 'pointer',
                    color: 'white',
                  }}
                  onMouseEnter={e =>
                    (e.currentTarget.style.background = '#4a4a4c')
                  }
                  onMouseLeave={e =>
                    (e.currentTarget.style.background = 'transparent')
                  }
                >
                  {c.name} – {c.phone}
                </li>
              ))}
              {!exactMatchExists && (
                <li
                  onClick={() => setShowDropdown(false)}
                  style={{
                    padding: '10px',
                    cursor: 'pointer',
                    background: '#2f2f31',
                    color: 'white',
                    fontWeight: 600,
                  }}
                >
                  ➕ Add as new client
                </li>
              )}
            </ul>
          )}
        </div>

        {/* Customer Phone */}
        <div className="row">
          <span>Phone</span>
          <input
            type="text"
            value={customer_phone}
            onChange={e => setCustomerPhone(e.target.value)}
          />
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