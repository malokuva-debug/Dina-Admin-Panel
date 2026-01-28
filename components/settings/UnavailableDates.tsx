'use client';

import { useEffect, useState } from 'react';
import { Worker, UnavailableDate } from '@/types';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { supabase } from '@/lib/supabase';

interface UnavailableDatesProps {
  worker: Worker;
}

export default function UnavailableDates({ worker }: UnavailableDatesProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [unavailableDates, setUnavailableDates] = useState<UnavailableDate[]>([]);

  useEffect(() => {
    loadDates();
  }, [worker]);

  const loadDates = async () => {
  const { data, error } = await supabase
    .from('unavailable_dates')
    .select('*')
    .eq('worker', worker)
    .order('date');

  if (error) {
    console.error('Failed to load unavailable dates:', error);
    return;
  }

  setUnavailableDates(data || []);
};

  const addDate = async () => {
  if (!selectedDate) {
    alert('Please select a date');
    return;
  }

  const { error } = await supabase
    .from('unavailable_dates')
    .insert({
      worker: worker,
      date: selectedDate
    });

  if (error) {
    if (error.code === '23505') {
      alert('This date is already marked as unavailable');
    } else {
      console.error(error);
      alert('Failed to save unavailable date');
    }
    return;
  }

  setSelectedDate('');
  loadDates();
};

const deleteDate = async (id: string) => {
  if (!confirm('Remove this unavailable date?')) return;

  const { error } = await supabase
    .from('unavailable_dates')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Failed to delete unavailable date:', error);
    alert('Failed to delete date');
    return;
  }

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