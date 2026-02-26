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

  useEffect(() => {
    const fetchAppointmentCount = async () => {
      const { count, error } = await supabase
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .eq('customer_name', client.name);
      if (!error) setAppointmentCount(count ?? 0);
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
          {/* Info Rows (like HTML/CSS grid) */}
          <div
            className="info-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr',
              textAlign: 'center',
              padding: '12px 20px',
              gap: '6px',
              borderBottom: '1px solid #2c2c2e',
              color: '#888',
              fontWeight: 600,
              fontSize: '13px',
            }}
          >
            <div>Name</div>
            <div>Appointments</div>
            <div>Visits</div>
            <div>Images</div>
            <div>Cancel</div>
            <div>Risk</div>
            <div>Phone</div>
            <div>Number</div>
          </div>

          <div
            className="info-grid-values"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr',
              textAlign: 'center',
              padding: '12px 20px',
              gap: '6px',
              color: '#fff',
              fontSize: '14px',
              alignItems: 'center',
            }}
          >
            <div>{client.name}</div>
            <div>{appointmentCount}</div>
            <div>{client.notes ? 1 : 0}</div>
            <div>{client.images?.length || 0}</div>
            <div>—</div>
            <div>—</div>
            <div>{client.phone}</div>
            <div>{client.email || '—'}</div>
          </div>

          {/* Images Section */}
          {client.images && client.images.length > 0 && (
            <div className="image-section" style={{ padding: '12px 20px', marginTop: '10px' }}>
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  overflowX: 'auto',
                  paddingBottom: '8px',
                }}
              >
                {client.images.map((img, idx) => (
                  <div
                    key={idx}
                    style={{ position: 'relative', flexShrink: 0, minWidth: '90px' }}
                  >
                    <img
                      src={img}
                      alt={`Client ${idx + 1}`}
                      onClick={() => handleImageClick(img)}
                      style={{
                        width: '90px',
                        height: '90px',
                        objectFit: 'cover',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        border: '2px solid #3a3a3c',
                        transition: '0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                    {/* Remove Button fully visible */}
                    <button
                      onClick={() => {
                        if (!confirm('Remove this image?')) return;
                        client.images = client.images?.filter((_, i) => i !== idx);
                      }}
                      style={{
                        position: 'absolute',
                        top: '2px', // fix top cut
                        right: '2px',
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

          {/* Action Buttons */}
          <div
            style={{
              padding: '14px 20px',
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end',
              marginTop: '10px',
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