'use client';

import { Client } from '@/app/admin-dashboard/clients/page';
import ClientCard from './ClientCard';

interface ClientCardsListProps {
  clients: Client[];
  loading: boolean;
  onEdit: (client: Client) => void;
  onDelete: (clientId: string) => void;
}

export default function ClientCardsList({
  clients,
  loading,
  onEdit,
  onDelete,
}: ClientCardsListProps) {
  if (loading) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#888',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid #2c2c2e',
            borderTop: '3px solid #007aff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 15px',
          }}
        />
        <p>Loading clients…</p>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!clients.length) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '80px 20px',
          color: '#888',
        }}
      >
        <svg
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          style={{
            margin: '0 auto 20px',
            opacity: 0.4,
          }}
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
        <p style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
          No clients yet
        </p>
        <p style={{ fontSize: '14px', color: '#666' }}>
          Click &ldquo;+ New Client&rdquo; to add your first client
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gap: '12px',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        padding: '10px 0',
      }}
    >
      {[...clients]
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((client) => (
    <ClientCard
      key={client.id}
      client={client}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  ))}
    </div>
  );
}