'use client';

import { useEffect, useState } from 'react';
import { Worker, Appointment, Expense } from '@/types';
import { storage, STORAGE_KEYS, storageMode } from '@/lib/storage';
import { supabase } from '@/lib/supabase';

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

  const loadFinanceData = async () => {
    const [year, monthNum] = month.split('-');

    let appointments: Appointment[] = [];
    let expenses: Expense[] = [];

    /** ---------------- FETCH DATA ---------------- */
    if (storageMode === 'supabase') {
      // Fetch appointments from Supabase - only get done appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('is_done', true);

      if (appointmentsError) {
        console.error('Appointments fetch error:', appointmentsError);
      } else {
        appointments = appointmentsData as Appointment[];
      }

      // Fetch expenses from Supabase - get all expenses for business overview
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*');

      if (expensesError) {
        console.error('Expenses fetch error:', expensesError);
      } else {
        expenses = expensesData as Expense[];
      }
    } else {
      // Use local storage
      appointments = storage.get(STORAGE_KEYS.APPOINTMENTS) || [];
      expenses = storage.get(STORAGE_KEYS.EXPENSES) || [];
      
      // Filter only done appointments
      appointments = appointments.filter(a => a.is_done);
    }

    /** ---------------- REVENUE CALCULATIONS ---------------- */
    const todayRevenue = appointments
      .filter(a => new Date(a.date).toDateString() === new Date().toDateString())
      .reduce((sum, a) => sum + a.price, 0);

    const monthRevenue = appointments
      .filter(a => {
        const [y, m] = a.date.split('-');
        return Number(y) === Number(year) && Number(m) === Number(monthNum);
      })
      .reduce((sum, a) => sum + a.price, 0);

    const monthExpenses = expenses
      .filter(e => {
        const [y, m] = e.date.split('-');
        return Number(y) === Number(year) && Number(m) === Number(monthNum);
      })
      .reduce((sum, e) => sum + e.amount * e.quantity, 0);

    const totalRevenue = appointments.reduce((sum, a) => sum + a.price, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount * e.quantity, 0);

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
