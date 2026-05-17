'use client';

import { useState, useEffect } from 'react';
import { Expense } from '@/types';
import { storage, STORAGE_KEYS } from '@/lib/storage';

interface ExpenseModalProps {
  expense: Expense;
  onClose: () => void;
}

export default function ExpenseModal({ expense, onClose }: ExpenseModalProps) {
  const [name, setName] = useState(expense.name);
  const [amount, setAmount] = useState(expense.amount.toString());
  const [quantity, setQuantity] = useState(expense.quantity.toString());

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter an expense name');
      return;
    }

    const amountNum = parseFloat(amount);
    const qtyNum = parseInt(quantity);

    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (isNaN(qtyNum) || qtyNum < 1) {
      alert('Please enter a valid quantity');
      return;
    }

    const expenses: Expense[] = storage.get(STORAGE_KEYS.EXPENSES) || [];
    
    const updated = expenses.map(exp => {
      if (exp.id === expense.id) {
        return {
          ...exp,
          name: name.trim(),
          amount: amountNum,
          quantity: qtyNum,
        };
      }
      return exp;
    });

    storage.set(STORAGE_KEYS.EXPENSES, updated);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="modal active" 
      id="modalExpense"
      onClick={handleBackdropClick}
    >
      <div className="modal-content">
        <h3>Edit Expense</h3>
        <div className="row">
          <span>Name</span>
          <input
            id="mExpName"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="row">
          <span>Price $</span>
          <input
            type="number"
            id="mExpPrice"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="0.01"
          />
        </div>
        <div className="row">
          <span>Quantity</span>
          <input
            type="number"
            id="mExpQty"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="1"
            step="1"
          />
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button className="btn-primary" onClick={handleSave}>
            Save
          </button>
          <button
            style={{
              background: '#3a3a3c',
              color: 'white',
              padding: '14px',
              borderRadius: '12px',
              flex: 1,
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
            }}
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}