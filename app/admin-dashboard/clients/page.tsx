'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import ClientsTable from '@/components/ClientsTable';
import ClientModal from '@/components/ClientModal';
import { Worker } from '@/types';

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  notes?: string | null;
  worker?: Worker;
  created_at?: string;
}

interface ClientsPageProps {
  worker: Worker;
}

export default function ClientsPage({ worker }: ClientsPageProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

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

  const handleSave = async (client: Client) => {
    if (client.id) {
      await supabase.from('clients').update(client).eq('id', client.id);
    } else {
      await supabase.from('clients').insert({ ...client, worker });
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
        placeholder="Search clients…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <ClientsList
        clients={filtered}
        loading={loading}
        onEdit={(c: Client) => {
          setEditingClient(c);
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