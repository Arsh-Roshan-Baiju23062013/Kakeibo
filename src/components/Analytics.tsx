import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Expense, Earning } from '../types';

interface AnalyticsProps {
  expenses: Expense[];
  earnings: Earning[];
  currency: string;
  onBack: () => void;
}

export default function Analytics({ expenses, earnings, currency, onBack }: AnalyticsProps) {
  const [activeTab, setActiveTab] = useState<'Daily' | 'Monthly' | 'Yearly'>('Daily');

  // Calculate actual average spending
  const groupedByDay = expenses.reduce((acc, expense) => {
    const date = expense.date.split('T')[0];
    if (!acc[date]) acc[date] = 0;
    acc[date] += expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const groupedEarningsByDay = earnings.reduce((acc, earning) => {
    const date = earning.date.split('T')[0];
    if (!acc[date]) acc[date] = 0;
    acc[date] += earning.amount;
    return acc;
  }, {} as Record<string, number>);

  const dailyTotals = Object.values(groupedByDay);
  const averageDaily = dailyTotals.length > 0 
    ? dailyTotals.reduce((sum, val) => sum + val, 0) / dailyTotals.length 
    : 0;

  const dailyEarningTotals = Object.values(groupedEarningsByDay);
  const averageDailyEarning = dailyEarningTotals.length > 0
    ? dailyEarningTotals.reduce((sum, val) => sum + val, 0) / dailyEarningTotals.length
    : 0;

  // Simple aggregation for the chart (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    return { 
      name: dayName, 
      spending: groupedByDay[dateStr] || 0,
      earnings: groupedEarningsByDay[dateStr] || 0
    };
  });

  const totalSpending = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
  const savingsRate = totalEarnings > 0 ? ((totalEarnings - totalSpending) / totalEarnings) * 100 : 0;

  const getRecommendation = () => {
    if (totalEarnings === 0) return "Start by tracking your income to see your full financial picture.";
    if (savingsRate < 0) return "Warning: You are spending more than you earn. Consider reducing non-essential expenses.";
    if (savingsRate < 10) return "You're living close to your means. Try to save at least 20% of your income.";
    if (savingsRate < 30) return "Good job! You have a healthy savings rate. Consider investing your surplus.";
    return "Excellent financial health! Your savings rate is very high. Look into long-term wealth building.";
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto p-6"
    >
      <header className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 border border-neon-green hover:bg-neon-green hover:text-black transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-4xl font-bold neon-text-glow tracking-tighter">Analytics</h1>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Currency</span>
          <span className="text-xl font-bold neon-text-glow">{currency}</span>
        </div>
      </header>

      <div className="flex gap-4 mb-12 border-b border-neon-green/20">
        {(['Daily', 'Monthly', 'Yearly'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`pb-2 px-4 uppercase text-xs tracking-widest transition-all ${
              activeTab === t ? 'border-b-2 border-neon-green text-neon-green' : 'opacity-40'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="p-8 neon-border bg-neon-green/5"
        >
          <h3 className="text-xs uppercase tracking-widest opacity-60 mb-2 font-bold">Average Spending</h3>
          <div className="text-5xl font-bold neon-text-glow">{currency}{averageDaily.toFixed(2)}</div>
        </motion.div>
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="p-8 border bg-cyan-500/5"
          style={{ borderColor: '#0FF0FC40' }}
        >
          <h3 className="text-xs uppercase tracking-widest opacity-60 mb-2 font-bold" style={{ color: '#0FF0FC' }}>Average Earnings</h3>
          <div className="text-5xl font-bold" style={{ color: '#0FF0FC', textShadow: '0 0 10px #0FF0FC' }}>{currency}{averageDailyEarning.toFixed(2)}</div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 neon-border border-dashed flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold mb-1">Total Savings</span>
          <span className={`text-2xl font-bold ${totalEarnings - totalSpending >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {currency}{(totalEarnings - totalSpending).toFixed(2)}
          </span>
        </div>
        <div className="p-6 neon-border border-dashed flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold mb-1">Savings Rate</span>
          <span className="text-2xl font-bold text-neon-green">{savingsRate.toFixed(1)}%</span>
        </div>
        <div className="p-6 neon-border border-dashed flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold mb-1">Status</span>
          <span className={`text-2xl font-bold ${savingsRate > 20 ? 'text-green-400' : savingsRate > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
            {savingsRate > 20 ? 'Excellent' : savingsRate > 0 ? 'Healthy' : 'Critical'}
          </span>
        </div>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="h-80 w-full neon-border p-6 bg-black mb-12"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={last7Days}>
            <XAxis dataKey="name" stroke="#39FF14" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#39FF14" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              cursor={{ fill: 'rgba(57, 255, 20, 0.1)' }}
              contentStyle={{ backgroundColor: '#000', border: '1px solid #39FF14', color: '#39FF14' }}
              itemStyle={{ color: '#39FF14' }}
            />
            <Bar dataKey="spending" fill="#39FF14" radius={[4, 4, 0, 0]} name="Spending" />
            <Bar dataKey="earnings" fill="#0FF0FC" radius={[4, 4, 0, 0]} name="Earnings" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="p-8 neon-border border-dashed bg-neon-green/5">
        <h4 className="text-xs uppercase tracking-widest opacity-60 mb-4 font-bold">Financial Recommendation</h4>
        <p className="text-xl font-medium italic text-neon-green">
          "{getRecommendation()}"
        </p>
      </div>
    </motion.div>
  );
}


