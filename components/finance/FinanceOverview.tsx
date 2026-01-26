'use client';

import { useEffect, useState } from 'react';
import { Worker, Appointment, Expense } from '@/types';
import { storage, STORAGE_KEYS } from '@/lib/storage';

interface FinanceOverviewProps {
  month: string;
  worker: Worker;
}

export default function FinanceOverview({ month, worker }: FinanceOverviewProps) {
  const [today, setToday] = useState(0);
  const [monthTotal, setMonthTotal] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // Load finance data initially
    loadFinanceData();

    // Listen for changes in appointments or expenses
    const handler = () => loadFinanceData();
    window.addEventListener('appointments-updated', handler);
    window.addEventListener('expenses-updated', handler);

    return () => {
      window.removeEventListener('appointments-updated', handler);
      window.removeEventListener('expenses-updated', handler);
    };
  }, [month, worker]);

  const loadFinanceData = () => {
    const allAppointments: Appointment[] = storage.get(STORAGE_KEYS.APPOINTMENTS) || [];
    const allExpenses: Expense[] = storage.get(STORAGE_KEYS.EXPENSES) || [];
    const [year, monthNum] = month.split('-');

    // Filter appointments for this worker, month, and only done ones
    const filteredAppointments = allAppointments.filter(apt => {
      const [aptYear, aptMonth] = apt.date.split('-');
      return aptYear === year && aptMonth === monthNum && apt.worker === worker && apt.is_done;
    });

    // Filter expenses for this worker and month
    const filteredExpenses = allExpenses.filter(exp => {
      const [expYear, expMonth] = exp.date.split('-');
      return expYear === year && expMonth === monthNum && exp.worker === worker;
    });

    // Calculate totals
    const totalRevenue = filteredAppointments.reduce((sum, apt) => sum + apt.price, 0);
    const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount * exp.quantity, 0);

    // Today’s revenue (from appointments done today)
    const todayDate = new Date().toISOString().slice(0, 10);
    const todayRevenue = filteredAppointments
      .filter(apt => apt.date === todayDate)
      .reduce((sum, apt) => sum + apt.price, 0);

    setToday(todayRevenue);
    setMonthTotal(totalRevenue - totalExpenses);
    setTotal(totalRevenue - totalExpenses); // Total could be lifetime or same as month; adjust if needed
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