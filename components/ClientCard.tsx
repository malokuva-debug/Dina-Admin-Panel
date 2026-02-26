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
  const [lightboxIndex, setLightboxIndex] = useState(0);

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

  const handleImageClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleDelete = () => {
    if (confirm(`Delete client ${client.name}?`)) {
      onDelete(client.id);
    }
  };

  const formatPhone = (phone?: string | null) => {
  if (!phone) return '—'; // show dash if no phone

  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  return phone;
};

  const nextImage = () => {
    if (client.images && client.images.length > 0) {
      setLightboxIndex((prev) => (prev + 1) % client.images!.length);
    }
  };

  const prevImage = () => {
    if (client.images && client.images.length > 0) {
      setLightboxIndex((prev) => (prev - 1 + client.images!.length) % client.images!.length);
    }
  };

  return (
    <>
      <div
        style={{
          border: '1px solid #3a3a3c',
          borderRadius: '18px',
          background: '#1c1c1e',
          overflow: 'hidden',
          fontFamily: 'system-ui',
          width: '100%',
          maxWidth: '500px',
        }}
      >
        {/* HEADER */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{
            padding: '16px',
            fontWeight: '600',
            display: 'flex',
            justifyContent: 'space-between',
            cursor: 'pointer',
            alignItems: 'center',
            color: '#fff',
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
          style={{
            maxHeight: isOpen ? '2000px' : '0',
            overflow: 'hidden',
            transition: 'max-height 0.3s ease',
          }}
        >
          {/* IMAGE GRID */}
          {client.images && client.images.length > 0 && (
            <div style={{ padding: '16px', overflow: 'hidden' }}>
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  overflowX: 'auto',
                  scrollBehavior: 'smooth',
                }}
              >
                {client.images.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleImageClick(idx)}
                    style={{
                      position: 'relative',
                      flex: '0 0 auto',
                      width: '110px',
                      height: '110px',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      boxShadow: '0 6px 14px rgba(0,0,0,0.3)',
                      transition: 'transform 0.25s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={`Client ${idx + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
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
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              padding: '14px',
            }}
          >
            {/* Name Card */}
            <div
              style={{
                background: '#2c2c2e',
                borderRadius: '14px',
                padding: '14px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <div style={{ fontSize: '12px', color: '#888' }}>Name</div>
              <div style={{ fontWeight: '600', color: '#fff' }}>{client.name}</div>
            </div>

            {/* Phone Card with Call Button */}
            <div
              style={{
                background: '#2c2c2e',
                borderRadius: '14px',
                padding: '14px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <div style={{ fontSize: '12px', color: '#888' }}>Phone</div>
              <div
                style={{
                  fontWeight: '600',
                  color: '#fff',
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span>{formatPhone(client.phone)}</span>
                <a
                  href={client.phone ? `tel:${client.phone}` : undefined}
                  style={{
                    background: '#34c759',
                    border: 'none',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    textDecoration: 'none',
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    style={{ width: '18px', height: '18px', fill: 'white' }}
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Appointments Card */}
            <div
              style={{
                background: '#2c2c2e',
                borderRadius: '14px',
                padding: '14px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                gridColumn: 'span 2',
              }}
            >
              <div style={{ fontSize: '12px', color: '#888' }}>Appointments</div>
              <div style={{ fontWeight: '600', fontSize: '22px', color: '#007aff' }}>
                {appointmentCount}
              </div>
            </div>
          </div>

          {/* NOTES */}
          {client.notes && (
            <div
              style={{
                padding: '14px',
                color: '#aaa',
                fontSize: '14px',
                borderTop: '1px solid #2c2c2e',
              }}
            >
              <div style={{ fontWeight: '600', marginBottom: '6px', color: '#888' }}>
                Notes
              </div>
              <div>{client.notes}</div>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div
            style={{
              padding: '14px',
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end',
            }}
          >
            <button
              onClick={handleDelete}
              style={{
                padding: '8px 14px',
                border: 'none',
                borderRadius: '12px',
                background: '#ff3b30',
                color: 'white',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Delete
            </button>
            <button
              onClick={() => onEdit(client)}
              style={{
                padding: '8px 14px',
                border: 'none',
                borderRadius: '12px',
                background: '#007aff',
                color: 'white',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Edit
            </button>
          </div>
        </div>
      </div>

      {/* LIGHTBOX */}
      {lightboxOpen && client.images && client.images.length > 0 && (
        <div
          onClick={() => setLightboxOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.95)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
            touchAction: 'pan-y',
          }}
        >
          {/* Previous Button */}
          {client.images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              style={{
                position: 'absolute',
                left: '20px',
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                fontSize: '24px',
                fontWeight: 'bold',
              }}
            >
              ‹
            </button>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={client.images[lightboxIndex]}
            alt="Lightbox"
            style={{
              maxWidth: '80%',
              maxHeight: '80%',
              borderRadius: '16px',
              transition: 'transform 0.3s ease',
              objectFit: 'contain',
            }}
          />

          {/* Next Button */}
          {client.images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              style={{
                position: 'absolute',
                right: '20px',
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                fontSize: '24px',
                fontWeight: 'bold',
              }}
            >
              ›
            </button>
          )}

          {/* Image Counter */}
          {client.images.length > 1 && (
            <div
              style={{
                position: 'absolute',
                bottom: '30px',
                background: 'rgba(0,0,0,0.6)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '14px',
              }}
            >
              {lightboxIndex + 1} / {client.images.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}