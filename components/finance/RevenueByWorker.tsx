'use client';

import { useEffect, useState } from 'react';
import { Appointment } from '@/types';
import { storage, STORAGE_KEYS, storageMode } from '@/lib/storage';
import { supabase } from '@/lib/supabase';

interface RevenueByWorkerProps {
  month: string;
}

export default function RevenueByWorker({ month }: RevenueByWorkerProps) {
  const [revenue, setRevenue] = useState(0);

  useEffect(() => {
    calculateRevenue();
  }, [month]);

  const calculateRevenue = async () => {
    const [year, monthNum] = month.split('-');

    let appointments: Appointment[] = [];

    if (storageMode === 'supabase') {
      const { data, error } = await supabase
        .from('appointments')
        .select('price, date, worker, is_done')
        .eq('is_done', true);

      if (error) {
        console.error('Revenue fetch error:', error);
        return;
      }

      appointments = data as Appointment[];
    } else {
      appointments = storage.get(STORAGE_KEYS.APPOINTMENTS) || [];
    }

    const total = appointments
      .filter(apt => {
        const [aptYear, aptMonth] = apt.date.split('-');
        return (
          aptYear === year &&
          aptMonth === monthNum &&
          apt.worker === 'dina' &&
          apt.is_done
        );
      })
      .reduce((sum, apt) => sum + apt.price, 0);

    setRevenue(total);
  };

  return (
    <div className="card">
      <h3>Revenue</h3>

      <div className="service-card">
        <span>Dina</span>
        <strong>${revenue.toFixed(2)}</strong>
      </div>
    </div>
  );
}