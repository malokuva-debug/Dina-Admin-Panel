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

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Load all clients on mount
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load clients:', error);
    } else if (data) {
      setClients(data);
    }

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
      // Update existing client
      const { error } = await supabase
        .from('clients')
        .update({
          name: client.name,
          phone: client.phone,
          email: client.email ?? null,
          notes: client.notes ?? null,
        })
        .eq('id', client.id);

      if (error) {
        console.error('Failed to update client:', error);
        return;
      }
    } else {
      // Insert new client
      const { data, error } = await supabase
        .from('clients')
        .insert([
          {
            name: client.name,
            phone: client.phone,
            email: client.email ?? null,
            notes: client.notes ?? null,
          },
        ])
        .select(); // get inserted row

      if (error) {
        console.error('Failed to insert client:', error);
        return;
      }

      client.id = data![0].id; // assign new id
    }

    setModalOpen(false);
    setEditingClient(null);
    loadClients(); // refresh table
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