'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import ClientCardsList from '@/components/ClientCardsList';
import ClientModal from '@/components/ClientModal';
import { Worker } from '@/types';

export interface Client {
  id: string;
  name: string;
  phone?: string | null;
  notes?: string | null;
  images?: string[];
  worker?: Worker;
  created_at?: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

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
        (c.phone ?? '').includes(q)
    );
  }, [clients, search]);

  const handleSave = async (client: Client) => {
    if (client.id) {
      const { error } = await supabase
        .from('clients')
        .update({
          name: client.name,
          phone: client.phone?.trim() || null,
          notes: client.notes ?? null,
          images: client.images ?? [],
        })
        .eq('id', client.id);

      if (error) {
        console.error('Failed to update client:', error);
        alert('Failed to update client');
        return;
      }
    } else {
      const { data, error } = await supabase
        .from('clients')
        .insert([
          {
            name: client.name,
            phone: client.phone?.trim() || null,
            notes: client.notes ?? null,
            images: client.images ?? [],
          },
        ])
        .select();

      if (error) {
        console.error('Failed to insert client:', error);
        alert('Failed to create client');
        return;
      }
      if (data && data.length > 0) {
        client.id = data[0].id;
      }
    }

    setModalOpen(false);
    setEditingClient(null);
    loadClients();
  };

  const handleDelete = async (clientId: string) => {
    const { error } = await supabase.from('clients').delete().eq('id', clientId);

    if (error) {
      console.error('Failed to delete client:', error);
      alert('Failed to delete client');
      return;
    }

    setClients((prev) => prev.filter((c) => c.id !== clientId));
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f9fafb',
        padding: '20px',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '30px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <h2
            style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#111',
              margin: 0,
            }}
          >
            Clients
          </h2>
          <button
            onClick={() => {
              setEditingClient({
                id: '',
                name: '',
                phone: '',
                notes: null,
                images: [],
              });
              setModalOpen(true);
            }}
            style={{
              padding: '12px 24px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ fontSize: '18px' }}>+</span>
            New Client
          </button>
        </div>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search clients by name or phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '14px 18px',
            fontSize: '15px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            backgroundColor: 'white',
            color: '#111',
            marginBottom: '20px',
            outline: 'none',
          }}
        />

        {/* Client Cards */}
        <ClientCardsList
          clients={filtered}
          loading={loading}
          onEdit={(client) => {
            setEditingClient(client);
            setModalOpen(true);
          }}
          onDelete={handleDelete}
        />

        {/* Modal */}
        <ClientModal
          open={modalOpen}
          client={editingClient}
          onClose={() => {
            setModalOpen(false);
            setEditingClient(null);
          }}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}