import { motion } from 'framer-motion';
import { ArrowLeft, Save, Tag, DollarSign, Calendar } from 'lucide-react';
import React, { useState } from 'react';
import { Expense, UserProfile } from '../types';
import { getNeonColor } from './Dashboard';

interface AddExpenseProps {
  profile: UserProfile;
  initialDate?: string;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onBack: () => void;
}

export default function AddExpense({ profile, initialDate, onAddExpense, onBack }: AddExpenseProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(profile.categories[0] || '');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (parsedAmount > 0 && category) {
      onAddExpense({
        amount: parsedAmount,
        category: note ? `${category}: ${note}` : category,
        date: new Date(date).toISOString()
      });
      onBack();
    }
  };

  const neonColor = getNeonColor(date);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto p-6"
    >
      <header className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="p-2 border transition-colors"
            style={{ borderColor: neonColor, color: neonColor }}
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-4xl font-bold tracking-tighter" style={{ color: neonColor, textShadow: `0 0 10px ${neonColor}` }}>New Entry</h1>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Currency</span>
          <span className="text-xl font-bold" style={{ color: neonColor, textShadow: `0 0 10px ${neonColor}` }}>{profile.currency}</span>
        </div>
      </header>

      <form 
        onSubmit={handleSubmit} 
        className="space-y-8 p-8 bg-black border"
        style={{ borderColor: `${neonColor}40`, backgroundColor: `${neonColor}05` }}
      >
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-widest opacity-60 font-bold flex items-center gap-2">
            <DollarSign size={14} /> Amount
          </label>
          <input 
            autoFocus
            type="number" 
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-transparent border-b-2 outline-none py-2 text-4xl font-mono text-right transition-all"
            style={{ borderColor: `${neonColor}40`, color: neonColor }}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-widest opacity-60 font-bold flex items-center gap-2">
            <Tag size={14} /> Category
          </label>
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-black border outline-none p-3 text-xl appearance-none cursor-pointer transition-all"
            style={{ borderColor: `${neonColor}40`, color: neonColor }}
            required
          >
            {profile.categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-widest opacity-60 font-bold flex items-center gap-2">
            Note (Optional)
          </label>
          <input 
            type="text" 
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What was this for?"
            className="w-full bg-transparent border-b-2 outline-none py-2 text-xl transition-all"
            style={{ borderColor: `${neonColor}40`, color: neonColor }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-widest opacity-60 font-bold flex items-center gap-2">
            <Calendar size={14} /> Date
          </label>
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-black border outline-none p-3 text-xl cursor-pointer transition-all"
            style={{ borderColor: `${neonColor}40`, color: neonColor }}
            required
          />
        </div>

        <button 
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-4 text-lg mt-4 font-bold uppercase tracking-widest transition-all"
          style={{ 
            backgroundColor: neonColor, 
            color: '#000',
            boxShadow: `0 0 20px ${neonColor}`
          }}
        >
          <Save size={20} /> Save Spending
        </button>
      </form>
    </motion.div>
  );
}
