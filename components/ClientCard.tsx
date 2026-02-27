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
      if (!client.name) return;
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
    if (confirm(`Delete client ${client.name ?? 'this client'}?`)) {
      onDelete(client.id);
    }
  };

  const hasImages = client.images && client.images.length > 0;

  return (
    <>
      <div
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
            userSelect: 'none',
          }}
        >
          <span>{client.name || 'Unnamed Client'}</span>
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
          style={{
            maxHeight: isOpen ? '1000px' : '0',
            overflow: 'hidden',
            transition: 'max-height 0.35s ease',
          }}
        >
          {/* IMAGES */}
          {hasImages && (
            <div style={{ padding: '14px 20px' }}>
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  overflowX: 'auto',
                  paddingBottom: '8px',
                }}
              >
                {client.images!.map((img, idx) => (
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

          {/* INFO CARDS */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              padding: '14px 20px',
              borderTop: '1px solid #2c2c2e',
            }}
          >
            {/* Phone */}
            <InfoBox label="Phone">
              <span style={{ color: client.phone ? '#fff' : '#555558', fontSize: '14px', fontWeight: '600' }}>
                {client.phone || '—'}
              </span>
            </InfoBox>

            {/* Frequent Service */}
            <InfoBox label="Frequent Service">
              <span style={{ color: client.frequent_service ? '#fff' : '#555558', fontSize: '14px', fontWeight: '600' }}>
                {client.frequent_service || '—'}
              </span>
            </InfoBox>

            {/* Visits */}
            <InfoBox label="Visits">
              <span style={{ fontSize: '22px', fontWeight: '600', color: '#fff' }}>
                {client.visits ?? 0}
              </span>
              {(client.visits ?? 0) > 0 && (client.visits ?? 0) % 5 === 0 && (
                <span
                  style={{
                    background: 'rgba(255, 204, 0, 0.15)',
                    color: '#ffd60a',
                    padding: '3px 8px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: '600',
                    border: '1px solid rgba(255, 204, 0, 0.25)',
                  }}
                >
                  50% OFF
                </span>
              )}
            </InfoBox>

            {/* Appointments */}
            <InfoBox label="Appointments">
              <span style={{ fontSize: '22px', fontWeight: '600', color: '#fff' }}>
                {appointmentCount}
              </span>
            </InfoBox>

            {/* Cancellation Risk */}
            <InfoBox label="Cancellation Risk">
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: client.frequent_canceller ? 'rgb(255, 59, 48)' : 'rgb(0, 122, 255)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {client.frequent_canceller ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <path d="M6 6l12 12M6 18L18 6" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </InfoBox>
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
              <div style={{ fontWeight: '600', marginBottom: '6px', color: '#8e8e93' }}>
                Notes
              </div>
              <div>{client.notes}</div>
            </div>
          )}

          {/* ACTIONS */}
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
                background: 'rgb(255, 59, 48)',
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
                background: 'rgb(0, 122, 255)',
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

/* ── Reusable info box ── */
function InfoBox({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: '#2c2c2e',
        borderRadius: '14px',
        padding: '14px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
      }}
    >
      <div style={{ fontSize: '12px', color: '#8e8e93' }}>{label}</div>
      {children}
    </div>
  );
}