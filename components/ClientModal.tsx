'use client';

import { useEffect, useState } from 'react';
import { Client } from '@/app/admin-dashboard/clients/page';

interface ClientModalProps {
  open: boolean;
  client: Client | null;
  onClose: () => void;
  onSave: (client: Client) => void;
}

export default function ClientModal({
  open,
  client,
  onClose,
  onSave,
}: ClientModalProps) {
  const [form, setForm] = useState<Client>({
    id: '',
    name: '',
    phone: '',
    email: null,
    notes: null,
  });

  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  // Update form when editing an existing client
  useEffect(() => {
    if (client) setForm(client);
    else
      setForm({
        id: '',
        name: '',
        phone: '',
        email: null,
        notes: null,
      });
  }, [client]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!open) return null;

  return (
    <div className="modal active" onClick={handleBackdropClick}>
      <div className="modal-content">
        <h3>{client?.id ? 'Edit Client' : 'New Client'}</h3>

        <div className="row">
          <span>Name</span>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div className="row">
          <span>Phone</span>
          <input
            type="text"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
        </div>

        <div className="row">
          <span>Email</span>
          <input
            type="email"
            value={form.email ?? ''}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div className="row">
          <span>Notes</span>
          <textarea
            value={form.notes ?? ''}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        <div className="flex gap-3 mt-4">
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
            type="button"
          >
            Cancel
          </button>
          <button
            style={{
              background: '#4f46e5',
              color: 'white',
              padding: '14px',
              borderRadius: '12px',
              flex: 1,
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
            }}
            onClick={handleSave}
            type="submit"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}