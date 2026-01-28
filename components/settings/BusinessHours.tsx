'use client';

import { useEffect, useState } from 'react';
import { Worker } from '@/types';
import { supabase } from '@/lib/supabase';

interface Props {
  worker: Worker;
}

export default function BusinessHours({ worker }: Props) {
  const [loading, setLoading] = useState(false);

  const [hours, setHours] = useState<BusinessHoursState>({
    open: '09:00',
    close: '17:00',
    lunchEnabled: true,
    lunchStart: '12:00',
    lunchEnd: '13:00',
  });

  // Load
  useEffect(() => {
    load();
  }, [worker]);

  async function load() {
    const { data, error } = await supabase
      .from('business_hours')
      .select('*')
      .eq('worker', worker)
      .single();

    if (error) return console.error(error);

    setHours({
      open: data.open.slice(0, 5),
      close: data.close.slice(0, 5),
      lunchEnabled: data.lunch_enabled,
      lunchStart: data.lunch_start?.slice(0, 5) || '12:00',
      lunchEnd: data.lunch_end?.slice(0, 5) || '13:00',
    });
  }

  async function save() {
    if (hours.open >= hours.close) {
      alert('Open must be before close');
      return;
    }

    if (hours.lunchEnabled && hours.lunchStart >= hours.lunchEnd) {
      alert('Lunch start must be before lunch end');
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('business_hours')
      .update({
        open: hours.open,
        close: hours.close,
        lunch_enabled: hours.lunchEnabled,
        lunch_start: hours.lunchEnabled ? hours.lunchStart : null,
        lunch_end: hours.lunchEnabled ? hours.lunchEnd : null,
        updated_at: new Date().toISOString(),
      })
      .eq('worker', worker);

    setLoading(false);

    if (error) {
      console.error(error);
      alert('Failed to save');
    } else {
      alert('Saved');
    }
  }

  return (
    <>
      <h2 className="section-title">Business Hours</h2>

      <div className="card">
        <div className="row">
          <span>Open</span>
          <input
            type="time"
            value={hours.open}
            onChange={e => setHours({ ...hours, open: e.target.value })}
          />
        </div>

        <div className="row">
          <span>Close</span>
          <input
            type="time"
            value={hours.close}
            onChange={e => setHours({ ...hours, close: e.target.value })}
          />
        </div>

        <hr />

        {/* 🍏 Apple-style toggle */}
        <div className="row">
          <span>Lunch Break</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={hours.lunchEnabled}
              onChange={e =>
                setHours({ ...hours, lunchEnabled: e.target.checked })
              }
            />
            <span className="slider" />
          </label>
        </div>

        {hours.lunchEnabled && (
          <>
            <div className="row">
              <span>Lunch Start</span>
              <input
                type="time"
                value={hours.lunchStart}
                onChange={e =>
                  setHours({ ...hours, lunchStart: e.target.value })
                }
              />
            </div>

            <div className="row">
              <span>Lunch End</span>
              <input
                type="time"
                value={hours.lunchEnd}
                onChange={e =>
                  setHours({ ...hours, lunchEnd: e.target.value })
                }
              />
            </div>
          </>
        )}

        <button className="btn-primary" onClick={save} disabled={loading}>
          {loading ? 'Saving…' : 'Save'}
        </button>
      </div>
    </>
  );
}