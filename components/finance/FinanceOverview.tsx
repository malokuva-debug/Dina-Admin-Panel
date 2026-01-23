'use client';

import { useEffect, useState } from 'react';
import { Worker } from '@/types';

interface FinanceOverviewProps {
  month: string;
  worker: Worker;
}

export default function FinanceOverview({ month, worker }: FinanceOverviewProps) {
  const [today, setToday] = useState(0);
  const [monthTotal, setMonthTotal] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // Load finance data from your storage/API
    loadFinanceData();
  }, [month, worker]);

  const loadFinanceData = async () => {
    // Implement your data loading logic here
    // This would fetch from your backend or localStorage
    try {
      // Example: const data = await fetch('/api/finance').then(r => r.json());
      // setToday(data.today);
      // setMonthTotal(data.month);
      // setTotal(data.total);
    } catch (error) {
      console.error('Error loading finance data:', error);
    }
  };

  return (
    <div className="card">
      <h3>Overview</h3>
      <div className="service-card">
        <span>Today</span>
        <strong>${today.toFixed(2)}</strong>
      </div>
      <div className="service-card">
        <span>This Month (after expenses)</span>
        <strong>${monthTotal.toFixed(2)}</strong>
      </div>
      <div className="service-card">
        <span>Total</span>
        <strong>${total.toFixed(2)}</strong>
      </div>
    </div>
  );
}