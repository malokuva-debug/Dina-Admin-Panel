'use client';

import { useEffect, useState } from 'react';
import { Appointment, Expense } from '@/types';
import { storage, STORAGE_KEYS } from '@/lib/storage';

interface FinanceOverviewProps {
  month: string; // YYYY-MM
}

export default function FinanceOverview({ month }: FinanceOverviewProps) {
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
  }, [month]);

  const loadFinanceData = () => {
    const appointments: Appointment[] =
      storage.get(STORAGE_KEYS.APPOINTMENTS) || [];
    const expenses: Expense[] = storage.get(STORAGE_KEYS.EXPENSES) || [];

    const [year, monthNum] = month.split('-');
    const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    /** ---------------- REVENUE ---------------- */
    const doneAppointments = appointments.filter(a => a.is_done);

    // Normalize date to YYYY-MM-DD in case time exists
    const normalizeDate = (dateStr: string) => dateStr.split('T')[0];

    // Today's revenue
    const todayRevenue = doneAppointments
      .filter(a => normalizeDate(a.date) === todayStr)
      .reduce((sum, a) => sum + a.price, 0);

    // Month revenue
    const monthRevenue = doneAppointments
      .filter(a => {
        const [y, m] = normalizeDate(a.date).split('-');
        return Number(y) === Number(year) && Number(m) === Number(monthNum);
      })
      .reduce((sum, a) => sum + a.price, 0);

    // Month expenses
    const monthExpenses = expenses
      .filter(e => {
        const [y, m] = e.date.split('-');
        return Number(y) === Number(year) && Number(m) === Number(monthNum);
      })
      .reduce((sum, e) => sum + e.amount * e.quantity, 0);

    // Total revenue & expenses
    const totalRevenue = doneAppointments.reduce((sum, a) => sum + a.price, 0);
    const totalExpenses = expenses.reduce(
      (sum, e) => sum + e.amount * e.quantity,
      0
    );

    // Set state
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