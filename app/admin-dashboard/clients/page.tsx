'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Worker } from '@/types';

interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  notes?: string | null;
  worker?: Worker | null;
  created_at?: string;
}

interface ClientsPageProps {
  worker: Worker;
}

export default function ClientsPage({ worker }: ClientsPageProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  useEffect(() => {
    loadClients();
  }, [worker]);

  const loadClients = async () => {
    setLoading(true);

    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('worker', worker)
      .order('created_at', { ascending: false });

    setClients((data ?? []) as Client[]);
    setLoading(false);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.email?.toLowerCase().includes(q) ?? false)
    );
  }, [clients, search]);

  const saveClient = async () => {
    if (!editingClient) return;

    if (editingClient.id) {
      await supabase
        .from('clients')
        .update(editingClient)
        .eq('id', editingClient.id);
    } else {
      await supabase.from('clients').insert({
        ...editingClient,
        worker,
      });
    }

    setModalOpen(false);
    setEditingClient(null);
    loadClients();
  };

  return (
    <div className="section">
      <div className="section-header">
        <h2>Clients</h2>
        <button
          className="primary"
          onClick={() => {
            setEditingClient({ id: '', name: '', phone: '' });
            setModalOpen(true);
          }}
        >
          + New Client
        </button>
      </div>

      <input
        className="input"
        placeholder="Search clients..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading && <p>Loading…</p>}

      {!loading && (
        <ul className="list">
          {filtered.map((c) => (
            <li key={c.id} className="list-item">
              <div>
                <strong>{c.name}</strong>
                <div>{c.phone}</div>
                {c.email && <div>{c.email}</div>}
              </div>
              <button
                onClick={() => {
                  setEditingClient(c);
                  setModalOpen(true);
                }}
              >
                Edit
              </button>
            </li>
          ))}
        </ul>
      )}

      {modalOpen && editingClient && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editingClient.id ? 'Edit Client' : 'New Client'}</h3>

            <input
              className="input"
              placeholder="Name"
              value={editingClient.name}
              onChange={(e) =>
                setEditingClient({ ...editingClient, name: e.target.value })
              }
            />

            <input
              className="input"
              placeholder="Phone"
              value={editingClient.phone}
              onChange={(e) =>
                setEditingClient({ ...editingClient, phone: e.target.value })
              }
            />

            <input
              className="input"
              placeholder="Email"
              value={editingClient.email ?? ''}
              onChange={(e) =>
                setEditingClient({ ...editingClient, email: e.target.value })
              }
            />

            <div className="modal-actions">
              <button onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="primary" onClick={saveClient}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}