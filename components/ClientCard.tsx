'use client';

import { useEffect, useRef, useState } from 'react';

interface ClientCardProps {
  client: {
    id: string;
    name: string;
    phone: string;
    visits: number;
    appointments: number;
    service: string;
    images: string[];
    isFrequentCanceller?: boolean;
  };
  onEdit?: (client: any) => void;
  onDelete?: (clientId: string) => void;
}

export default function ClientCard({ clientData }: ClientCardProps) {
  const [client, setClient] = useState({ ...clientData });
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editImages, setEditImages] = useState<string[]>([...clientData.images]);
  const [discountVisible, setDiscountVisible] = useState(false);
  const [isFrequentCanceller, setIsFrequentCanceller] = useState(clientData.isFrequentCanceller || false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const lightboxImages = useRef<HTMLImageElement[]>([]);

  // Sync discount badge
  useEffect(() => {
    setDiscountVisible(client.visits % 5 === 0 && client.visits !== 0);
  }, [client.visits]);

  // Handle toggle card
  const toggleCard = () => setIsOpen(!isOpen);

  // Edit modal handlers
  const openEditModal = () => setIsEditing(true);
  const closeEditModal = () => setIsEditing(false);

  const handleSave = () => {
    setClient(prev => ({ ...prev, images: [...editImages] }));
    setIsEditing(false);
  };

  const handleAddImages = (files: FileList | null) => {
    if (!files) return;
    const newImages: string[] = [];
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newImages.push(e.target.result as string);
          setEditImages(prev => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleReplaceImage = (index: number, file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      if (e.target?.result) {
        setEditImages(prev => prev.map((img, i) => (i === index ? e.target!.result as string : img)));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (index: number) => {
    setEditImages(prev => prev.filter((_, i) => i !== index));
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };
  const closeLightbox = () => setLightboxOpen(false);
  const nextLightbox = () => setLightboxIndex((lightboxIndex + 1) % client.images.length);
  const prevLightbox = () => setLightboxIndex((lightboxIndex - 1 + client.images.length) % client.images.length);

  return (
    <>
      <div className={`client-card ${isOpen ? 'open' : ''}`}>
        <div className="client-header" onClick={toggleCard}>
          <span id="headerName">{client.name}</span>
          <span className="chevron"></span>
        </div>
        <div className="client-body">
          {/* IMAGE GRID */}
          <div className="image-section">
            <div className="image-grid">
              {client.images.map((img, i) => (
                <div className="image-item" key={i}>
                  <img src={img} onClick={() => openLightbox(i)} />
                </div>
              ))}
            </div>
          </div>

          {/* INFO CARDS */}
          <div className="info-cards">
            <div className="info-box">
              <div className="label">Name</div>
              <div className="value" id="clientName">{client.name}</div>
            </div>
            <div className="info-box">
              <div className="label">Phone</div>
              <div className="value phone-row">
                <span id="clientPhone">{client.phone}</span>
                <a href={`tel:${client.phone}`} className="call-btn">
                  <svg viewBox="0 0 24 24">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </a>
              </div>
            </div>
            <div className="info-box">
              <div className="label">Visits</div>
              <div className="value big-number">{client.visits}</div>
              {discountVisible && <div className="discount-badge">50% OFF</div>}
            </div>
            <div className="info-box">
              <div className="label">Appointments</div>
              <div className="value big-number">{client.appointments}</div>
            </div>
            <div className="info-box">
              <div className="label">Frequent Service</div>
              <div className="value">{client.service}</div>
            </div>
            <div className="info-box">
              <div className="label">Cancellation Risk</div>
              <div className={`status-icon ${isFrequentCanceller ? 'red' : 'green'}`}>
                {isFrequentCanceller ? (
                  <svg viewBox="0 0 24 24"><path d="M6 6l12 12M6 18L18 6" strokeWidth={3} stroke="white" fill="none" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth={3} stroke="white" fill="none" /></svg>
                )}
              </div>
            </div>
          </div>

          {/* ACTION */}
          <div className="action-area">
            <button onClick={openEditModal}>Edit</button>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {isEditing && (
        <div className="modal-overlay" style={{ display: 'flex' }}>
          <div className="modal">
            <h3>Edit Client</h3>

            <div className="field">
              <label>Name</label>
              <input value={client.name} onChange={e => setClient(prev => ({ ...prev, name: e.target.value }))} />
            </div>
            <div className="field">
              <label>Phone Number</label>
              <input value={client.phone} onChange={e => setClient(prev => ({ ...prev, phone: e.target.value }))} />
            </div>
            <div className="field">
              <label>Number of Visits</label>
              <input type="number" value={client.visits} onChange={e => setClient(prev => ({ ...prev, visits: Number(e.target.value) }))} />
            </div>
            <div className="field">
              <label>Number of Appointments</label>
              <input type="number" value={client.appointments} onChange={e => setClient(prev => ({ ...prev, appointments: Number(e.target.value) }))} />
            </div>
            <div className="field">
              <label>Frequent Service</label>
              <input value={client.service} onChange={e => setClient(prev => ({ ...prev, service: e.target.value }))} />
            </div>

            <div className="field">
              <label>Images</label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <div className="edit-image-grid">
                  {editImages.map((img, i) => (
                    <div className="edit-image-item" key={i}>
                      <img src={img} onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e: any) => {
                          const file = e.target.files[0];
                          if (file) handleReplaceImage(i, file);
                        };
                        input.click();
                      }} />
                      <div className="remove-btn" onClick={() => handleRemoveImage(i)}>×</div>
                    </div>
                  ))}
                </div>
                <div className="edit-image-item add-placeholder" style={{ fontSize: 28, color: '#9ca3af', border: '2px dashed #d1d5db' }}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.multiple = true;
                    input.onchange = (e: any) => handleAddImages(e.target.files);
                    input.click();
                  }}>+</div>
              </div>
            </div>

            <div className="field">
              <label>Cancellation Risk</label>
              <div className="cancel-options">
                <div className="option green" onClick={() => setIsFrequentCanceller(false)}>
                  <svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth={3} stroke="white" fill="none" /></svg>
                </div>
                <div className="option red" onClick={() => setIsFrequentCanceller(true)}>
                  <svg viewBox="0 0 24 24"><path d="M6 6l12 12M6 18L18 6" strokeWidth={3} stroke="white" fill="none" /></svg>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={closeEditModal}>Cancel</button>
              <button onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX */}
      {lightboxOpen && (
        <div className="lightbox" style={{ display: 'flex' }} onClick={closeLightbox}>
          <img src={client.images[lightboxIndex]} />
        </div>
      )}
    </>
  );
}