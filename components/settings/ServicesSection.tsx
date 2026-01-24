'use client';

import { useEffect, useState } from 'react';
import { Category, Service } from '@/types';
import { db, storage, STORAGE_KEYS, storageMode } from '@/lib/storage';
import ServiceModal from '@/components/modals/ServiceModal';

export default function ServicesSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      if (storageMode === 'supabase') {
        // Use Supabase
        const data = await db.categories.getAll();
        setCategories(data);
        if (data.length > 0 && !selectedCategory) {
          setSelectedCategory(data[0].id);
        }
      } else {
        // Use localStorage
        const saved: Category[] = storage.get(STORAGE_KEYS.CATEGORIES) || [];
        setCategories(saved);
        if (saved.length > 0 && !selectedCategory) {
          setSelectedCategory(saved[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('Please enter a category name');
      return;
    }

    try {
      if (storageMode === 'supabase') {
        const newCategory = await db.categories.create({ name: newCategoryName.trim() });
        if (newCategory) {
          await loadCategories();
          setSelectedCategory(newCategory.id);
          setNewCategoryName('');
        }
      } else {
        const newCategory: Category = {
          id: Date.now().toString(),
          name: newCategoryName.trim(),
          services: [],
        };

        const updated = [...categories, newCategory];
        storage.set(STORAGE_KEYS.CATEGORIES, updated);
        setCategories(updated);
        setSelectedCategory(newCategory.id);
        setNewCategoryName('');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Failed to add category');
    }
  };

  const deleteCategory = async () => {
    if (!selectedCategory) return;

    const category = categories.find(c => c.id === selectedCategory);
    if (!category) return;

    if (!confirm(`Delete category "${category.name}" and all its services?`)) return;

    try {
      if (storageMode === 'supabase') {
        await db.categories.delete(selectedCategory);
      } else {
        const updated = categories.filter(c => c.id !== selectedCategory);
        storage.set(STORAGE_KEYS.CATEGORIES, updated);
      }
      
      await loadCategories();
      const remaining = categories.filter(c => c.id !== selectedCategory);
      setSelectedCategory(remaining.length > 0 ? remaining[0].id : '');
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  };

  const addService = () => {
    if (!selectedCategory) {
      alert('Please select a category first');
      return;
    }

    const newService: Service = {
      id: Date.now().toString(),
      name: 'New Service',
      price: 0,
      duration: 30,
      category: selectedCategory,
    };

    setSelectedService(newService);
    setIsModalOpen(true);
  };

  const editService = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const deleteService = async (serviceId: string) => {
    if (!confirm('Delete this service?')) return;

    try {
      if (storageMode === 'supabase') {
        await db.services.delete(serviceId);
      } else {
        const updated = categories.map(cat => ({
          ...cat,
          services: cat.services.filter(s => s.id !== serviceId),
        }));
        storage.set(STORAGE_KEYS.CATEGORIES, updated);
      }
      
      await loadCategories();
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Failed to delete service');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedService(null);
    loadCategories();
  };

  const currentCategory = categories.find(c => c.id === selectedCategory);

  if (loading) {
    return (
      <>
        <h2 className="section-title">Services</h2>
        <div className="card">
          <p style={{ textAlign: 'center', color: '#888', padding: '20px 0' }}>
            Loading services...
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <h2 className="section-title">Services</h2>
      
      <div className="card">
        <label>Add New Category</label>
        <input
          id="newCategory"
          placeholder="Category Name"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
        />
        <button className="btn-primary" onClick={addCategory}>
          + Create Category
        </button>

        <div style={{ height: '1px', background: '#333', margin: '20px 0' }}></div>

        <label>Select Category</label>
        <select
          id="categorySelect"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.length === 0 ? (
            <option value="">No categories yet</option>
          ) : (
            categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))
          )}
        </select>

        <button className="btn-primary" onClick={addService} disabled={!selectedCategory}>
          + Add Service
        </button>

        {selectedCategory && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button className="btn-remove" onClick={deleteCategory}>
              Delete Category
            </button>
          </div>
        )}
      </div>

      {currentCategory && currentCategory.services && currentCategory.services.length > 0 && (
        <div id="services">
          {currentCategory.services.map(service => (
            <div key={service.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '16px' }}>{service.name}</strong>
                  <div style={{ color: '#888', fontSize: '14px', marginTop: '4px' }}>
                    ${service.price.toFixed(2)} • {service.duration} mins
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => editService(service)}
                    style={{
                      padding: '8px 16px',
                      background: '#007aff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteService(service.id)}
                    className="btn-remove"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && selectedService && (
        <ServiceModal
          service={selectedService}
          categoryId={selectedCategory}
          onClose={handleModalClose}
        />
      )}
    </>
  );
}