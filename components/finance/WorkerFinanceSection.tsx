'use client';

import { useEffect, useState } from 'react';
import { Worker } from '@/types';
import { supabase } from '@/lib/supabase';

interface WorkerFinanceSectionProps {
  worker: Worker;
}

export default function WorkerFinanceSection({ worker }: WorkerFinanceSectionProps) {
  const [revenue, setRevenue] = useState(0);

  useEffect(() => {
    const loadRevenue = async () => {
      // Fetch appointments for this worker only
      const { data, error } = await supabase
        .from('appointments')
        .select('price')
        .eq('worker', worker)
        .eq('is_done', true); // only completed appointments

      if (error) {
        console.error('Failed to load revenue:', error);
        return;
      }

      const totalRevenue = data?.reduce((sum, appointment) => sum + (appointment.price || 0), 0) || 0;
      setRevenue(totalRevenue);
    };

    loadRevenue();
  }, [worker]);

  return (
    <div>
      <h2>Your Revenue</h2>
      <p>${revenue.toFixed(2)}</p>
      {/* No expenses, no export buttons */}
    </div>
  );
}