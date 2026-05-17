'use client';

import { useState } from 'react';
import { Worker, Expense } from '@/types';
import { storage, STORAGE_KEYS, storageMode } from '@/lib/storage';
import { supabase } from '@/lib/supabase';

interface ExpenseFormProps {
  worker: Worker;
  month: string;
  onExpenseAdded?: () => void;
}

export default function ExpenseForm({ worker, month, onExpenseAdded }: ExpenseFormProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !amount || parseFloat(amount) <= 0) {
      alert('Please fill in all fields with valid values');
      return;
    }

    setIsSubmitting(true);

    try {
      const newExpense: Expense = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        name: name.trim(),
        amount: parseFloat(amount),
        quantity: parseInt(quantity) || 1,
        date: new Date().toISOString().split('T')[0],
        worker: worker,
      };

      if (storageMode === 'supabase') {
        // Add to Supabase
        const { data, error } = await supabase
          .from('expenses')
          .insert([{
            id: newExpense.id,
            name: newExpense.name,
            amount: newExpense.amount,
            quantity: newExpense.quantity,
            date: newExpense.date,
            worker: newExpense.worker,
          }])
          .select();

        if (error) {
          console.error('Supabase insert error:', error);
          alert('Failed to add expense to database');
          return;
        }

        console.log('Expense added to Supabase:', data);
      } else {
        // Add to local storage
        const expenses: Expense[] = storage.get(STORAGE_KEYS.EXPENSES) || [];
        storage.set(STORAGE_KEYS.EXPENSES, [...expenses, newExpense]);
      }

      // Reset form
      setName('');
      setAmount('');
      setQuantity('1');

      // Notify all listeners to reload
      window.dispatchEvent(new Event('expenses-updated'));

      // Notify parent
      if (onExpenseAdded) {
        onExpenseAdded();
      }

      alert('Expense added successfully');
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('An error occurred while adding the expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h3>Add Expense</h3>
      <input
        id="expName"
        placeholder="Expense name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={isSubmitting}
      />
      <input
        id="expAmount"
        type="number"
        placeholder="Amount"
        min="0"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        disabled={isSubmitting}
      />
      <input
        id="expQty"
        type="number"
        placeholder="Quantity"
        min="1"
        step="1"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        disabled={isSubmitting}
      />
      <button 
        className="btn-primary" 
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Adding...' : 'Add Expense'}
      </button>
    </div>
  );
}
