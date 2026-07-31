import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ArrowLeft, Send, DollarSign, Calendar } from 'lucide-react';
import React, { useState } from 'react';
import { Earning, UserProfile } from '../types';
import { getNeonColor } from './Dashboard';

interface EarningsProps {
  profile: UserProfile;
  earnings: Earning[];
  onAddEarning: (earning: Omit<Earning, 'id'>) => void;
  onDeleteEarning: (id: string) => void;
  onAddCategory: (category: string) => void;
  onDeleteCategory: (category: string) => void;
  onBack: () => void;
}

export default function Earnings({ 
  profile, 
  earnings, 
  onAddEarning, 
  onDeleteEarning, 
  onAddCategory,
  onDeleteCategory,
  onBack
}: EarningsProps) {
  const [newCategory, setNewCategory] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  
  // Quick Entry state
  const [quickName, setQuickName] = useState('');
  const [quickAmount, setQuickAmount] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const todayEarnings = earnings.filter(e => e.date && typeof e.date === 'string' && e.date.startsWith(today));
  const totalToday = todayEarnings.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  
  const pendingTotal = (Object.values(amounts) as string[]).reduce((sum: number, val: string) => sum + (parseFloat(val) || 0), 0) + (parseFloat(quickAmount) || 0);
  const liveTotal = totalToday + pendingTotal;

  const handleAddCategorySubmit = () => {
    if (newCategory.trim()) {
      onAddCategory(newCategory.trim());
      setNewCategory('');
      setShowAddCategory(false);
    }
  };

  const handleAddEarning = (category: string) => {
    const amount = parseFloat(amounts[category] || '0');
    if (amount > 0) {
      onAddEarning({
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
      onAddEarning({
        amount,
        category: quickName,
        date: new Date().toISOString()
      });
      setQuickName('');
      setQuickAmount('');
    }
  };

  const neonColor = '#0FF0FC'; // Electric Blue for Earnings

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="max-w-4xl mx-auto p-6"
    >
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="p-2 border transition-colors"
            style={{ borderColor: neonColor, color: neonColor }}
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-4xl font-bold tracking-tighter" style={{ color: neonColor, textShadow: `0 0 10px ${neonColor}` }}>Earnings</h1>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Currency</span>
          <span className="text-xl font-bold" style={{ color: neonColor, textShadow: `0 0 10px ${neonColor}` }}>{profile.currency}</span>
        </div>
      </header>

      <motion.section 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-12 p-10 border text-center relative overflow-hidden"
        style={{ borderColor: `${neonColor}40`, backgroundColor: `${neonColor}05` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none" />
        <h2 className="text-xs uppercase tracking-[0.4em] opacity-60 mb-2 font-bold">Total Earnings Today</h2>
        <motion.div 
          key={liveTotal}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-8xl font-bold"
          style={{ color: neonColor, textShadow: `0 0 20px ${neonColor}` }}
        >
          {profile.currency}{liveTotal.toFixed(2)}
        </motion.div>
      </motion.section>

      <section className="mb-12">
        <h3 className="text-xs uppercase tracking-widest opacity-60 mb-4 font-bold">Quick Entry</h3>
        <form onSubmit={handleQuickAdd} className="flex flex-col md:flex-row gap-4 p-6 border" style={{ borderColor: `${neonColor}40`, backgroundColor: `${neonColor}05` }}>
          <input 
            type="text" 
            placeholder="Source of income?"
            value={quickName}
            onChange={(e) => setQuickName(e.target.value)}
            className="w-full bg-transparent border-b outline-none py-2 text-xl transition-all"
            style={{ borderColor: `${neonColor}40`, color: neonColor }}
            required
          />
          <input 
            type="number" 
            placeholder="Amount"
            value={quickAmount}
            onChange={(e) => setQuickAmount(e.target.value)}
            className="w-full md:w-32 bg-transparent border-b outline-none py-2 text-xl text-right transition-all font-mono"
            style={{ borderColor: `${neonColor}40`, color: neonColor }}
            required
            step="0.01"
          />
          <button 
            type="submit" 
            className="flex items-center justify-center gap-2 px-6 py-2 font-bold uppercase tracking-widest transition-all"
            style={{ backgroundColor: neonColor, color: '#000' }}
          >
            <Send size={18} /> Add
          </button>
        </form>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {(profile.earningCategories || []).map((category, idx) => (
          <motion.div 
            key={category}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * idx }}
            whileHover={{ scale: 1.03, y: -5 }}
            className="p-5 border bg-black flex flex-col gap-4 transition-all duration-300 group"
            style={{ borderColor: `${neonColor}40` }}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight" style={{ color: neonColor }}>{category}</span>
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
                {profile.currency}{todayEarnings.filter(e => e.category === category).reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
              </span>
            </div>
            <div className="flex gap-2">
              <input 
                type="number" 
                placeholder="0.00"
                value={amounts[category] || ''}
                onChange={(e) => setAmounts(prev => ({ ...prev, [category]: e.target.value }))}
                className="w-full bg-transparent border-b outline-none py-1 text-right font-mono"
                style={{ borderColor: `${neonColor}40`, color: neonColor }}
                step="0.01"
              />
              <button 
                onClick={() => handleAddEarning(category)}
                className="p-2 border transition-all duration-300"
                style={{ borderColor: neonColor, color: neonColor }}
                title="Quick Add"
              >
                <Plus size={20} />
              </button>
            </div>
          </motion.div>
        ))}

        <motion.div 
          whileHover={{ scale: 1.03 }}
          className="p-5 border border-dashed opacity-60 hover:opacity-100 transition-all duration-300 flex items-center justify-center min-h-[140px]"
          style={{ borderColor: `${neonColor}40` }}
        >
          {showAddCategory ? (
            <div className="flex flex-col gap-3 w-full">
              <input 
                autoFocus
                type="text" 
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategorySubmit()}
                className="w-full bg-transparent border-b outline-none py-2"
                style={{ borderColor: neonColor, color: neonColor }}
                placeholder="Category name..."
              />
              <div className="flex gap-2">
                <button 
                  onClick={handleAddCategorySubmit}
                  className="flex-1 py-2 text-[10px] uppercase tracking-widest font-bold transition-all"
                  style={{ backgroundColor: neonColor, color: '#000' }}
                >
                  Confirm
                </button>
                <button 
                  onClick={() => { setShowAddCategory(false); setNewCategory(''); }}
                  className="flex-1 py-2 text-[10px] uppercase tracking-widest font-bold border transition-all"
                  style={{ borderColor: `${neonColor}40`, color: neonColor }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAddCategory(true)} className="flex items-center gap-2 uppercase text-xs tracking-widest font-bold" style={{ color: neonColor }}>
              <Plus size={16} /> Add Category
            </button>
          )}
        </motion.div>
      </div>

      <section>
        <h3 className="text-xs uppercase tracking-widest opacity-60 mb-4 font-bold">Today's Earnings</h3>
        <div className="space-y-3">
          {todayEarnings.slice().reverse().map((earning, idx) => (
            <motion.div 
              key={earning.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * idx }}
              className="flex justify-between items-center p-4 border bg-black transition-all duration-300"
              style={{ borderColor: `${neonColor}10` }}
            >
              <div>
                <span className="font-bold text-lg" style={{ color: neonColor }}>{earning.category}</span>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold">
                    {new Date(earning.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="text-[10px] opacity-40 font-mono">
                    {new Date(earning.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className="font-mono text-xl" style={{ color: neonColor }}>{profile.currency}{earning.amount.toFixed(2)}</span>
                <button onClick={() => earning.id && onDeleteEarning(earning.id)} className="text-neon-green/40 hover:text-red-500 transition-colors p-1">
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
          {todayEarnings.length === 0 && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              className="text-center py-12 opacity-40 italic border border-dashed"
              style={{ borderColor: `${neonColor}20` }}
            >
              No earnings for today yet.
            </motion.p>
          )}
        </div>
      </section>
    </motion.div>
  );
}
