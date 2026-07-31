import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, LogOut, BarChart2, History, Send, Settings, Calendar, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import React, { useState } from 'react';
import { Expense, UserProfile } from '../types';

interface DashboardProps {
  profile: UserProfile;
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onDeleteExpense: (id: string) => void;
  onAddCategory: (category: string) => void;
  onDeleteCategory: (category: string) => void;
  onLogout: () => void;
  onNavigateToAnalytics: () => void;
  onNavigateToHistory: () => void;
  onNavigateToSettings: () => void;
  onNavigateToAddExpense: (date?: string) => void;
  onNavigateToEarnings: () => void;
  onNavigateToStocks: () => void;
}

export const getNeonColor = (date: string) => {
  const colors = [
    '#00FF00', // Neon Green
    '#FF00FF', // Neon Magenta
    '#00FFFF', // Neon Cyan
    '#FFFF00', // Neon Yellow
    '#FF3131', // Neon Red
    '#8A2BE2', // Neon Violet
    '#FF5F1F', // Neon Orange
    '#39FF14', // Neon Lime
    '#BC13FE', // Neon Purple
    '#0FF0FC', // Neon Electric Blue
  ];
  // Simple hash of the date string
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    hash = date.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function Dashboard({ 
  profile, 
  expenses, 
  onAddExpense, 
  onDeleteExpense, 
  onAddCategory,
  onDeleteCategory,
  onLogout,
  onNavigateToAnalytics,
  onNavigateToHistory,
  onNavigateToSettings,
  onNavigateToAddExpense,
  onNavigateToEarnings,
  onNavigateToStocks
}: DashboardProps) {
  const [newCategory, setNewCategory] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  
  // Quick Entry state
  const [quickName, setQuickName] = useState('');
  const [quickAmount, setQuickAmount] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const todayExpenses = expenses.filter(e => e.date.startsWith(today));
  const totalToday = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
  
  const todayEarnings = expenses.filter(e => false); // Placeholder as we don't have earnings here easily without passing them
  // Actually, I should pass earnings to Dashboard if I want to show stats, but for now let's just add the navigation card.

  // Live total updates as user types
  const pendingTotal = (Object.values(amounts) as string[]).reduce((sum: number, val: string) => sum + (parseFloat(val) || 0), 0) + (parseFloat(quickAmount) || 0);
  const liveTotal = totalToday + pendingTotal;

  const handleAddExpense = (category: string) => {
    const amount = parseFloat(amounts[category] || '0');
    if (amount > 0) {
      onAddExpense({
        amount,
        category,
        date: new Date().toISOString()
      });
      setAmounts(prev => ({ ...prev, [category]: '' }));
    }
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(quickAmount);
    if (quickName && amount > 0) {
      onAddExpense({
        amount,
        category: quickName,
        date: new Date().toISOString()
      });
      setQuickName('');
      setQuickAmount('');
    }
  };

  const [showMonthlySpending, setShowMonthlySpending] = useState(false);

  // Generate 7 days starting from March 22nd, 2026
  const spendingDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date('2026-03-22');
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="max-w-4xl mx-auto p-6"
    >
      <header className="flex justify-between items-center mb-12">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-4xl font-bold neon-text-glow tracking-tighter">Kakeibo: Dashboard</h1>
          <p className="opacity-60 italic">Mindful spending for {profile.name}</p>
        </motion.div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigateToAddExpense()}
            className="neon-button flex items-center gap-2 px-6 py-3 mr-4"
          >
            <Plus size={20} /> Add Spending
          </button>
          <button 
            onClick={onNavigateToSettings}
            className="flex flex-col items-end mr-2 group"
          >
            <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold group-hover:text-neon-green transition-colors">Currency</span>
            <span className="text-xl font-bold neon-text-glow group-hover:scale-110 transition-transform">{profile.currency}</span>
          </button>
          <button onClick={onNavigateToHistory} className="p-3 border border-neon-green hover:bg-neon-green hover:text-black transition-all duration-300 shadow-[0_0_10px_var(--color-neon-green-glow)]">
            <History size={20} />
          </button>
          <button onClick={onNavigateToAnalytics} className="p-3 border border-neon-green hover:bg-neon-green hover:text-black transition-all duration-300 shadow-[0_0_10px_var(--color-neon-green-glow)]">
            <BarChart2 size={20} />
          </button>
          <button onClick={onNavigateToSettings} className="p-3 border border-neon-green hover:bg-neon-green hover:text-black transition-all duration-300 shadow-[0_0_10px_var(--color-neon-green-glow)]">
            <Settings size={20} />
          </button>
          <button 
            onClick={onNavigateToStocks}
            className="p-3 border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black transition-all duration-300 shadow-[0_0_10px_rgba(249,115,22,0.4)] flex flex-col items-center gap-1"
            title="Stock Market"
          >
            <div className="flex items-center gap-1">
              <TrendingUp size={16} />
              <TrendingDown size={16} />
            </div>
            <span className="text-[8px] uppercase font-bold tracking-widest">Stocks</span>
          </button>
          <button onClick={onLogout} className="p-3 border border-neon-green hover:bg-neon-green hover:text-black transition-all duration-300 shadow-[0_0_10px_var(--color-neon-green-glow)]">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Navigation Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNavigateToStocks}
          className="p-8 border flex flex-col items-center justify-center gap-4 transition-all duration-300 group relative overflow-hidden"
          style={{ borderColor: '#F9731640', backgroundColor: '#F9731605' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-2 group-hover:scale-110 transition-transform">
            <TrendingUp size={48} className="text-green-400" />
            <TrendingDown size={48} className="text-red-400" />
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-bold uppercase tracking-widest text-orange-500">Stock Market</h3>
            <p className="text-xs opacity-40 font-bold uppercase tracking-widest">Invest and track profits</p>
          </div>
        </motion.button>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNavigateToEarnings}
          className="p-8 border flex flex-col items-center justify-center gap-4 transition-all duration-300 group relative overflow-hidden"
          style={{ borderColor: '#0FF0FC40', backgroundColor: '#0FF0FC05' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <DollarSign size={48} className="text-cyan-400 group-hover:scale-110 transition-transform" />
          <div className="text-center">
            <h3 className="text-2xl font-bold uppercase tracking-widest text-cyan-400">Manage Earnings</h3>
            <p className="text-xs opacity-40 font-bold uppercase tracking-widest">Track your income sources</p>
          </div>
        </motion.button>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowMonthlySpending(!showMonthlySpending)}
          className="p-8 border flex flex-col items-center justify-center gap-4 transition-all duration-300 group relative overflow-hidden"
          style={{ borderColor: 'var(--color-neon-green-glow)', backgroundColor: 'var(--color-neon-green-faint)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-neon-green/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <Calendar size={48} className={`text-neon-green transition-transform duration-500 ${showMonthlySpending ? 'rotate-12 scale-110' : ''}`} />
          <div className="text-center">
            <h3 className="text-2xl font-bold uppercase tracking-widest text-neon-green">
              {new Date('2026-03-22').toLocaleDateString('en-US', { month: 'long' })} Spending
            </h3>
            <p className="text-xs opacity-40 font-bold uppercase tracking-widest">View daily breakdown</p>
          </div>
        </motion.button>
      </section>

      <AnimatePresence>
        {showMonthlySpending && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 pt-6">
                {spendingDays.map((date) => {
                  const color = getNeonColor(date);
                  const isToday = date === today;
                  const dayExpenses = expenses.filter(e => e.date.startsWith(date));
                  const dayTotal = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
                  
                  return (
                    <motion.button
                      key={date}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onNavigateToAddExpense(date)}
                      className="p-4 border flex flex-col items-center justify-center gap-1 transition-all duration-300"
                      style={{ 
                        borderColor: `${color}40`,
                        backgroundColor: `${color}05`,
                        boxShadow: isToday ? `0 0 15px ${color}40` : 'none'
                      }}
                    >
                      <span className="text-[10px] uppercase font-bold opacity-60">
                        {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <span className="text-xl font-bold" style={{ color }}>
                        {new Date(date).getDate()}
                      </span>
                      <span className="text-[8px] opacity-40 font-mono">
                        {profile.currency}{dayTotal.toFixed(0)}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      <motion.section 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-12 p-10 neon-border text-center bg-neon-green/5 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-neon-green/10 to-transparent pointer-events-none" />
        <h2 className="text-xs uppercase tracking-[0.4em] opacity-60 mb-2 font-bold">Total Today — {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</h2>
        <motion.div 
          key={liveTotal}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-8xl font-bold neon-text-glow"
        >
          {profile.currency}{liveTotal.toFixed(2)}
        </motion.div>
      </motion.section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {profile.categories.map((category, idx) => (
          <motion.div 
            key={category}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * idx }}
            whileHover={{ scale: 1.03, y: -5 }}
            className="p-5 neon-border bg-black flex flex-col gap-4 transition-all duration-300 hover:shadow-[0_0_20px_var(--color-neon-green-glow)] group"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight">{category}</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCategory(category);
                  }}
                  className="opacity-0 group-hover:opacity-40 hover:opacity-100 hover:text-red-500 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <span className="text-xs opacity-40 font-mono">
                {profile.currency}{todayExpenses.filter(e => e.category === category).reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
              </span>
            </div>
            <div className="flex gap-2">
              <input 
                type="number" 
                placeholder="0.00"
                value={amounts[category] || ''}
                onChange={(e) => setAmounts(prev => ({ ...prev, [category]: e.target.value }))}
                className="neon-input w-full text-right font-mono"
                step="0.01"
              />
              <button 
                onClick={() => handleAddExpense(category)}
                className="p-2 border border-neon-green hover:bg-neon-green hover:text-black transition-all duration-300"
                title="Quick Add"
              >
                <Plus size={20} />
              </button>
            </div>
            <button 
              onClick={() => onNavigateToAddExpense()}
              className="text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-neon-green transition-all text-center mt-2 font-bold"
            >
              Detailed Entry
            </button>
          </motion.div>
        ))}

        <motion.div 
          whileHover={{ scale: 1.03 }}
          className="p-5 neon-border border-dashed opacity-60 hover:opacity-100 transition-all duration-300 flex items-center justify-center min-h-[140px]"
        >
          {showAddCategory ? (
            <div className="flex gap-2 w-full">
              <input 
                autoFocus
                type="text" 
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onBlur={() => !newCategory && setShowAddCategory(false)}
                onKeyDown={(e) => e.key === 'Enter' && (onAddCategory(newCategory), setNewCategory(''), setShowAddCategory(false))}
                className="neon-input w-full"
                placeholder="Category name..."
              />
            </div>
          ) : (
            <button onClick={() => setShowAddCategory(true)} className="flex items-center gap-2 uppercase text-xs tracking-widest font-bold">
              <Plus size={16} /> Add Category
            </button>
          )}
        </motion.div>
      </div>

      <section>
        <h3 className="text-xs uppercase tracking-widest opacity-60 mb-4 font-bold">Today's Entries</h3>
        <div className="space-y-3">
          {todayExpenses.slice().reverse().map((expense, idx) => (
            <motion.div 
              key={expense.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * idx }}
              className="flex justify-between items-center p-4 border border-neon-green/10 hover:border-neon-green/40 bg-neon-green/5 transition-all duration-300"
            >
              <div>
                <span className="font-bold text-lg">{expense.category}</span>
                <span className="text-xs opacity-40 ml-4 font-mono">{new Date(expense.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex items-center gap-6">
                <span className="font-mono text-xl">{profile.currency}{expense.amount.toFixed(2)}</span>
                <button onClick={() => expense.id && onDeleteExpense(expense.id)} className="text-neon-green/40 hover:text-red-500 transition-colors p-1">
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
          {todayExpenses.length === 0 && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              className="text-center py-12 opacity-40 italic border border-dashed border-neon-green/20"
            >
              No entries for today yet.
            </motion.p>
          )}
        </div>
      </section>
    </motion.div>
  );
}

