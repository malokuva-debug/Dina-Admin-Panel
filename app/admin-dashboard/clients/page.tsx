'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import ClientsTable from '@/components/ClientsTable';
import ClientModal from '@/components/ClientModal';
import { Worker } from '@/types';
import { storage, STORAGE_KEYS } from '@/lib/storage';

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  notes?: string | null;
  worker?: Worker;
  created_at?: string;
}

export default function ClientsPage() {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const storedWorker = storage.get<Worker>(STORAGE_KEYS.CURRENT_WORKER);
    if (storedWorker) {
      setWorker(storedWorker);
    }
  }, []);

  useEffect(() => {
    if (worker) loadClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [worker]);

  const loadClients = async () => {
    if (!worker) return;

    setLoading(true);

    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('worker', worker)
      .order('created_at', { ascending: false });

    if (data) setClients(data);
    setLoading(false);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email?.toLowerCase().includes(q)
    );
  }, [clients, search]);

  const handleSave = async (client: Client) => {
    if (client.id) {
      await supabase.from('clients').update(client).eq('id', client.id);
    } else {
      await supabase.from('clients').insert({
        ...client,
        worker,
      });
    }

    setModalOpen(false);
    setEditingClient(null);
    loadClients();
  };

  if (!worker) return <div className="p-6">Loading…</div>;

  return (
    <div className="section">
      <div className="section-header">
        <h2>Clients</h2>

        <button
          className="primary"
          onClick={() => {
            setEditingClient({
              id: '',
              name: '',
              phone: '',
            });
            setModalOpen(true);
          }}
        >
          + New Client
        </button>
      </div>

      <input
        className="input"
        placeholder="Search clients…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <ClientsTable
        clients={filtered}
        loading={loading}
        onEdit={(client) => {
          setEditingClient(client);
          setModalOpen(true);
        }}
      />

      <ClientModal
        open={modalOpen}
        client={editingClient}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}