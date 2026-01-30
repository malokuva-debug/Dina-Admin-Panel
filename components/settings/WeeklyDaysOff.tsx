'use client';

import { useEffect, useState } from 'react';
import { Worker, WeeklyDaysOff as WeeklyDaysOffType } from '@/types';
import { supabase } from '@/lib/supabase';

interface WeeklyDaysOffProps {
  worker: Worker;
}

const DEFAULT_DAYS: WeeklyDaysOffType = {
  Sunday: false,
  Monday: false,
  Tuesday: false,
  Wednesday: false,
  Thursday: false,
  Friday: false,
  Saturday: false,
};

export default function WeeklyDaysOff({ worker }: WeeklyDaysOffProps) {
  const [daysOff, setDaysOff] = useState<WeeklyDaysOffType>(DEFAULT_DAYS);
  const [loading, setLoading] = useState(false);

  const days = Object.keys(DEFAULT_DAYS) as (keyof WeeklyDaysOffType)[];

  useEffect(() => {
    if (worker?.id) {
      fetchDaysOff();
    }
  }, [worker?.id]);

  const fetchDaysOff = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('weekly_days_off')
      .select('day, is_off')
      .eq('worker', worker.id);

    if (!error && data) {
      const mapped: WeeklyDaysOffType = { ...DEFAULT_DAYS };

      data.forEach(row => {
        const day = row.day as keyof WeeklyDaysOffType;
        if (day in mapped) {
          mapped[day] = row.is_off;
        }
      });

      setDaysOff(mapped);
    }

    setLoading(false);
  };

  const toggleDay = (day: keyof WeeklyDaysOffType) => {
    setDaysOff(prev => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  const saveDaysOff = async () => {
    setLoading(true);

    const payload = days.map(day => ({
      worker: worker.id,
      day,
      is_off: daysOff[day],
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('weekly_days_off')
      .upsert(payload, {
        onConflict: 'worker,day',
      });

    setLoading(false);

    if (error) {
      console.error(error);
      alert('Failed to save weekly days off');
      return;
    }

    alert('Weekly days off saved successfully');
  };

  return (
    <>
      <h2 className="section-title">Weekly Days Off</h2>

      <p
        style={{
          color: '#888',
          fontSize: '13px',
          marginBottom: '10px',
          paddingLeft: '5px',
        }}
      >
        Select days consistently closed
      </p>

      <div className="days-grid">
        {days.map(day => (
          <button
            key={day}
            className={`day-btn ${daysOff[day] ? 'active' : ''}`}
            onClick={() => toggleDay(day)}
            disabled={loading}
          >
            {day}
          </button>
        ))}
      </div>

      <button
        className="btn-primary"
        style={{ marginTop: '20px' }}
        onClick={saveDaysOff}
        disabled={loading}
      >
        {loading ? 'Saving...' : 'Save Days'}
      </button>
    </>
  );
}