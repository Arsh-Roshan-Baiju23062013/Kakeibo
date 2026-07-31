/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, onSnapshot, addDoc, deleteDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { auth, db, signInWithGoogle, logout } from './firebase';
import { UserProfile, Expense, Earning, OperationType, FirestoreErrorInfo, StockInvestment } from './types';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import Earnings from './components/Earnings';
import Analytics from './components/Analytics';
import History from './components/History';
import DayDetail from './components/DayDetail';
import Settings from './components/Settings';
import AddExpense from './components/AddExpense';
import StockMarket from './components/StockMarket';
import Login from './components/Login';
import { motion, AnimatePresence } from 'framer-motion';

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'dashboard' | 'analytics' | 'history' | 'dayDetail' | 'settings' | 'addExpense' | 'earnings' | 'stocks'>('dashboard');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [addExpenseDate, setAddExpenseDate] = useState<string | null>(null);
  const [stocks, setStocks] = useState<StockInvestment[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const userDoc = await getDoc(doc(db, 'users', u.uid));
        if (userDoc.exists()) {
          const data = userDoc.data() as UserProfile;
          setProfile({
            ...data,
            earningCategories: data.earningCategories || []
          });
        }
      } else {
        setProfile(null);
        setExpenses([]);
        setEarnings([]);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user && profile) {
      const expPath = `users/${user.uid}/expenses`;
      const earnPath = `users/${user.uid}/earnings`;
      const stockPath = `users/${user.uid}/stocks`;
      
      const unsubscribeExp = onSnapshot(collection(db, expPath), (snapshot) => {
        const exps = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Expense));
        setExpenses(exps);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, expPath);
      });

      const unsubscribeEarn = onSnapshot(collection(db, earnPath), (snapshot) => {
        const earns = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Earning));
        setEarnings(earns);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, earnPath);
      });

      const unsubscribeStock = onSnapshot(collection(db, stockPath), (snapshot) => {
        const s = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as StockInvestment));
        setStocks(s);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, stockPath);
      });

      return () => {
        unsubscribeExp();
        unsubscribeEarn();
        unsubscribeStock();
      };
    }
  }, [user, profile]);

  const handleOnboardingComplete = async (newProfile: UserProfile) => {
    if (user) {
      const path = `users/${user.uid}`;
      try {
        await setDoc(doc(db, path), newProfile);
        setProfile(newProfile);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    }
  };

  const handleAddExpense = async (expense: Omit<Expense, 'id'>) => {
    if (user) {
      const path = `users/${user.uid}/expenses`;
      try {
        await addDoc(collection(db, path), expense);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (user) {
      const path = `users/${user.uid}/expenses/${id}`;
      try {
        await deleteDoc(doc(db, path));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    }
  };

  const handleAddEarning = async (earning: Omit<Earning, 'id'>) => {
    if (user) {
      const path = `users/${user.uid}/earnings`;
      try {
        await addDoc(collection(db, path), earning);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    }
  };

  const handleDeleteEarning = async (id: string) => {
    if (user) {
      const path = `users/${user.uid}/earnings/${id}`;
      try {
        await deleteDoc(doc(db, path));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    }
  };

  const handleAddCategory = async (category: string) => {
    if (user && profile) {
      const path = `users/${user.uid}`;
      try {
        await updateDoc(doc(db, path), {
          categories: arrayUnion(category)
        });
        setProfile({ ...profile, categories: [...profile.categories, category] });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    }
  };

  const handleDeleteCategory = async (category: string) => {
    if (user && profile) {
      const path = `users/${user.uid}`;
      const newCategories = profile.categories.filter(c => c !== category);
      try {
        await updateDoc(doc(db, path), {
          categories: newCategories
        });
        setProfile({ ...profile, categories: newCategories });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    }
  };

  const handleAddEarningCategory = async (category: string) => {
    if (user && profile) {
      const path = `users/${user.uid}`;
      try {
        await updateDoc(doc(db, path), {
          earningCategories: arrayUnion(category)
        });
        setProfile({ ...profile, earningCategories: [...(profile.earningCategories || []), category] });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    }
  };

  const handleDeleteEarningCategory = async (category: string) => {
    if (user && profile) {
      const path = `users/${user.uid}`;
      const newCategories = (profile.earningCategories || []).filter(c => c !== category);
      try {
        await updateDoc(doc(db, path), {
          earningCategories: newCategories
        });
        setProfile({ ...profile, earningCategories: newCategories });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    }
  };

  const handleUpdateProfile = async (newProfile: UserProfile) => {
    if (user) {
      const path = `users/${user.uid}`;
      try {
        await updateDoc(doc(db, path), { ...newProfile });
        setProfile(newProfile);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    }
  };

  const handleAddStock = async (stock: Omit<StockInvestment, 'id'>) => {
    if (user) {
      const path = `users/${user.uid}/stocks`;
      try {
        await addDoc(collection(db, path), stock);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    }
  };

  const handleDeleteStock = async (id: string) => {
    if (user) {
      const path = `users/${user.uid}/stocks/${id}`;
      try {
        await deleteDoc(doc(db, path));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    }
  };

  const handleUpdateStock = async (id: string, stock: Partial<StockInvestment>) => {
    if (user) {
      const path = `users/${user.uid}/stocks/${id}`;
      try {
        await updateDoc(doc(db, path), stock);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    }
  };

  const handleSelectDay = (date: string) => {
    setSelectedDate(date);
    setView('dayDetail');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-neon-green animate-pulse text-2xl tracking-widest uppercase">Initializing...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (!profile) {
    return <Onboarding onComplete={handleOnboardingComplete} initialEmail={user.email || ''} />;
  }

  return (
    <div className="min-h-screen bg-black text-neon-green pb-20 overflow-x-hidden">
      <AnimatePresence mode="wait">
        {view === 'dashboard' && (
          <Dashboard 
            profile={profile}
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
            onLogout={logout}
            onNavigateToAnalytics={() => setView('analytics')}
            onNavigateToHistory={() => setView('history')}
            onNavigateToSettings={() => setView('settings')}
            onNavigateToAddExpense={(date) => {
              setAddExpenseDate(date || null);
              setView('addExpense');
            }}
            onNavigateToEarnings={() => setView('earnings')}
            onNavigateToStocks={() => setView('stocks')}
          />
        )}
        {view === 'earnings' && (
          <Earnings 
            profile={profile}
            earnings={earnings}
            onAddEarning={handleAddEarning}
            onDeleteEarning={handleDeleteEarning}
            onAddCategory={handleAddEarningCategory}
            onDeleteCategory={handleDeleteEarningCategory}
            onBack={() => setView('dashboard')}
          />
        )}
        {view === 'addExpense' && (
          <AddExpense 
            profile={profile}
            initialDate={addExpenseDate || undefined}
            onAddExpense={handleAddExpense}
            onBack={() => setView('dashboard')}
          />
        )}
        {view === 'settings' && (
          <Settings 
            profile={profile}
            onBack={() => setView('dashboard')}
            onUpdateProfile={handleUpdateProfile}
          />
        )}
        {view === 'analytics' && (
          <Analytics 
            expenses={expenses}
            earnings={earnings}
            currency={profile.currency}
            onBack={() => setView('dashboard')}
          />
        )}
        {view === 'history' && (
          <History 
            expenses={expenses}
            currency={profile.currency}
            onBack={() => setView('dashboard')}
            onSelectDay={handleSelectDay}
          />
        )}
        {view === 'dayDetail' && selectedDate && (
          <DayDetail 
            date={selectedDate}
            expenses={expenses}
            currency={profile.currency}
            onBack={() => setView('history')}
            onDeleteExpense={handleDeleteExpense}
          />
        )}
        {view === 'stocks' && (
          <StockMarket 
            profile={profile}
            stocks={stocks}
            onAddStock={handleAddStock}
            onDeleteStock={handleDeleteStock}
            onUpdateStock={handleUpdateStock}
            onAddEarning={handleAddEarning}
            onAddExpense={handleAddExpense}
            onBack={() => setView('dashboard')}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

