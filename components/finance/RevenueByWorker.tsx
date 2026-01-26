'use client';

import { useEffect, useState } from 'react';
import { Appointment } from '@/types';
import { storage, STORAGE_KEYS, storageMode } from '@/lib/storage';
import { supabase } from '@/lib/supabase';

interface RevenueByWorkerProps {
  month: string;
}

export default function RevenueByWorker({ month }: RevenueByWorkerProps) {
  const [dinaRevenue, setDinaRevenue] = useState(0);
  const [kidaRevenue, setKidaRevenue] = useState(0);

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

    const dinaTotal = appointments
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

    const kidaTotal = appointments
      .filter(apt => {
        const [aptYear, aptMonth] = apt.date.split('-');
        return (
          aptYear === year &&
          aptMonth === monthNum &&
          apt.worker === 'kida' &&
          apt.is_done
        );
      })
      .reduce((sum, apt) => sum + apt.price, 0);

    setDinaRevenue(dinaTotal);
    setKidaRevenue(kidaTotal);
  };

  return (
    <div className="card">
      <h3>Revenue by Worker</h3>

      <div className="service-card">
        <span>Dina</span>
        <strong>${dinaRevenue.toFixed(2)}</strong>
      </div>

      <div className="service-card">
        <span>Kida</span>
        <strong>${kidaRevenue.toFixed(2)}</strong>
      </div>
    </div>
  );
}