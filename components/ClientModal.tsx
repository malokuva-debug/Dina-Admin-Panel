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
    email: null,
    notes: null,
    images: [],
  });

  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  // Update form when editing an existing client
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
        email: null,
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
      className="modal active"
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        overflowY: 'auto',
        padding: '20px',
      }}
    >
      <div
        className="modal-content"
        style={{
          backgroundColor: '#1c1c1e',
          padding: '24px',
          borderRadius: '18px',
          minWidth: '400px',
          maxWidth: '500px',
          width: '100%',
          color: 'white',
          boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>
          {client?.id ? 'Edit Client' : 'New Client'}
        </h3>

        <form onSubmit={handleSave}>
          {/* Name */}
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#aaa',
              }}
            >
              Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              style={{
                backgroundColor: '#2c2c2e',
                color: 'white',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #3a3a3c',
                width: '100%',
                fontSize: '15px',
                outline: 'none',
              }}
            />
          </div>

          {/* Phone */}
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#aaa',
              }}
            >
              Phone *
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
              style={{
                backgroundColor: '#2c2c2e',
                color: 'white',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #3a3a3c',
                width: '100%',
                fontSize: '15px',
                outline: 'none',
              }}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#aaa',
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={form.email ?? ''}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={{
                backgroundColor: '#2c2c2e',
                color: 'white',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #3a3a3c',
                width: '100%',
                fontSize: '15px',
                outline: 'none',
              }}
            />
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#aaa',
              }}
            >
              Notes
            </label>
            <textarea
              value={form.notes ?? ''}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              style={{
                backgroundColor: '#2c2c2e',
                color: 'white',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #3a3a3c',
                width: '100%',
                fontSize: '15px',
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Images */}
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '10px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#aaa',
              }}
            >
              Images
            </label>

            {form.images && form.images.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  overflowX: 'auto',
                  marginBottom: '12px',
                  paddingBottom: '8px',
                }}
              >
                {form.images.map((img, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: 'relative',
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={img}
                      alt={`Preview ${idx + 1}`}
                      onClick={() => handleReplaceImage(idx)}
                      style={{
                        width: '90px',
                        height: '90px',
                        objectFit: 'cover',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        border: '2px solid #3a3a3c',
                      }}
                      title="Click to replace"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      style={{
                        position: 'absolute',
                        top: '-6px',
                        right: '-6px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: '#ff3b30',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: '#007aff',
                color: 'white',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              <span>+ Add Images</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </label>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
              Click images to replace. Maximum recommended: 5 images.
            </p>
          </div>

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginTop: '24px',
            }}
          >
            <button
              type="button"
              style={{
                background: '#3a3a3c',
                color: 'white',
                padding: '14px',
                borderRadius: '12px',
                flex: 1,
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
              }}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                background: '#34c759',
                color: 'white',
                padding: '14px',
                borderRadius: '12px',
                flex: 1,
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
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