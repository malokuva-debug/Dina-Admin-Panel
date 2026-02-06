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
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('09:00');
  const [matchedClients, setMatchedClients] = useState<Client[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

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
    if (!customerName.trim()) {
      setMatchedClients([]);
      return;
    }

    const matches = clients.filter(c =>
      c.name.toLowerCase().includes(customerName.toLowerCase())
    );

    setMatchedClients(matches);
  }, [customerName, clients]);

  const exactMatchExists = clients.some(
    c => c.name.toLowerCase() === customerName.toLowerCase()
  );

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
    if (!service) return;

    const newAppointment: Omit<Appointment, 'id'> = {
      worker: selectedWorker,
      service: service.name,
      price: service.price,
      duration: service.duration,
      date,
      time,
      customer_name: customerName,
      customer_phone: customerPhone,
      status: 'pending',
    };

    try {
      const { error } = await supabase.from('appointments').insert([newAppointment]);
      if (error) throw error;

      onAdded();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to add appointment');
    }
  };

  return (
    <div className="modal active">
      <div className="modal-content">
        <h3>Add Appointment</h3>

        {/* Customer Name */}
        <div className="row relative">
          <span>Customer Name</span>
          <input
            value={customerName}
            onChange={e => {
              setCustomerName(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
          />

          {showDropdown && customerName && (
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

        {/* Phone */}
        <div className="row">
          <span>Phone</span>
          <input
            value={customerPhone}
            onChange={e => setCustomerPhone(e.target.value)}
          />
        </div>

        <button className="btn-primary" onClick={handleAdd}>
          Add Appointment
        </button>
      </div>
    </div>
  );
}