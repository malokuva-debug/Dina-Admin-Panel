'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import ClientsList from '@/components/clients/ClientsList';
import ClientModal from '@/components/clients/ClientModal';
import SearchBar from '@/components/SearchBar';
import { Worker } from '@/types';

export interface Client {
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
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  useEffect(() => {
    loadClients();
  }, [worker]);

  const loadClients = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('worker', worker)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setClients(data as Client[]);
    }

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

  return (
    <div className="section">
      <div className="section-header">
        <h2>Clients</h2>
        <button
          className="primary"
          onClick={() => {
            setEditingClient(null);
            setModalOpen(true);
          }}
        >
          + New Client
        </button>
      </div>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search by name, phone or email"
      />

      <ClientsList
        clients={filtered}
        loading={loading}
        onEdit={(c: Client) => {
          setEditingClient(c);
          setModalOpen(true);
        }}
      />

      {modalOpen && (
        <ClientModal
          client={editingClient}
          worker={worker}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            loadClients();
          }}
        />
      )}
    </div>
  );
}