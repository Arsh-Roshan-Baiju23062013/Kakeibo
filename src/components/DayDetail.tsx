import { motion } from 'framer-motion';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Expense } from '../types';

interface DayDetailProps {
  date: string;
  expenses: Expense[];
  currency: string;
  onBack: () => void;
  onDeleteExpense: (id: string) => void;
}

export default function DayDetail({ date, expenses, currency, onBack, onDeleteExpense }: DayDetailProps) {
  const dayExpenses = expenses.filter(e => e.date.startsWith(date));
  const total = dayExpenses.reduce((sum, e) => sum + e.amount, 0);

  const formattedDate = new Date(date).toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto p-6"
    >
      <header className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 border border-neon-green hover:bg-neon-green hover:text-black transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-bold neon-text-glow">{formattedDate}</h1>
            <p className="opacity-60 italic">Detailed spending report</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Currency</span>
          <span className="text-xl font-bold neon-text-glow">{currency}</span>
        </div>
      </header>

      <section className="mb-12 p-10 neon-border text-center bg-neon-green/5">
        <h2 className="text-xs uppercase tracking-[0.4em] opacity-60 mb-2 font-bold">Total Spending</h2>
        <div className="text-7xl font-bold neon-text-glow">
          {currency}{total.toFixed(2)}
        </div>
      </section>

      <div className="space-y-4">
        {dayExpenses.map((expense, idx) => (
          <motion.div 
            key={expense.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * idx }}
            className="flex justify-between items-center p-5 border border-neon-green/10 bg-neon-green/5"
          >
            <div>
              <div className="text-xl font-bold">{expense.category}</div>
              <div className="text-xs opacity-40 font-mono">{new Date(expense.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-2xl font-bold font-mono">{currency}{expense.amount.toFixed(2)}</div>
              <button 
                onClick={() => expense.id && onDeleteExpense(expense.id)} 
                className="text-neon-green/40 hover:text-red-500 transition-colors p-1"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </motion.div>
        ))}

        {dayExpenses.length === 0 && (
          <div className="text-center py-20 opacity-40 italic border border-dashed border-neon-green/20">
            No entries for this day.
          </div>
        )}
      </div>
    </motion.div>
  );
}
