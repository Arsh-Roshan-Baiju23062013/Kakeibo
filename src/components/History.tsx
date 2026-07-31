import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { Expense } from '../types';

interface HistoryProps {
  expenses: Expense[];
  currency: string;
  onBack: () => void;
  onSelectDay: (date: string) => void;
}

export default function History({ expenses, currency, onBack, onSelectDay }: HistoryProps) {
  // Group expenses by date
  const grouped = expenses.reduce((acc, expense) => {
    const date = expense.date.split('T')[0];
    if (!acc[date]) acc[date] = 0;
    acc[date] += expense.amount;
    return acc;
  }, {} as Record<string, number>);

  // Sort dates descending
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="max-w-4xl mx-auto p-6"
    >
      <header className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 border border-neon-green hover:bg-neon-green hover:text-black transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-4xl font-bold neon-text-glow">Spending History</h1>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Currency</span>
          <span className="text-xl font-bold neon-text-glow">{currency}</span>
        </div>
      </header>

      <div className="space-y-4">
        {sortedDates.map((dateStr, idx) => {
          const date = new Date(dateStr);
          const formattedDate = date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          });
          const year = date.getFullYear();
          const total = grouped[dateStr];

          return (
            <motion.button
              key={dateStr}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.02, x: 5 }}
              onClick={() => onSelectDay(dateStr)}
              className="w-full flex justify-between items-center p-6 neon-border bg-neon-green/5 hover:bg-neon-green/10 transition-all text-left"
            >
              <div>
                <div className="text-2xl font-bold tracking-tight">{formattedDate}</div>
                <div className="text-xs uppercase tracking-widest opacity-40">{year}</div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-xs uppercase tracking-widest opacity-40 mb-1">Total Spending</div>
                  <div className="text-3xl font-bold neon-text-glow">{currency}{total.toFixed(2)}</div>
                </div>
                <ChevronRight size={24} className="opacity-40" />
              </div>
            </motion.button>
          );
        })}

        {sortedDates.length === 0 && (
          <div className="text-center py-20 opacity-40 italic border border-dashed border-neon-green/20">
            No history found. Start tracking today!
          </div>
        )}
      </div>
    </motion.div>
  );
}
