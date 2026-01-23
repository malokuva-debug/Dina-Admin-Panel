import { useState, useEffect } from 'react';
import { Appointment, Expense, Worker, FinanceData } from '@/types';
import { storage, STORAGE_KEYS } from '@/lib/storage';

export function useFinance(month: string, worker?: Worker) {
  const [financeData, setFinanceData] = useState<FinanceData>({
    today: 0,
    month: 0,
    total: 0,
    byWorker: {
      dina: 0,
      kida: 0,
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateFinance();
  }, [month, worker]);

  const calculateFinance = () => {
    setLoading(true);
    
    try {
      const appointments: Appointment[] = storage.get(STORAGE_KEYS.APPOINTMENTS) || [];
      const expenses: Expense[] = storage.get(STORAGE_KEYS.EXPENSES) || [];

      const today = new Date().toISOString().split('T')[0];
      const [year, monthNum] = month.split('-');

      // Calculate today's revenue
      const todayRevenue = appointments
        .filter(apt => apt.date === today && (!worker || apt.worker === worker))
        .reduce((sum, apt) => sum + apt.price, 0);

      // Calculate month revenue
      const monthAppointments = appointments.filter(apt => {
        const [aptYear, aptMonth] = apt.date.split('-');
        return aptYear === year && aptMonth === monthNum && (!worker || apt.worker === worker);
      });

      const monthRevenue = monthAppointments.reduce((sum, apt) => sum + apt.price, 0);

      // Calculate month expenses
      const monthExpenses = expenses
        .filter(exp => {
          const [expYear, expMonth] = exp.date.split('-');
          return expYear === year && expMonth === monthNum && (!worker || exp.worker === worker);
        })
        .reduce((sum, exp) => sum + exp.amount * exp.quantity, 0);

      // Calculate total revenue (all time)
      const totalRevenue = appointments
        .filter(apt => !worker || apt.worker === worker)
        .reduce((sum, apt) => sum + apt.price, 0);

      // Calculate revenue by worker
      const dinaRevenue = appointments
        .filter(apt => {
          const [aptYear, aptMonth] = apt.date.split('-');
          return aptYear === year && aptMonth === monthNum && apt.worker === 'dina';
        })
        .reduce((sum, apt) => sum + apt.price, 0);

      const kidaRevenue = appointments
        .filter(apt => {
          const [aptYear, aptMonth] = apt.date.split('-');
          return aptYear === year && aptMonth === monthNum && apt.worker === 'kida';
        })
        .reduce((sum, apt) => sum + apt.price, 0);

      setFinanceData({
        today: todayRevenue,
        month: monthRevenue - monthExpenses,
        total: totalRevenue,
        byWorker: {
          dina: dinaRevenue,
          kida: kidaRevenue,
        },
      });
    } catch (error) {
      console.error('Error calculating finance:', error);
    } finally {
      setLoading(false);
    }
  };

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const expenses: Expense[] = storage.get(STORAGE_KEYS.EXPENSES) || [];
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
    };
    
    storage.set(STORAGE_KEYS.EXPENSES, [...expenses, newExpense]);
    calculateFinance();
    
    return newExpense;
  };

  const deleteExpense = (id: string) => {
    const expenses: Expense[] = storage.get(STORAGE_KEYS.EXPENSES) || [];
    storage.set(
      STORAGE_KEYS.EXPENSES,
      expenses.filter(exp => exp.id !== id)
    );
    calculateFinance();
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    const expenses: Expense[] = storage.get(STORAGE_KEYS.EXPENSES) || [];
    storage.set(
      STORAGE_KEYS.EXPENSES,
      expenses.map(exp => (exp.id === id ? { ...exp, ...updates } : exp))
    );
    calculateFinance();
  };

  return {
    financeData,
    loading,
    addExpense,
    deleteExpense,
    updateExpense,
    refresh: calculateFinance,
  };
}