'use client';

import { useEffect, useState } from 'react';
import { Worker, BusinessHours as BusinessHoursType } from '@/types';
import { storage, STORAGE_KEYS } from '@/lib/storage';

interface BusinessHoursProps {
  worker: Worker;
}

export default function BusinessHours({ worker }: BusinessHoursProps) {
  const [hours, setHours] = useState<BusinessHoursType>({
    open: '09:00',
    close: '17:00',
    lunchStart: '12:00',
    lunchEnd: '13:00',
  });

  useEffect(() => {
    loadHours();
  }, [worker]);

  const loadHours = () => {
    const saved = storage.get<Record<Worker, BusinessHoursType>>(STORAGE_KEYS.BUSINESS_HOURS);
    if (saved && saved[worker]) {
      setHours(saved[worker]);
    }
  };

  const saveHours = () => {
    // Validate times
    if (hours.open >= hours.close) {
      alert('Opening time must be before closing time');
      return;
    }

    if (hours.lunchStart >= hours.lunchEnd) {
      alert('Lunch start must be before lunch end');
      return;
    }

    if (hours.lunchStart < hours.open || hours.lunchEnd > hours.close) {
      alert('Lunch break must be within business hours');
      return;
    }

    const allHours = storage.get<Record<Worker, BusinessHoursType>>(STORAGE_KEYS.BUSINESS_HOURS) || {
      dina: hours,
      kida: hours,
    };

    allHours[worker] = hours;
    storage.set(STORAGE_KEYS.BUSINESS_HOURS, allHours);

    alert('Business hours saved successfully');
  };

  return (
    <>
      <h2 className="section-title">Business Hours</h2>
      <div className="card">
        <div className="row">
          <span>Open</span>
          <input
            type="time"
            id="workOpen"
            value={hours.open}
            onChange={(e) => setHours({ ...hours, open: e.target.value })}
          />
        </div>
        <div className="row">
          <span>Close</span>
          <input
            type="time"
            id="workClose"
            value={hours.close}
            onChange={(e) => setHours({ ...hours, close: e.target.value })}
          />
        </div>
        <div style={{ height: '1px', background: '#333', margin: '10px 0' }}></div>
        <div className="row">
          <span>Lunch</span>
          <input
            type="time"
            id="lunchStart"
            value={hours.lunchStart}
            onChange={(e) => setHours({ ...hours, lunchStart: e.target.value })}
          />
        </div>
        <div className="row">
          <span>Ends</span>
          <input
            type="time"
            id="lunchEnd"
            value={hours.lunchEnd}
            onChange={(e) => setHours({ ...hours, lunchEnd: e.target.value })}
          />
        </div>
        <button className="btn-primary" style={{ marginTop: '15px' }} onClick={saveHours}>
          Save Hours
        </button>
      </div>
    </>
  );
}