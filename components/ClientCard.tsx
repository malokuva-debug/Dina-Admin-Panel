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

  // Fetch appointment count for this client
  useEffect(() => {
    const fetchAppointmentCount = async () => {
      const { count, error } = await supabase
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .eq('customer_name', client.name);

      if (!error) {
        setAppointmentCount(count ?? 0);
      }
    };
    fetchAppointmentCount();
  }, [client.name]);

  const handleDelete = () => {
    if (confirm(`Delete client ${client.name}?`)) onDelete(client.id);
  };

  const handleImageClick = (url: string) => {
    setLightboxImage(url);
    setLightboxOpen(true);
  };

  return (
    <>
      {/* Client Card */}
      <div
        className={`client-card ${isOpen ? 'open' : ''}`}
        style={{
          width: '100%',
          border: '1px solid #3a3a3c',
          borderRadius: '18px',
          overflow: 'hidden',
          backgroundColor: '#1c1c1e',
          marginBottom: '12px',
        }}
      >
        {/* Header */}
        <div
          className="client-header"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            padding: '16px 20px',
            fontWeight: 600,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            color: '#fff',
            fontSize: '16px',
          }}
        >
          <span>{client.name}</span>
          <span
            className="chevron"
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

        {/* Body */}
        <div
          className="client-body"
          style={{
            maxHeight: isOpen ? '1000px' : '0',
            overflow: 'hidden',
            transition: 'max-height 0.35s ease',
          }}
        >
          {/* Images */}
          {client.images && client.images.length > 0 && (
            <div className="image-section" style={{ padding: '14px 20px' }}>
              <div
                className="image-grid"
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
                        objectFit: 'cover',
                        borderRadius: '14px',
                        cursor: 'pointer',
                        transition: '0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                    {/* Remove button on hover */}
                    <button
                      onClick={() => {
                        const confirmed = confirm('Remove this image?');
                        if (!confirmed) return;
                        client.images = client.images?.filter((_, i) => i !== idx);
                      }}
                      style={{
                        position: 'absolute',
                        top: '-6px',
                        right: '-6px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: '#ff3b30',
                        color: '#fff',
                        border: 'none',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 0,
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Table */}
          <div className="info-table" style={{ margin: '0 20px' }}>
            <div
              className="info-header"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                textAlign: 'center',
                padding: '12px 0',
                fontWeight: 600,
                fontSize: '13px',
                color: '#888',
                borderTop: '1px solid #2c2c2e',
                borderBottom: '1px solid #2c2c2e',
              }}
            >
              <div>Phone</div>
              <div>Email</div>
              <div>Appointments</div>
            </div>
            <div
              className="info-row"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                textAlign: 'center',
                padding: '12px 0',
                color: '#fff',
                fontSize: '14px',
              }}
            >
              <div>{client.phone}</div>
              <div style={{ color: client.email ? '#fff' : '#555' }}>{client.email || '—'}</div>
              <div>{appointmentCount}</div>
            </div>
          </div>

          {/* Notes */}
          {client.notes && (
            <div
              style={{
                padding: '14px 20px',
                color: '#aaa',
                fontSize: '14px',
                borderTop: '1px solid #2c2c2e',
                marginTop: '8px',
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: '6px', color: '#888' }}>Notes</div>
              <div>{client.notes}</div>
            </div>
          )}

          {/* Action Buttons */}
          <div
            className="action-area"
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

      {/* Lightbox */}
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