'use client';

import { useEffect, useState } from 'react';
import { Category, Service } from '@/types';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import ServiceModal from '@/components/modals/ServiceModal';

export default function ServicesSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    const saved: Category[] = storage.get(STORAGE_KEYS.CATEGORIES) || [];
    setCategories(saved);
    if (saved.length > 0 && !selectedCategory) {
      setSelectedCategory(saved[0].id);
    }
  };

  const addCategory = () => {
    if (!newCategoryName.trim()) {
      alert('Please enter a category name');
      return;
    }

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
  };

  const deleteCategory = () => {
    if (!selectedCategory) return;

    const category = categories.find(c => c.id === selectedCategory);
    if (!category) return;

    if (!confirm(`Delete category "${category.name}" and all its services?`)) return;

    const updated = categories.filter(c => c.id !== selectedCategory);
    storage.set(STORAGE_KEYS.CATEGORIES, updated);
    setCategories(updated);
    setSelectedCategory(updated.length > 0 ? updated[0].id : '');
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

  const deleteService = (serviceId: string) => {
    if (!confirm('Delete this service?')) return;

    const updated = categories.map(cat => ({
      ...cat,
      services: cat.services.filter(s => s.id !== serviceId),
    }));

    storage.set(STORAGE_KEYS.CATEGORIES, updated);
    setCategories(updated);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedService(null);
    loadCategories();
  };

  const currentCategory = categories.find(c => c.id === selectedCategory);

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
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <button className="btn-primary" onClick={addService}>
          + Add Service
        </button>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button className="btn-remove" onClick={deleteCategory}>
            Delete Category
          </button>
        </div>
      </div>

      {currentCategory && currentCategory.services.length > 0 && (
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