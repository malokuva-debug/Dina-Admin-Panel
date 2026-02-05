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

  useEffect(() => {
    if (client) setForm(client);
  }, [client]);

  if (!open) return null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <form onSubmit={submit} className="bg-white p-6 rounded-xl w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">
          {client?.id ? 'Edit Client' : 'New Client'}
        </h2>

        <input
          className="input"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <input
          className="input"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
        />

        <input
          className="input"
          placeholder="Email"
          value={form.email ?? ''}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <textarea
          className="input"
          placeholder="Notes"
          value={form.notes ?? ''}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />

        <div className="flex justify-end gap-3 mt-4">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="primary" type="submit">
            Save
          </button>
        </div>
      </form>
    </div>
  );
}