'use client';

import { useEffect, useState } from 'react';
import { Worker, Expense } from '@/types';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import ExpenseModal from '@/components/modals/ExpenseModal';

interface ExpensesListProps {
  month: string;
  worker: Worker;
}

export default function ExpensesList({ month, worker }: ExpensesListProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load expenses on mount, month change, worker change, and on "expenses-updated" event
  useEffect(() => {
    loadExpenses();

    const handler = () => loadExpenses();
    window.addEventListener('expenses-updated', handler);

    return () => {
      window.removeEventListener('expenses-updated', handler);
    };
  }, [month, worker]);

  const loadExpenses = () => {
    const allExpenses: Expense[] = storage.get(STORAGE_KEYS.EXPENSES) || [];
    const [year, monthNum] = month.split('-');

    const filtered = allExpenses.filter(exp => {
      const [expYear, expMonth] = exp.date.split('-');
      return expYear === year && expMonth === monthNum && exp.worker === worker;
    });

    // Sort by date (newest first)
    filtered.sort((a, b) => b.date.localeCompare(a.date));

    setExpenses(filtered);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this expense?')) return;

    const allExpenses: Expense[] = storage.get(STORAGE_KEYS.EXPENSES) || [];
    storage.set(
      STORAGE_KEYS.EXPENSES,
      allExpenses.filter(exp => exp.id !== id)
    );

    // Notify all listeners to reload
    window.dispatchEvent(new Event('expenses-updated'));
  };

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedExpense(null);

    // Notify all listeners to reload
    window.dispatchEvent(new Event('expenses-updated'));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <>
      <div className="card">
        <h3>Expenses</h3>
        <div id="expensesList">
          {expenses.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#888', padding: '20px 0' }}>
              No expenses for this month
            </p>
          ) : (
            expenses.map(exp => (
              <div
                key={exp.id}
                className="service-card"
                style={{ flexDirection: 'column', alignItems: 'stretch', padding: '15px 0' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <strong style={{ fontSize: '16px' }}>{exp.name}</strong>
                    <div style={{ color: '#888', fontSize: '13px', marginTop: '4px' }}>
                      {formatDate(exp.date)} • Qty: {exp.quantity}
                    </div>
                  </div>
                  <strong style={{ fontSize: '16px', color: '#ff3b30' }}>
                    -${(exp.amount * exp.quantity).toFixed(2)}
                  </strong>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <button
                    onClick={() => handleEdit(exp)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: '#007aff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(exp.id)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: '#ff3b30',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {isModalOpen && selectedExpense && (
        <ExpenseModal
          expense={selectedExpense}
          onClose={handleModalClose}
        />
      )}
    </>
  );
}