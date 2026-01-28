'use client';

import { useEffect, useState } from 'react';
import { Worker } from '@/types';
import { supabase } from '@/lib/supabase';

interface BusinessHoursProps {
  worker: Worker;
}

export default function BusinessHours({ worker }: BusinessHoursProps) {
  const [loading, setLoading] = useState(false);

  const [hours, setHours] = useState({
    open: '09:00',
    close: '17:00',
    lunchEnabled: true,
    lunchStart: '12:00',
    lunchEnd: '13:00',
  });

  // 🔹 Load from Supabase
  useEffect(() => {
    loadHours();
  }, [worker]);

  const loadHours = async () => {
    const { data, error } = await supabase
      .from('business_hours')
      .select('*')
      .eq('worker', worker)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error(error);
      return;
    }

    if (data) {
      setHours({
        open: data.open,
        close: data.close,
        lunchEnabled: data.lunch_enabled,
        lunchStart: data.lunch_start ?? '12:00',
        lunchEnd: data.lunch_end ?? '13:00',
      });
    }
  };

  // 🔹 Save to Supabase
  const saveHours = async () => {
    // Validation
    if (hours.open >= hours.close) {
      alert('Opening time must be before closing time');
      return;
    }

    if (hours.lunchEnabled) {
      if (hours.lunchStart >= hours.lunchEnd) {
        alert('Lunch start must be before lunch end');
        return;
      }

      if (
        hours.lunchStart < hours.open ||
        hours.lunchEnd > hours.close
      ) {
        alert('Lunch must be within business hours');
        return;
      }
    }

    setLoading(true);

    const { error } = await supabase
      .from('business_hours')
      .upsert({
        worker,
        open: hours.open,
        close: hours.close,
        lunch_enabled: hours.lunchEnabled,
        lunch_start: hours.lunchEnabled ? hours.lunchStart : null,
        lunch_end: hours.lunchEnabled ? hours.lunchEnd : null,
      });

    setLoading(false);

    if (error) {
      console.error(error);
      alert('Failed to save business hours');
      return;
    }

    alert('Business hours saved');
  };

  return (
    <>
      <h2 className="section-title">Business Hours</h2>

      <div className="card">
        <div className="row">
          <span>Open</span>
          <input
            type="time"
            value={hours.open}
            onChange={(e) => setHours({ ...hours, open: e.target.value })}
          />
        </div>

        <div className="row">
          <span>Close</span>
          <input
            type="time"
            value={hours.close}
            onChange={(e) => setHours({ ...hours, close: e.target.value })}
          />
        </div>

        <hr />

        {/* 🔹 Lunch Toggle */}
        <div className="row">
          <span>Lunch Break</span>
          <input
            type="checkbox"
            checked={hours.lunchEnabled}
            onChange={(e) =>
              setHours({ ...hours, lunchEnabled: e.target.checked })
            }
          />
        </div>

        {hours.lunchEnabled && (
          <>
            <div className="row">
              <span>Lunch Start</span>
              <input
                type="time"
                value={hours.lunchStart}
                onChange={(e) =>
                  setHours({ ...hours, lunchStart: e.target.value })
                }
              />
            </div>

            <div className="row">
              <span>Lunch End</span>
              <input
                type="time"
                value={hours.lunchEnd}
                onChange={(e) =>
                  setHours({ ...hours, lunchEnd: e.target.value })
                }
              />
            </div>
          </>
        )}

        <button
          className="btn-primary"
          style={{ marginTop: 16 }}
          onClick={saveHours}
          disabled={loading}
        >
          {loading ? 'Saving…' : 'Save Hours'}
        </button>
      </div>
    </>
  );
}