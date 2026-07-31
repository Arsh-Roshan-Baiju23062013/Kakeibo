import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { CURRENCIES } from '../constants';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  initialEmail: string;
}

export default function Onboarding({ onComplete, initialEmail }: OnboardingProps) {
  const [name, setName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [currency, setCurrency] = useState('$');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && jobTitle && currency) {
      onComplete({
        name,
        jobTitle,
        email: initialEmail,
        categories: ['Food', 'Groceries', 'Daily Spending'],
        earningCategories: ['Salary', 'Freelance', 'Gifts'],
        currency
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto mt-20 p-8 text-center"
    >
      <h1 className="text-6xl font-bold neon-text-glow mb-4 tracking-tighter">KAKEIBO</h1>
      <p className="text-xl mb-12 opacity-80 italic">Welcome to your mindful budget tracker.</p>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <div className="flex flex-col text-left">
          <label className="text-xs uppercase tracking-widest mb-1 opacity-60">Name</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="neon-input text-lg"
            required
          />
        </div>

        <div className="flex flex-col text-left">
          <label className="text-xs uppercase tracking-widest mb-1 opacity-60">Job Title</label>
          <input 
            type="text" 
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="What do you do?"
            className="neon-input text-lg"
            required
          />
        </div>

        <div className="flex flex-col text-left">
          <label className="text-xs uppercase tracking-widest mb-1 opacity-60">Currency Choice</label>
          <select 
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="neon-input text-lg bg-black appearance-none cursor-pointer"
            required
          >
            {CURRENCIES.map((c) => (
              <option key={`${c.code}-${c.symbol}`} value={c.symbol}>
                {c.code} ({c.symbol}) - {c.name}
              </option>
            ))}
          </select>
          <p className="text-[10px] mt-2 opacity-40 italic">Select your preferred currency for tracking.</p>
        </div>

        <div className="flex flex-col text-left">
          <label className="text-xs uppercase tracking-widest mb-1 opacity-60">Gmail</label>
          <input 
            type="email" 
            value={initialEmail}
            disabled
            className="neon-input text-lg opacity-50 cursor-not-allowed"
          />
        </div>

        <button type="submit" className="neon-button mt-4">
          Get Started
        </button>
      </form>
    </motion.div>
  );
}
