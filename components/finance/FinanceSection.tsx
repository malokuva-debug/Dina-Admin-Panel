'use client';

import { useState } from 'react';
import { Worker } from '@/types';
import FinanceOverview from './FinanceOverview';
import RevenueByWorker from './RevenueByWorker';
import ExpenseForm from './ExpenseForm';
import ExpensesList from './ExpensesList';
import ExportReports from './ExportReports';

interface FinanceSectionProps {
  worker: Worker;
}

export default function FinanceSection({ worker }: FinanceSectionProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );

  return (
    <div id="finance">
      <h2>Finance</h2>
      <input
        type="month"
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '15px',
          alignItems: 'center',
          width: '92%',
        }}
      />

      <FinanceOverview month={selectedMonth} worker={worker} />
      <RevenueByWorker month={selectedMonth} />
      <ExpenseForm worker={worker} month={selectedMonth} />
      <ExpensesList month={selectedMonth} worker={worker} />
      <ExportReports />
    </div>
  );
}