'use client';

import { useEffect, useState } from 'react';
import { Client } from '@/app/admin-dashboard/clients/page';

interface ClientModalProps {
  open: boolean;
  client: Client | null;
  onClose: () => void;
  onSave: (client: Client) => void;
}

export default function ClientModal({
  open,
  client,
  onClose,
  onSave,
}: ClientModalProps) {
  const [form, setForm] = useState<Client>({
    id: '',
    name: '',
    phone: '',
    notes: null,
    images: [],
  });

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  useEffect(() => {
    if (client) {
      setForm({
        ...client,
        images: client.images || [],
      });
    } else {
      setForm({
        id: '',
        name: '',
        phone: '',
        notes: null,
        images: [],
      });
    }
  }, [client]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setForm((prev) => ({
          ...prev,
          images: [...(prev.images || []), result],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleReplaceImage = (index: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setForm((prev) => {
          const newImages = [...(prev.images || [])];
          newImages[index] = result;
          return { ...prev, images: newImages };
        });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleRemoveImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index),
    }));
  };

  if (!open) return null;

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        overflowY: 'auto',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '90%',
          maxWidth: '400px',
          background: '#1c1c1e',
          borderRadius: '20px',
          padding: '20px',
          maxHeight: '90vh',
          overflowY: 'auto',
          border: '1px solid #3a3a3c',
        }}
      >
        <h3
          style={{
            textAlign: 'center',
            marginBottom: '20px',
            fontSize: '20px',
            fontWeight: '600',
            color: '#fff',
          }}
        >
          {client?.id ? 'Edit Client' : 'New Client'}
        </h3>

        <form onSubmit={handleSave}>
          {/* Name */}
          <div style={{ marginBottom: '14px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                marginBottom: '6px',
                color: '#888',
              }}
            >
              Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '12px',
                border: '1px solid #3a3a3c',
                textAlign: 'center',
                boxSizing: 'border-box',
                fontSize: '15px',
                outline: 'none',
                background: '#2c2c2e',
                color: '#fff',
              }}
            />
          </div>

          {/* Phone */}
          <div style={{ marginBottom: '14px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                marginBottom: '6px',
                color: '#888',
              }}
            >
              Phone Number
            </label>
            <input
              type="text"
              value={form.phone ?? ''}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '12px',
                border: '1px solid #3a3a3c',
                textAlign: 'center',
                boxSizing: 'border-box',
                fontSize: '15px',
                outline: 'none',
                background: '#2c2c2e',
                color: '#fff',
              }}
            />
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '14px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                marginBottom: '6px',
                color: '#888',
              }}
            >
              Notes
            </label>
            <textarea
              value={form.notes ?? ''}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '12px',
                border: '1px solid #3a3a3c',
                boxSizing: 'border-box',
                fontSize: '15px',
                outline: 'none',
                resize: 'vertical',
                background: '#2c2c2e',
                color: '#fff',
              }}
            />
          </div>

          {/* Images */}
          <div style={{ marginBottom: '14px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                marginBottom: '6px',
                color: '#888',
              }}
            >
              Images
            </label>

            <div
              style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
                flexWrap: 'wrap',
                padding: '4px 0',
              }}
            >
              {/* Existing Images */}
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  overflowX: 'auto',
                  padding: '8px 0',
                  flex: 1,
                }}
              >
                {form.images && form.images.length > 0 && (
                  <>
                    {form.images.map((img, idx) => (
                      <div
                        key={idx}
                        style={{
                          position: 'relative',
                          flex: '0 0 auto',
                          width: '80px',
                          height: '80px',
                          borderRadius: '12px',
                          overflow: 'visible',
                          cursor: 'pointer',
                          background: '#2c2c2e',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img}
                          alt={`Preview ${idx + 1}`}
                          onClick={() => handleReplaceImage(idx)}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                            borderRadius: '12px',
                          }}
                        />

                        {/* Remove Button - SVG Badge */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(idx);
                          }}
                          style={{
                            position: 'absolute',
                            top: '-2px',
                            right: '-2px',
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            zIndex: 10,
                          }}
                        >
                          <svg
                            viewBox="0 0 28 28"
                            width="28"
                            height="28"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle cx="14" cy="14" r="14" fill="#1c1c1e" />
                            <circle
                              cx="14"
                              cy="14"
                              r="12"
                              fill="#ff3b30"
                              opacity="0.9"
                            />
                            <line
                              x1="10"
                              y1="10"
                              x2="18"
                              y2="18"
                              stroke="white"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                            />
                            <line
                              x1="18"
                              y1="10"
                              x2="10"
                              y2="18"
                              stroke="white"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {/* Add New Image Button */}
                <label
                  style={{
                    flex: '0 0 auto',
                    width: '80px',
                    height: '80px',
                    fontSize: '28px',
                    color: '#666',
                    border: '2px dashed #3a3a3c',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    background: '#2c2c2e',
                  }}
                >
                  +
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </div>
            <p
              style={{
                fontSize: '11px',
                color: '#666',
                marginTop: '6px',
                textAlign: 'center',
              }}
            >
              Click images to replace • Click + to add more
            </p>
          </div>

          {/* Actions */}
          <div
            style={{
              marginTop: '15px',
              display: 'flex',
              justifyContent: 'center',
              gap: '10px',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '12px',
                background: '#3a3a3c',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '12px',
                background: '#007aff',
                color: 'white',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
              }}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}