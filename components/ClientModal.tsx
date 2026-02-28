'use client';

import { useEffect, useState } from 'react';
import { Client } from '@/app/admin-dashboard/clients/page';
import imageCompression from 'browser-image-compression';

interface ClientModalProps {
  open: boolean;
  client: Client | null;
  onClose: () => void;
  onSave: (client: Client) => void;
}

const emptyForm: Client = {
  id: '',
  name: '',
  phone: null,
  notes: null,
  images: [],
  visits: 0,
  appointments: 0,
  frequent_service: null,
  frequent_canceller: false,
};

/* ── ImageKit helpers ── */
const IK_PUB_KEY = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!;

const compressImage = (file: File) =>
  imageCompression(file, {
    maxSizeMB: 0.4,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
  });

// Each upload gets its own fresh auth token — required by ImageKit
const uploadToImageKit = async (file: File): Promise<string> => {
  const authRes = await fetch('/api/imagekit-auth');
  const auth = await authRes.json();

  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileName', `${Date.now()}_${file.name}`);
  formData.append('folder', '/clients');
  formData.append('publicKey', IK_PUB_KEY);
  formData.append('signature', auth.signature);
  formData.append('expire', String(auth.expire));
  formData.append('token', auth.token);

  const res = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Upload failed');
  return data.url;
};

/* ── Component ── */
export default function ClientModal({ open, client, onClose, onSave }: ClientModalProps) {
  const [form, setForm]           = useState<Client>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [open]);

  useEffect(() => {
    setForm(client ? { ...emptyForm, ...client, images: client.images || [] } : emptyForm);
  }, [client]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  /* ── Upload sequentially — ImageKit requires unique token per upload ── */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // 1. Show instant blob previews for all files
    const objectUrls = files.map((f) => URL.createObjectURL(f));
    setForm((prev) => ({ ...prev, images: [...(prev.images || []), ...objectUrls] }));
    setUploading(true);

    // 2. Upload sequentially (each gets its own auth token)
    const uploadedUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      setUploadProgress(`Uploading ${i + 1} of ${files.length}…`);
      try {
        const compressed = await compressImage(files[i]);
        const url = await uploadToImageKit(compressed);
        uploadedUrls.push(url);
      } catch (err) {
        console.error(`Upload error for file ${i + 1}:`, err);
        uploadedUrls.push(objectUrls[i]); // keep blob preview on failure
      }
    }

    // 3. Swap blob URLs for ImageKit URLs and free memory
    setForm((prev) => {
      const images = [...(prev.images || [])];
      const startIdx = images.length - files.length;
      uploadedUrls.forEach((url, i) => { images[startIdx + i] = url; });
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
      return { ...prev, images };
    });

    setUploading(false);
    setUploadProgress('');
    e.target.value = '';
  };

  /* ── Replace single image ── */
  const handleReplaceImage = (index: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Instant preview
      const objectUrl = URL.createObjectURL(file);
      setForm((prev) => {
        const imgs = [...(prev.images || [])];
        imgs[index] = objectUrl;
        return { ...prev, images: imgs };
      });

      try {
        const compressed = await compressImage(file);
        const url = await uploadToImageKit(compressed);
        URL.revokeObjectURL(objectUrl);
        setForm((prev) => {
          const imgs = [...(prev.images || [])];
          imgs[index] = url;
          return { ...prev, images: imgs };
        });
      } catch (err) {
        console.error('Replace error:', err);
      }
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

          <Field label="Name *">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              style={inputStyle}
            />
          </Field>

          <Field label="Phone">
            <input
              type="text"
              value={form.phone ?? ''}
              onChange={(e) => setForm({ ...form, phone: e.target.value || null })}
              style={inputStyle}
            />
          </Field>

          <Field label="Notes">
            <textarea
              value={form.notes ?? ''}
              onChange={(e) => setForm({ ...form, notes: e.target.value || null })}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </Field>

          {/* Images */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Images</label>

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
                  <div key={idx} style={{ position: 'relative', flexShrink: 0 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={`Preview ${idx + 1}`}
                      onClick={() => handleReplaceImage(idx)}
                      title="Click to replace"
                      style={{
                        width: '90px',
                        height: '90px',
                        objectFit: 'cover',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        border: '2px solid #3a3a3c',
                        display: 'block',
                      }}
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
                        background: 'rgb(255, 59, 48)',
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
                background: uploading ? '#3a3a3c' : 'rgb(0, 122, 255)',
                color: uploading ? '#888' : 'white',
                borderRadius: '10px',
                cursor: uploading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'background 0.2s',
              }}
            >
              <span>{uploading ? uploadProgress : '+ Add Images'}</span>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={uploading}
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </label>
            <p style={{ fontSize: '12px', color: '#555', marginTop: '8px' }}>
              Click an image to replace it.
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              type="button"
              onClick={onClose}
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
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              style={{
                background: uploading ? '#3a3a3c' : 'rgb(0, 122, 255)',
                color: uploading ? '#888' : 'white',
                padding: '14px',
                borderRadius: '12px',
                flex: 1,
                border: 'none',
                cursor: uploading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'background 0.2s',
              }}
            >
              {uploading ? uploadProgress : 'Save'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

/* ── Shared styles ── */
const inputStyle: React.CSSProperties = {
  backgroundColor: '#2c2c2e',
  color: 'white',
  padding: '12px',
  borderRadius: '10px',
  border: '1px solid #3a3a3c',
  width: '100%',
  fontSize: '15px',
  outline: 'none',
  fontFamily: 'inherit',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '6px',
  fontSize: '14px',
  fontWeight: '600',
  color: '#aaa',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}