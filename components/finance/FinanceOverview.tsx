'use client';

import { useState } from 'react';
import FinanceOverview from './finance/FinanceOverview';
import RevenueByWorker from './finance/RevenueByWorker';
import ExpenseForm from './finance/ExpenseForm';
import ExpensesList from './finance/ExpensesList';
import { Worker } from '@/types';

interface FinanceSectionProps {
  workers: Worker[];
}

export default function FinanceSection({ workers }: FinanceSectionProps) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  const [worker, setWorker] = useState<Worker>(workers[0]);

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMonth(e.target.value);
  };

  const handleWorkerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = workers.find(w => w.id === e.target.value);
    if (selected) setWorker(selected);
  };

  return (
    <div className="finance-section">
      {/* Month selector */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <label>
          Month: 
          <input 
            type="month" 
            value={selectedMonth} 
            onChange={handleMonthChange} 
            style={{ marginLeft: '8px', padding: '4px 8px' }}
          />
        </label>

        {/* Worker selector */}
        <label>
          Worker: 
          <select value={worker.id} onChange={handleWorkerChange} style={{ marginLeft: '8px', padding: '4px 8px' }}>
            {workers.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Overview for all workers */}
      <FinanceOverview month={selectedMonth} />

      {/* Revenue breakdown per worker */}
      <RevenueByWorker month={selectedMonth} />

      {/* Expense form for selected worker */}
      <ExpenseForm worker={worker} month={selectedMonth} />

      {/* Expenses list for selected worker */}
      <ExpensesList month={selectedMonth} worker={worker} />
    </div>
  );
}