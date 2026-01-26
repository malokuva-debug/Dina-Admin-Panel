'use client';

import { useEffect, useState } from 'react';
import { Worker } from '@/types';
import { supabase } from '@/lib/supabase';

interface FinanceOverviewProps {
  month: string; // YYYY-MM
  worker: Worker;
}

export default function FinanceOverview({ month, worker }: FinanceOverviewProps) {
  const [today, setToday] = useState(0);
  const [monthTotal, setMonthTotal] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadFinanceData();
  }, [month, worker]);

  const loadFinanceData = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('price, date, is_done')
        .eq('worker', worker.name)
        .eq('is_done', true);

      if (error) throw error;
      if (!data) return;

      const todayStr = new Date().toISOString().slice(0, 10);

      let todaySum = 0;
      let monthSum = 0;
      let totalSum = 0;

      data.forEach((apt) => {
        totalSum += apt.price;

        if (apt.date === todayStr) {
          todaySum += apt.price;
        }

        if (apt.date.startsWith(month)) {
          monthSum += apt.price;
        }
      });

      setToday(todaySum);
      setMonthTotal(monthSum);
      setTotal(totalSum);
    } catch (err) {
      console.error('Finance load error:', err);
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
        <span>This Month</span>
        <strong>${monthTotal.toFixed(2)}</strong>
      </div>

      <div className="service-card">
        <span>Total</span>
        <strong>${total.toFixed(2)}</strong>
      </div>
    </div>
  );
}