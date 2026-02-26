'use client';

import { useEffect, useRef, useState } from 'react';
import { Client } from '@/app/clients/page';

interface ClientCardProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (clientId: string) => void;
}

export default function ClientCard({ client, onEdit, onDelete }: ClientCardProps) {
  // Refs for DOM elements
  const clientNameRef = useRef<HTMLDivElement>(null);
  const clientPhoneRef = useRef<HTMLDivElement>(null);
  const clientVisitsRef = useRef<HTMLDivElement>(null);
  const clientAppointmentsRef = useRef<HTMLDivElement>(null);
  const clientServiceRef = useRef<HTMLDivElement>(null);
  const cancelStatusRef = useRef<HTMLDivElement>(null);
  const discountBadgeRef = useRef<HTMLDivElement>(null);

  const [isFrequentCanceller, setIsFrequentCanceller] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [images, setImages] = useState(client.images || []);

  // Toggle card open/close
  const toggleCard = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.parentElement?.classList.toggle('open');
  };

  // Update cancellation status UI
  const updateCancelUI = () => {
    if (!cancelStatusRef.current) return;
    if (isFrequentCanceller) {
      cancelStatusRef.current.className = 'status-icon red';
      cancelStatusRef.current.innerHTML =
        '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M6 18L18 6"/></svg>';
    } else {
      cancelStatusRef.current.className = 'status-icon green';
      cancelStatusRef.current.innerHTML =
        '<svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>';
    }
  };

  // Update discount badge
  const updateDiscount = () => {
    const visits = client.notes ? 1 : 0;
    if (discountBadgeRef.current) {
      discountBadgeRef.current.style.display =
        visits % 5 === 0 && visits !== 0 ? 'inline-block' : 'none';
    }
  };

  // Edit client modal
  const openEditModal = () => {
    onEdit(client);
  };

  // Lightbox handlers
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };
  const closeLightbox = () => setLightboxOpen(false);
  const nextLightbox = () => setLightboxIndex((prev) => (prev + 1) % images.length);
  const prevLightbox = () => setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);

  // Initialize UI effects
  useEffect(() => {
    updateCancelUI();
    updateDiscount();
  }, [isFrequentCanceller]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .client-card { border:1px solid #e5e7eb; border-radius:18px; background:white; overflow:hidden; font-family:system-ui; max-width:500px; margin-bottom:20px; }
        .client-header { padding:16px; font-weight:600; display:flex; justify-content:space-between; cursor:pointer; }
        .client-body { max-height:0; overflow:hidden; transition:.3s ease; }
        .open .client-body { max-height:2000px; }
        .image-section { padding:16px; overflow:hidden; }
        .image-grid { display:flex; gap:12px; overflow-x:auto; scroll-behavior:smooth; }
        .image-item { position:relative; flex:0 0 auto; width:110px; height:110px; border-radius:16px; overflow:hidden; cursor:pointer; box-shadow:0 6px 14px rgba(0,0,0,0.06); transition:transform .25s ease; }
        .image-item:hover { transform:translateY(-3px); }
        .image-item img { width:100%; height:100%; object-fit:cover; transition:transform .3s ease; }
        .image-item:hover img { transform:scale(1.08); }
        .info-cards { display:grid; grid-template-columns:1fr 1fr; gap:12px; padding:14px; }
        .info-box { background:white; border-radius:14px; padding:14px; box-shadow:0 4px 10px rgba(0,0,0,.05); text-align:center; display:flex; flex-direction:column; align-items:center; gap:6px; }
        .label { font-size:12px; color:#6b7280; }
        .value { font-weight:600; }
        .big-number { font-size:22px; }
        .phone-row { display:flex; gap:10px; align-items:center; justify-content:center; }
        .call-btn { background:#22c55e; border:none; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; }
        .call-btn svg { width:18px; height:18px; fill:white; }
        .discount-badge { background:#fef3c7; color:#b45309; padding:4px 8px; border-radius:10px; font-size:11px; display:none; }
        .status-icon { width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; }
        .status-icon svg { width:18px; height:18px; stroke:white; stroke-width:3; fill:none; }
        .green { background:#22c55e; }
        .red { background:#ef4444; }
        .action-area { padding:14px; text-align:right; }
        button { padding:8px 14px; border:none; border-radius:12px; background:#2563eb; color:white; cursor:pointer; }
        .lightbox { position:fixed; inset:0; background:rgba(0,0,0,.95); display:flex; justify-content:center; align-items:center; touch-action: pan-y; z-index:999; }
        .lightbox img { max-width: 80%; max-height: 80%; border-radius: 16px; transition: transform .3s ease; }
      `}} />

      <div className="client-card">
        <div className="client-header" onClick={toggleCard}>
          <span ref={clientNameRef}>{client.name}</span>
          <span className="chevron">⌄</span>
        </div>

        <div className="client-body">
          <div className="image-section">
            <div className="image-grid">
              {images.map((img, idx) => (
                <div className="image-item" key={idx}>
                  <img src={img} alt={`Client ${idx + 1}`} onClick={() => openLightbox(idx)} />
                </div>
              ))}
            </div>
          </div>

          <div className="info-cards">
            <div className="info-box">
              <div className="label">Name</div>
              <div className="value" ref={clientNameRef}>{client.name}</div>
            </div>
            <div className="info-box">
              <div className="label">Phone</div>
              <div className="value phone-row">
                <span ref={clientPhoneRef}>{client.phone}</span>
                <a href={`tel:${client.phone}`} className="call-btn">📞</a>
              </div>
            </div>
            <div className="info-box">
              <div className="label">Visits</div>
              <div className="value big-number" ref={clientVisitsRef}>{client.notes ? 1 : 0}</div>
            </div>
            <div className="info-box">
              <div className="label">Appointments</div>
              <div className="value big-number" ref={clientAppointmentsRef}>0</div>
            </div>
            <div className="info-box">
              <div className="label">Frequent Service</div>
              <div className="value" ref={clientServiceRef}>{client.service || '—'}</div>
            </div>
            <div className="info-box">
              <div className="label">Cancellation Risk</div>
              <div className="status-icon green" ref={cancelStatusRef}>✔</div>
            </div>
          </div>

          <div className="action-area">
            <button onClick={openEditModal}>Edit</button>
            <button onClick={() => onDelete(client.id)}>Delete</button>
          </div>
        </div>
      </div>

      {lightboxOpen && (
        <div className="lightbox" onClick={closeLightbox}>
          <img src={images[lightboxIndex]} alt={`Lightbox ${lightboxIndex}`} />
        </div>
      )}
    </>
  );
}