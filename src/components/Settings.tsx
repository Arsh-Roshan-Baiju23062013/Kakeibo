import { motion } from 'framer-motion';
import { ArrowLeft, Save, Trash2, Plus } from 'lucide-react';
import { useState } from 'react';
import { UserProfile } from '../types';
import { CURRENCIES } from '../constants';

interface SettingsProps {
  profile: UserProfile;
  onBack: () => void;
  onUpdateProfile: (profile: UserProfile) => void;
}

export default function Settings({ profile, onBack, onUpdateProfile }: SettingsProps) {
  const [name, setName] = useState(profile.name);
  const [jobTitle, setJobTitle] = useState(profile.jobTitle);
  const [currency, setCurrency] = useState(profile.currency);
  const [categories, setCategories] = useState(profile.categories);
  const [earningCategories, setEarningCategories] = useState(profile.earningCategories || []);
  const [newCategory, setNewCategory] = useState('');
  const [newEarningCategory, setNewEarningCategory] = useState('');

  const handleSave = () => {
    onUpdateProfile({
      ...profile,
      name,
      jobTitle,
      currency,
      categories,
      earningCategories
    });
    onBack();
  };

  const addCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory('');
    }
  };

  const removeCategory = (cat: string) => {
    setCategories(categories.filter(c => c !== cat));
  };

  const addEarningCategory = () => {
    if (newEarningCategory && !earningCategories.includes(newEarningCategory)) {
      setEarningCategories([...earningCategories, newEarningCategory]);
      setNewEarningCategory('');
    }
  };

  const removeEarningCategory = (cat: string) => {
    setEarningCategories(earningCategories.filter(c => c !== cat));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-2xl mx-auto p-6"
    >
      <header className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 border border-neon-green hover:bg-neon-green hover:text-black transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-4xl font-bold neon-text-glow tracking-tighter">Settings</h1>
        </div>
      </header>

      <div className="space-y-8 neon-border p-8 bg-neon-green/5">
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-widest opacity-60 font-bold">Name</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="neon-input text-xl"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-widest opacity-60 font-bold">Job Title</label>
          <input 
            type="text" 
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className="neon-input text-xl"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-widest opacity-60 font-bold">Currency Choice</label>
          <select 
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="neon-input text-xl bg-black appearance-none cursor-pointer"
          >
            {CURRENCIES.map((c) => (
              <option key={`${c.code}-${c.symbol}`} value={c.symbol}>
                {c.code} ({c.symbol}) - {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-4">
          <label className="text-xs uppercase tracking-widest opacity-60 font-bold">Spending Categories</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <span key={cat} className="px-3 py-1 border border-neon-green/40 text-sm flex items-center gap-2">
                {cat}
                <button onClick={() => removeCategory(cat)} className="text-red-500 hover:text-red-400">
                  <Trash2 size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New category..."
              className="neon-input flex-1"
            />
            <button onClick={addCategory} className="p-2 border border-neon-green hover:bg-neon-green hover:text-black">
              <Plus size={20} />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <label className="text-xs uppercase tracking-widest opacity-60 font-bold text-cyan-400">Earning Categories</label>
          <div className="flex flex-wrap gap-2">
            {earningCategories.map(cat => (
              <span key={cat} className="px-3 py-1 border border-cyan-400/40 text-sm flex items-center gap-2 text-cyan-400">
                {cat}
                <button onClick={() => removeEarningCategory(cat)} className="text-red-500 hover:text-red-400">
                  <Trash2 size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={newEarningCategory}
              onChange={(e) => setNewEarningCategory(e.target.value)}
              placeholder="New earning category..."
              className="neon-input flex-1 border-cyan-400/40 text-cyan-400 focus:border-cyan-400"
            />
            <button onClick={addEarningCategory} className="p-2 border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black">
              <Plus size={20} />
            </button>
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="neon-button w-full flex items-center justify-center gap-2 py-4 text-lg"
        >
          <Save size={20} /> Save Changes
        </button>
      </div>
    </motion.div>
  );
}
