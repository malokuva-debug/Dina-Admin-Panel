'use client';

import { useEffect, useState } from 'react';
import { Worker, UnavailableTime } from '@/types';
import { supabase } from '@/lib/supabase';

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

  // Load from Supabase
  const loadTimes = async () => {
    const { data, error } = await supabase
      .from('unavailable_times')
      .select('*')
      .eq('worker', worker)
      .order('date', { ascending: true })
      .order('start', { ascending: true });

    if (error) {
      console.error('Failed to load unavailable times:', error);
      return;
    }

    setUnavailableTimes(data || []);
  };

  const addTimeBlock = async () => {
    if (!date || !startTime || !endTime) {
      alert('Please fill in all fields');
      return;
    }
    if (startTime >= endTime) {
      alert('Start time must be before end time');
      return;
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('unavailable_times')
      .insert({
        worker,
        date,
        start: startTime,
        end: endTime,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to add time block:', error);
      alert('Failed to add time block');
      return;
    }

    setDate('');
    setStartTime('');
    setEndTime('');
    loadTimes();
  };

  const deleteTimeBlock = async (id: string) => {
    if (!confirm('Remove this time block?')) return;

    const { error } = await supabase
      .from('unavailable_times')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete time block:', error);
      alert('Failed to delete time block');
      return;
    }

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