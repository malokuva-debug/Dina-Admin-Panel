'use client';

import { useEffect, useState } from 'react';
import { Worker, UnavailableTime } from '@/types';
import { storage, STORAGE_KEYS } from '@/lib/storage';

interface UnavailableTimesProps {
  worker: Worker;
}

export default function UnavailableTimes({ worker }: UnavailableTimesProps) {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [unavailableTimes, setUnavailableTimes] = useState<UnavailableTime[]>([]);

  useEffect(() => {
    loadTimes();
  }, [worker]);

  const loadTimes = () => {
    const saved: UnavailableTime[] = storage.get(STORAGE_KEYS.UNAVAILABLE_TIMES) || [];
    const filtered = saved.filter(t => t.worker === worker);
    
    // Sort by date then start time
    filtered.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.start.localeCompare(b.start);
    });
    
    setUnavailableTimes(filtered);
  };

  const addTimeBlock = () => {
    if (!date || !startTime || !endTime) {
      alert('Please fill in all fields');
      return;
    }

    if (startTime >= endTime) {
      alert('Start time must be before end time');
      return;
    }

    const newTimeBlock: UnavailableTime = {
      id: Date.now().toString(),
      date: date,
      start: startTime,
      end: endTime,
      worker: worker,
    };

    const allTimes: UnavailableTime[] = storage.get(STORAGE_KEYS.UNAVAILABLE_TIMES) || [];
    storage.set(STORAGE_KEYS.UNAVAILABLE_TIMES, [...allTimes, newTimeBlock]);

    // Reset form
    setDate('');
    setStartTime('');
    setEndTime('');
    
    loadTimes();
  };

  const deleteTimeBlock = (id: string) => {
    if (!confirm('Remove this time block?')) return;

    const allTimes: UnavailableTime[] = storage.get(STORAGE_KEYS.UNAVAILABLE_TIMES) || [];
    storage.set(
      STORAGE_KEYS.UNAVAILABLE_TIMES,
      allTimes.filter(t => t.id !== id)
    );
    loadTimes();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <>
      <h2 className="section-title">Unavailable Times</h2>
      <div className="card">
        <label>Date</label>
        <input
          type="date"
          id="uTimeDate"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <div className="time-row">
          <div className="time-col">
            <label>Start</label>
            <input
              type="time"
              id="uStart"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className="time-col">
            <label>End</label>
            <input
              type="time"
              id="uEnd"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>

        <button className="btn-primary" onClick={addTimeBlock}>
          Add Time Block
        </button>

        <div id="uTimes" style={{ marginTop: '15px' }}>
          {unavailableTimes.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#888', padding: '10px 0' }}>
              No unavailable time blocks set
            </p>
          ) : (
            unavailableTimes.map(timeBlock => (
              <div
                key={timeBlock.id}
                style={{
                  padding: '12px',
                  background: '#2c2c2e',
                  borderRadius: '8px',
                  marginBottom: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <strong>{formatDate(timeBlock.date)}</strong>
                    <div style={{ color: '#888', fontSize: '14px', marginTop: '4px' }}>
                      {formatTime(timeBlock.start)} - {formatTime(timeBlock.end)}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTimeBlock(timeBlock.id)}
                    style={{
                      padding: '6px 12px',
                      background: '#ff3b30',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      height: 'fit-content',
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}