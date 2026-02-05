'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface Client {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
}

interface ClientModalProps {
  client: Client | null;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function ClientModal({
  client,
  open,
  onClose,
  onSave,
}: ClientModalProps) {
  const [form, setForm] = useState<Client>({
    name: '',
    phone: '',
    email: '',
    notes: '',
  });

  useEffect(() => {
    if (client) {
      setForm({
        name: client.name ?? '',
        phone: client.phone ?? '',
        email: client.email ?? '',
        notes: client.notes ?? '',
      });
    }
  }, [client]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (client?.id) {
      await supabase.from('clients').update(form).eq('id', client.id);
    } else {
      await supabase.from('clients').insert(form);
    }

    onSave();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl w-full max-w-md"
      >
        <h2 className="text-lg font-semibold mb-4">
          {client ? 'Edit Client' : 'Add Client'}
        </h2>

        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <input
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
        />

        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <textarea
          placeholder="Notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />

        <div className="flex gap-3 mt-4 justify-end">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary">
            Save
          </button>
        </div>
      </form>
    </div>
  );
}