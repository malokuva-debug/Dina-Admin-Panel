'use client';

import { useState, useEffect } from 'react';
import { Service, Category } from '@/types';
import { db, storage, STORAGE_KEYS, storageMode } from '@/lib/storage';

interface ServiceModalProps {
  service: Service;
  categoryId: string;
  onClose: () => void;
}

export default function ServiceModal({ service, categoryId, onClose }: ServiceModalProps) {
  const [name, setName] = useState(service.name);
  const [price, setPrice] = useState(service.price.toString());
  const [duration, setDuration] = useState(service.duration.toString());

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter a service name');
      return;
    }

    const priceNum = parseFloat(price);
    const durationNum = parseInt(duration);

    if (isNaN(priceNum) || priceNum < 0) {
      alert('Please enter a valid price');
      return;
    }

    if (isNaN(durationNum) || durationNum <= 0) {
      alert('Please enter a valid duration');
      return;
    }

    try {
      const updatedService: Service = {
        ...service,
        name: name.trim(),
        price: priceNum,
        duration: durationNum,
        category: categoryId,
      };

      if (storageMode === 'supabase') {
        // Check if this is a new service or existing
        const categories: Category[] = await db.categories.getAll();
        const existingCategory = categories.find(c => c.id === categoryId);
        const isNewService = !existingCategory?.services?.some(s => s.id === service.id);

        if (isNewService) {
          await db.services.create({
            name: updatedService.name,
            price: updatedService.price,
            duration: updatedService.duration,
            category: categoryId,
          });
        } else {
          await db.services.update(service.id, {
            name: updatedService.name,
            price: updatedService.price,
            duration: updatedService.duration,
          });
        }
      } else {
        // localStorage
        const categories: Category[] = storage.get(STORAGE_KEYS.CATEGORIES) || [];
        
        const updated = categories.map(cat => {
          if (cat.id === categoryId) {
            const existingIndex = cat.services.findIndex(s => s.id === service.id);
            
            if (existingIndex >= 0) {
              // Update existing service
              const newServices = [...cat.services];
              newServices[existingIndex] = updatedService;
              return { ...cat, services: newServices };
            } else {
              // Add new service
              return { ...cat, services: [...cat.services, updatedService] };
            }
          }
          return cat;
        });

        storage.set(STORAGE_KEYS.CATEGORIES, updated);
      }

      onClose();
    } catch (error) {
      console.error('Error saving service:', error);
      alert('Failed to save service');
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="modal active" 
      id="modal"
      onClick={handleBackdropClick}
    >
      <div className="modal-content">
        <h3>Edit Service</h3>
        <div className="row">
          <span>Name</span>
          <input
            id="mName"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="row">
          <span>Price $</span>
          <input
            type="number"
            id="mPrice"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min="0"
            step="0.01"
          />
        </div>
        <div className="row">
          <span>Mins</span>
          <input
            type="number"
            id="mDuration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            min="1"
            step="1"
          />
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button className="btn-primary" onClick={handleSave}>
            Save
          </button>
          <button
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
        </div>
      </div>
    </div>
  );
}