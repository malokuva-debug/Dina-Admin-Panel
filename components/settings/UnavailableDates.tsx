'use client';

import { useEffect, useState } from 'react';
import { Worker, UnavailableDate } from '@/types';
import { storage, STORAGE_KEYS } from '@/lib/storage';

interface UnavailableDatesProps {
  worker: Worker;
}

export default function UnavailableDates({ worker }: UnavailableDatesProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [unavailableDates, setUnavailableDates] = useState<UnavailableDate[]>([]);

  useEffect(() => {
    loadDates();
  }, [worker]);

  const loadDates = () => {
    const saved: UnavailableDate[] = storage.get(STORAGE_KEYS.UNAVAILABLE_DATES) || [];
    const filtered = saved.filter(d => d.worker === worker);
    
    // Sort by date
    filtered.sort((a, b) => a.date.localeCompare(b.date));
    
    setUnavailableDates(filtered);
  };

  const addDate = () => {
    if (!selectedDate) {
      alert('Please select a date');
      return;
    }

    // Check if date already exists for this worker
    const allDates: UnavailableDate[] = storage.get(STORAGE_KEYS.UNAVAILABLE_DATES) || [];
    const exists = allDates.some(d => d.date === selectedDate && d.worker === worker);

    if (exists) {
      alert('This date is already marked as unavailable');
      return;
    }

    const newDate: UnavailableDate = {
      id: Date.now().toString(),
      date: selectedDate,
      worker: worker,
    };

    storage.set(STORAGE_KEYS.UNAVAILABLE_DATES, [...allDates, newDate]);
    setSelectedDate('');
    loadDates();
  };

  const deleteDate = (id: string) => {
    if (!confirm('Remove this unavailable date?')) return;

    const allDates: UnavailableDate[] = storage.get(STORAGE_KEYS.UNAVAILABLE_DATES) || [];
    storage.set(
      STORAGE_KEYS.UNAVAILABLE_DATES,
      allDates.filter(d => d.id !== id)
    );
    loadDates();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      <h2 className="section-title">Unavailable Dates</h2>
      <div className="card">
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="date"
            id="uDate"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ marginBottom: 0, flex: 1 }}
          />
          <button
            className="btn-primary"
            onClick={addDate}
            style={{
              width: '50px',
              height: '50px',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
            }}
          >
            +
          </button>
        </div>
        <div id="uDates" style={{ marginTop: '15px' }}>
          {unavailableDates.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#888', padding: '10px 0' }}>
              No unavailable dates set
            </p>
          ) : (
            unavailableDates.map(date => (
              <div
                key={date.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: '#2c2c2e',
                  borderRadius: '8px',
                  marginBottom: '8px',
                }}
              >
                <span>{formatDate(date.date)}</span>
                <button
                  onClick={() => deleteDate(date.id)}
                  style={{
                    padding: '6px 12px',
                    background: '#ff3b30',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}