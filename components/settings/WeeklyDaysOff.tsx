'use client';

import { useEffect, useState } from 'react';
import { Worker, WeeklyDaysOff as WeeklyDaysOffType } from '@/types';
import { storage, STORAGE_KEYS } from '@/lib/storage';

interface WeeklyDaysOffProps {
  worker: Worker;
}

export default function WeeklyDaysOff({ worker }: WeeklyDaysOffProps) {
  const [daysOff, setDaysOff] = useState<WeeklyDaysOffType>({
    Sunday: false,
    Monday: false,
    Tuesday: false,
    Wednesday: false,
    Thursday: false,
    Friday: false,
    Saturday: false,
  });

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    loadDaysOff();
  }, [worker]);

  const loadDaysOff = () => {
    const saved = storage.get<Record<Worker, WeeklyDaysOffType>>(STORAGE_KEYS.WEEKLY_DAYS_OFF);
    if (saved && saved[worker]) {
      setDaysOff(saved[worker]);
    }
  };

  const toggleDay = (day: string) => {
    setDaysOff({ ...daysOff, [day]: !daysOff[day] });
  };

  const saveDaysOff = () => {
    const allDaysOff = storage.get<Record<Worker, WeeklyDaysOffType>>(STORAGE_KEYS.WEEKLY_DAYS_OFF) || {
      dina: daysOff,
      kida: daysOff,
    };

    allDaysOff[worker] = daysOff;
    storage.set(STORAGE_KEYS.WEEKLY_DAYS_OFF, allDaysOff);

    alert('Weekly days off saved successfully');
  };

  return (
    <>
      <h2 className="section-title">Weekly Days Off</h2>
      <p style={{ color: '#888', fontSize: '13px', marginBottom: '10px', paddingLeft: '5px' }}>
        Select days consistently closed
      </p>
      <div className="days-grid" id="days">
        {days.map(day => (
          <button
            key={day}
            className={`day-btn ${daysOff[day] ? 'active' : ''}`}
            onClick={() => toggleDay(day)}
          >
            {day}
          </button>
        ))}
      </div>
      <button className="btn-primary" style={{ marginTop: '20px' }} onClick={saveDaysOff}>
        Save Days
      </button>
    </>
  );
}