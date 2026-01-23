'use client';

import { useEffect, useState } from 'react';
import { Appointment } from '@/types';
import { storage, STORAGE_KEYS } from '@/lib/storage';

interface RevenueByWorkerProps {
  month: string;
}

export default function RevenueByWorker({ month }: RevenueByWorkerProps) {
  const [dinaRevenue, setDinaRevenue] = useState(0);
  const [kidaRevenue, setKidaRevenue] = useState(0);

  useEffect(() => {
    calculateRevenue();
  }, [month]);

  const calculateRevenue = () => {
    const appointments: Appointment[] = storage.get(STORAGE_KEYS.APPOINTMENTS) || [];
    const [year, monthNum] = month.split('-');

    const dinaTotal = appointments
      .filter(apt => {
        const [aptYear, aptMonth] = apt.date.split('-');
        return aptYear === year && aptMonth === monthNum && apt.worker === 'dina';
      })
      .reduce((sum, apt) => sum + apt.price, 0);

    const kidaTotal = appointments
      .filter(apt => {
        const [aptYear, aptMonth] = apt.date.split('-');
        return aptYear === year && aptMonth === monthNum && apt.worker === 'kida';
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