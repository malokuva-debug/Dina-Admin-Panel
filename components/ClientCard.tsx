// ClientCard.tsx
'use client';

import { useState, useEffect } from 'react';
import { Client } from '@/app/clients/page';
import { supabase } from '@/lib/supabase';

interface ClientCardProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (clientId: string) => void;
}

export default function ClientCard({ client, onEdit, onDelete }: ClientCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState('');

  // Load appointment count
  useEffect(() => {
    const fetchAppointments = async () => {
      const { count, error } = await supabase
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .eq('customer_name', client.name);
      if (!error) setAppointmentCount(count ?? 0);
    };
    fetchAppointments();
  }, [client.name]);

  const handleDelete = () => {
    if (confirm(`Delete client ${client.name}?`)) onDelete(client.id);
  };

  const handleImageClick = (url: string) => {
    setLightboxImage(url);
    setLightboxOpen(true);
  };

  const boxStyle = {
    backgroundColor: '#2c2c2e',
    color: '#fff',
    borderRadius: '12px',
    padding: '12px',
    textAlign: 'center' as const,
  };

  return (
    <>
      <div
        className={`client-card ${isOpen ? 'open' : ''}`}
        style={{
          backgroundColor: '#1c1c1e',
          border: '1px solid #3a3a3c',
          borderRadius: '18px',
          overflow: 'hidden',
          marginBottom: '12px',
          width: '100%',
        }}
      >
        {/* HEADER */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{
            padding: '16px 20px',
            fontWeight: 600,
            display: 'flex',
            justifyContent: 'space-between',
            cursor: 'pointer',
            color: '#fff',
            fontSize: '16px',
            alignItems: 'center',
          }}
        >
          <span>{client.name}</span>
          <span
            style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRight: '2px solid #fff',
              borderBottom: '2px solid #fff',
              transform: isOpen ? 'rotate(-135deg)' : 'rotate(45deg)',
              transition: '0.3s',
              marginTop: isOpen ? '4px' : '-4px',
            }}
          />
        </div>

        {/* BODY */}
        <div
          className="client-body"
          style={{
            maxHeight: isOpen ? '1000px' : '0',
            overflow: 'hidden',
            transition: 'max-height 0.35s ease',
          }}
        >
          {/* IMAGES */}
          {client.images && client.images.length > 0 && (
            <div style={{ padding: '14px 20px' }}>
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  overflowX: 'auto',
                  paddingBottom: '8px',
                }}
              >
                {client.images.map((img, idx) => (
                  <div key={idx} style={{ position: 'relative', flexShrink: 0 }}>
                    <img
                      src={img}
                      alt={`Client ${idx + 1}`}
                      onClick={() => handleImageClick(img)}
                      style={{
                        width: '110px',
                        height: '110px',
                        borderRadius: '14px',
                        objectFit: 'cover',
                        cursor: 'pointer',
                        transition: '0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* INFO CARDS */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr',
              gap: '12px',
              padding: '14px 20px',
            }}
          >
            <div style={boxStyle}>
              <div style={{ fontSize: '12px', color: '#888' }}>Phone</div>
              <div>{client.phone}</div>
            </div>
            <div style={boxStyle}>
              <div style={{ fontSize: '12px', color: '#888' }}>Email</div>
              <div>{client.email || '—'}</div>
            </div>
            <div style={boxStyle}>
              <div style={{ fontSize: '12px', color: '#888' }}>Appointments</div>
              <div>{appointmentCount}</div>
            </div>
            <div style={boxStyle}>
              <div style={{ fontSize: '12px', color: '#888' }}>Risk</div>
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: appointmentCount > 3 ? '#ff3b30' : '#34c759',
                  margin: '0 auto',
                }}
              />
            </div>
          </div>

          {/* NOTES */}
          {client.notes && (
            <div
              style={{
                padding: '14px 20px',
                color: '#aaa',
                fontSize: '14px',
                borderTop: '1px solid #2c2c2e',
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: '6px', color: '#888' }}>Notes</div>
              <div>{client.notes}</div>
            </div>
          )}

          {/* ACTION AREA */}
          <div
            style={{
              padding: '14px 20px',
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end',
            }}
          >
            <button
              onClick={handleDelete}
              style={{
                padding: '10px 18px',
                borderRadius: '12px',
                border: 'none',
                background: '#ff3b30',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Delete
            </button>
            <button
              onClick={() => onEdit(client)}
              style={{
                padding: '10px 18px',
                borderRadius: '12px',
                border: 'none',
                background: '#007aff',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Edit
            </button>
          </div>
        </div>
      </div>

      {/* LIGHTBOX */}
      {lightboxOpen && (
        <div
          onClick={() => setLightboxOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
            cursor: 'pointer',
          }}
        >
          <img
            src={lightboxImage}
            alt="Lightbox"
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              borderRadius: '18px',
              objectFit: 'contain',
            }}
          />
        </div>
      )}
    </>
  );
}