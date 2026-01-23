'use client';

import { useState } from 'react';
import { Worker, Expense } from '@/types';
import { storage, STORAGE_KEYS } from '@/lib/storage';

interface ExpenseFormProps {
  worker: Worker;
  month: string;
  onExpenseAdded?: () => void;
}

export default function ExpenseForm({ worker, month, onExpenseAdded }: ExpenseFormProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [quantity, setQuantity] = useState('1');

  const handleSubmit = () => {
    if (!name.trim() || !amount || parseFloat(amount) <= 0) {
      alert('Please fill in all fields with valid values');
      return;
    }

    const expenses: Expense[] = storage.get(STORAGE_KEYS.EXPENSES) || [];
    
    const newExpense: Expense = {
      id: Date.now().toString(),
      name: name.trim(),
      amount: parseFloat(amount),
      quantity: parseInt(quantity) || 1,
      date: new Date().toISOString().split('T')[0],
      worker: worker,
    };

    storage.set(STORAGE_KEYS.EXPENSES, [...expenses, newExpense]);

    // Reset form
    setName('');
    setAmount('');
    setQuantity('1');

    // Notify parent
    if (onExpenseAdded) {
      onExpenseAdded();
    }

    alert('Expense added successfully');
  };

  return (
    <div className="card">
      <h3>Add Expense</h3>
      <input
        id="expName"
        placeholder="Expense name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        id="expAmount"
        type="number"
        placeholder="Amount"
        min="0"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <input
        id="expQty"
        type="number"
        placeholder="Quantity"
        min="1"
        step="1"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
      />
      <button className="btn-primary" onClick={handleSubmit}>
        Add Expense
      </button>
    </div>
  );
}