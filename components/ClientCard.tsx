//ClientCard.tsx
'use client';

import { useState, useEffect } from 'react';
import { Client } from '@/app/admin-dashboard/clients/page';
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

  const handleImageClick = (imageUrl: string) => {
    setLightboxImage(imageUrl);
    setLightboxOpen(true);
  };

  const handleDelete = () => {
    if (confirm(`Delete client ${client.name}?`)) {
      onDelete(client.id);
    }
  };

  return (
    <>
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
        {/* HEADER */}
        <div
          className="client-header"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            padding: '16px 20px',
            fontWeight: '600',
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
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={idx}
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
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* INFO TABLE */}
          <div className="info-table" style={{ margin: '0 20px' }}>
            <div
              className="info-header"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                textAlign: 'center',
                padding: '12px 0',
                fontWeight: '600',
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
              <div style={{ color: client.email ? '#fff' : '#555' }}>
                {client.email || '—'}
              </div>
              <div>{appointmentCount}</div>
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
                marginTop: '8px',
              }}
            >
              <div style={{ fontWeight: '600', marginBottom: '6px', color: '#888' }}>
                Notes
              </div>
              <div>{client.notes}</div>
            </div>
          )}

          {/* ACTION AREA */}
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
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
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
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
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
          className="lightbox"
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
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