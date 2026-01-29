'use client';

import { useEffect, useState } from 'react';
import { Worker, Appointment, Expense } from '@/types';
import { storage, STORAGE_KEYS } from '@/lib/storage';

interface FinanceOverviewProps {
  month: string; // YYYY-MM
  worker: Worker;
}

export default function FinanceOverview({ month, worker }: FinanceOverviewProps) {
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [monthRevenue, setMonthRevenue] = useState(0);
  const [monthExpenses, setMonthExpenses] = useState(0);
  const [monthNet, setMonthNet] = useState(0);
  const [totalNet, setTotalNet] = useState(0);

  useEffect(() => {
    loadFinanceData();

    const handler = () => loadFinanceData();
    window.addEventListener('appointments-updated', handler);
    window.addEventListener('expenses-updated', handler);

    return () => {
      window.removeEventListener('appointments-updated', handler);
      window.removeEventListener('expenses-updated', handler);
    };
  }, [month, worker]);

  const loadFinanceData = () => {
    const appointments: Appointment[] =
      storage.get(STORAGE_KEYS.APPOINTMENTS) || [];

    const expenses: Expense[] =
      storage.get(STORAGE_KEYS.EXPENSES) || [];

    const [year, monthNum] = month.split('-');
    const today = new Date().toISOString().slice(0, 10);

    /** ---------------- REVENUE ---------------- */
    const doneAppointments = appointments.filter(
      a => a.worker === worker && a.is_done
    );

    const todayRevenue = doneAppointments
      .filter(a => a.date === today)
      .reduce((sum, a) => sum + a.price, 0);

    const monthRevenue = doneAppointments
      .filter(a => {
        const [y, m] = a.date.split('-');
        return y === year && m === monthNum;
      })
      .reduce((sum, a) => sum + a.price, 0);

    /** ---------------- EXPENSES ---------------- */
    const monthExpenses = expenses
      .filter(e => {
        const [y, m] = e.date.split('-');
        return y === year && m === monthNum && e.worker === worker;
      })
      .reduce((sum, e) => sum + e.amount * e.quantity, 0);

    /** ---------------- TOTAL NET ---------------- */
    const totalRevenue = doneAppointments.reduce(
      (sum, a) => sum + a.price,
      0
    );

    const totalExpenses = expenses
      .filter(e => e.worker === worker)
      .reduce((sum, e) => sum + e.amount * e.quantity, 0);

    setTodayRevenue(todayRevenue);
    setMonthRevenue(monthRevenue);
    setMonthExpenses(monthExpenses);
    setMonthNet(monthRevenue - monthExpenses);
    setTotalNet(totalRevenue - totalExpenses);
  };

  return (
    <div className="card">
      <h3>Overview</h3>

      <div className="service-card">
        <span>Today Revenue</span>
        <strong>${todayRevenue.toFixed(2)}</strong>
      </div>

      <div className="service-card">
        <span>Month Revenue</span>
        <strong>${monthRevenue.toFixed(2)}</strong>
      </div>

      <div className="service-card">
        <span>Month Expenses</span>
        <strong>${monthExpenses.toFixed(2)}</strong>
      </div>

      <div className="service-card">
        <span>Month Net</span>
        <strong>${monthNet.toFixed(2)}</strong>
      </div>

      <div className="service-card">
        <span>Total Net (All Time)</span>
        <strong>${totalNet.toFixed(2)}</strong>
      </div>
    </div>
  );
}