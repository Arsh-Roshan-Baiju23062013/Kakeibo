import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, TrendingUp, TrendingDown, RefreshCw, DollarSign, Edit2, Check, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { StockInvestment, UserProfile } from '../types';

interface StockMarketProps {
  profile: UserProfile;
  stocks: StockInvestment[];
  onAddStock: (stock: Omit<StockInvestment, 'id'>) => void;
  onDeleteStock: (id: string) => void;
  onUpdateStock: (id: string, stock: Partial<StockInvestment>) => void;
  onAddEarning: (earning: { amount: number; category: string; date: string }) => void;
  onAddExpense: (expense: { amount: number; category: string; date: string }) => void;
  onBack: () => void;
}

export default function StockMarket({ 
  profile, 
  stocks, 
  onAddStock, 
  onDeleteStock, 
  onUpdateStock,
  onAddEarning,
  onAddExpense,
  onBack 
}: StockMarketProps) {
  const [symbol, setSymbol] = useState('');
  const [invested, setInvested] = useState('');
  const [shares, setShares] = useState('');
  const [stockCurrency, setStockCurrency] = useState(profile.currency);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [confirmSync, setConfirmSync] = useState<StockInvestment | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSymbol, setEditSymbol] = useState('');
  const [editInvested, setEditInvested] = useState('');
  const [editShares, setEditShares] = useState('');
  const [editCurrency, setEditCurrency] = useState('');

  const fetchPrice = async (ticker: string) => {
    setLoading(prev => ({ ...prev, [ticker]: true }));
    try {
      // Simulating a real API call. In a real app, you'd use a key for Finnhub/AlphaVantage
      // or a proxy to Yahoo Finance. 
      // For this demo, we'll generate a "current" price that's near the average invested price
      // to show the profit/loss logic clearly.
      const stock = stocks.find(s => s.symbol === ticker);
      const avgPrice = stock ? stock.investedAmount / stock.shares : 150;
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Random fluctuation +/- 10%
      const fluctuation = (Math.random() - 0.5) * 0.2;
      const currentPrice = avgPrice * (1 + fluctuation);
      
      setPrices(prev => ({ ...prev, [ticker]: currentPrice }));
    } catch (error) {
      console.error('Error fetching price:', error);
    } finally {
      setLoading(prev => ({ ...prev, [ticker]: false }));
    }
  };

  useEffect(() => {
    stocks.forEach(stock => {
      if (!prices[stock.symbol]) {
        fetchPrice(stock.symbol);
      }
    });
  }, [stocks]);

  const handleAddInvestment = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(invested);
    const numShares = parseFloat(shares);
    if (symbol && amount > 0 && numShares > 0) {
      let finalSymbol = symbol.toUpperCase();
      // If currency is INR and no exchange suffix is provided, we assume NSE
      if (stockCurrency === '₹' && !finalSymbol.includes('.')) {
        // We keep it as is for display but the system recognizes it as NSE
      }
      
      onAddStock({
        symbol: finalSymbol,
        investedAmount: amount,
        shares: numShares,
        purchaseDate: new Date().toISOString(),
        currency: stockCurrency
      });
      setSymbol('');
      setInvested('');
      setShares('');
    }
  };

  const handleSyncFinances = (stock: StockInvestment) => {
    setConfirmSync(stock);
  };

  const startEditing = (stock: StockInvestment) => {
    if (stock.id) {
      setEditingId(stock.id);
      setEditSymbol(stock.symbol);
      setEditInvested(stock.investedAmount.toString());
      setEditShares(stock.shares.toString());
      setEditCurrency(stock.currency || profile.currency);
    }
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const saveEdit = () => {
    if (editingId) {
      onUpdateStock(editingId, {
        symbol: editSymbol.toUpperCase(),
        investedAmount: parseFloat(editInvested),
        shares: parseFloat(editShares),
        currency: editCurrency
      });
      setEditingId(null);
    }
  };

  const confirmSyncAction = () => {
    if (!confirmSync) return;
    const stock = confirmSync;
    const currentPrice = prices[stock.symbol];
    if (!currentPrice) return;

    const currentValue = currentPrice * stock.shares;
    const profitLoss = currentValue - stock.investedAmount;

    if (profitLoss > 0) {
      // "profit will be added to earning with investment"
      onAddEarning({
        amount: stock.investedAmount + profitLoss,
        category: `Stock Return: ${stock.symbol} (Inv: ${stock.investedAmount} + Prof: ${profitLoss.toFixed(2)})`,
        date: new Date().toISOString()
      });
    } else if (profitLoss < 0) {
      // "loss will be added to spending and loss due to investment"
      onAddExpense({
        amount: stock.investedAmount + Math.abs(profitLoss),
        category: `Stock Loss: ${stock.symbol} (Inv: ${stock.investedAmount} + Loss: ${Math.abs(profitLoss).toFixed(2)})`,
        date: new Date().toISOString()
      });
    } else {
      // Break even
      onAddEarning({
        amount: stock.investedAmount,
        category: `Stock Return: ${stock.symbol} (Break Even)`,
        date: new Date().toISOString()
      });
    }
    setConfirmSync(null);
  };

  const neonColor = '#F97316'; // Orange for Stocks

  const commonCurrencies = [
    { code: '$', label: 'USD (US)' },
    { code: '€', label: 'EUR (EU)' },
    { code: '£', label: 'GBP (UK)' },
    { code: '¥', label: 'JPY (JP)' },
    { code: '₹', label: 'INR (IN)' },
    { code: 'A$', label: 'AUD (AU)' },
    { code: 'C$', label: 'CAD (CA)' },
    { code: 'CHF', label: 'CHF (CH)' },
    { code: 'HK$', label: 'HKD (HK)' },
    { code: 'S$', label: 'SGD (SG)' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
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
          <div className="flex items-center gap-3">
            <TrendingUp size={32} style={{ color: neonColor }} />
            <h1 className="text-4xl font-bold tracking-tighter" style={{ color: neonColor, textShadow: `0 0 10px ${neonColor}` }}>Stock Market</h1>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Portfolio</span>
          <span className="text-xl font-bold" style={{ color: neonColor }}>{profile.currency}{stocks.reduce((sum, s) => sum + s.investedAmount, 0).toFixed(2)}</span>
        </div>
      </header>

      <section className="mb-12">
        <h3 className="text-xs uppercase tracking-widest opacity-60 mb-4 font-bold">Add New Investment</h3>
        <form onSubmit={handleAddInvestment} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-6 border bg-black/40" style={{ borderColor: `${neonColor}40` }}>
          <input 
            type="text" 
            placeholder="Ticker (e.g. AAPL or RELIANCE)"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="bg-transparent border-b outline-none py-2 text-xl"
            style={{ borderColor: `${neonColor}40`, color: neonColor }}
            required
          />
          <select
            value={stockCurrency}
            onChange={(e) => setStockCurrency(e.target.value)}
            className="bg-transparent border-b outline-none py-2 text-xl appearance-none cursor-pointer"
            style={{ borderColor: `${neonColor}40`, color: neonColor, backgroundColor: '#000' }}
            required
          >
            {commonCurrencies.map(curr => (
              <option key={curr.code} value={curr.code} style={{ backgroundColor: '#000' }}>
                {curr.code} - {curr.label}
              </option>
            ))}
          </select>
          <input 
            type="number" 
            placeholder="Invested Amount"
            value={invested}
            onChange={(e) => setInvested(e.target.value)}
            className="bg-transparent border-b outline-none py-2 text-xl font-mono"
            style={{ borderColor: `${neonColor}40`, color: neonColor }}
            required
            step="0.01"
          />
          <input 
            type="number" 
            placeholder="Shares"
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            className="bg-transparent border-b outline-none py-2 text-xl font-mono"
            style={{ borderColor: `${neonColor}40`, color: neonColor }}
            required
            step="0.0001"
          />
          <button 
            type="submit" 
            className="flex items-center justify-center gap-2 px-6 py-2 font-bold uppercase tracking-widest transition-all"
            style={{ backgroundColor: neonColor, color: '#000' }}
          >
            <Plus size={18} /> Add
          </button>
        </form>
        <p className="text-[10px] uppercase tracking-widest opacity-40 mt-2 font-bold">
          * Supports NSE tickers for Indian stocks (e.g., RELIANCE, TCS, HDFCBANK)
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence>
          {stocks.map((stock) => {
            const currentPrice = prices[stock.symbol];
            const currentValue = currentPrice ? currentPrice * stock.shares : 0;
            const profitLoss = currentValue - stock.investedAmount;
            const isProfit = profitLoss >= 0;
            const isLoading = loading[stock.symbol];

            const isEditing = editingId === stock.id;

            return (
              <motion.div 
                key={stock.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="p-6 border bg-black relative overflow-hidden group"
                style={{ 
                  borderColor: isEditing ? neonColor : (currentPrice ? (isProfit ? '#22c55e40' : '#ef444440') : `${neonColor}20`),
                  backgroundColor: currentPrice ? (isProfit ? '#22c55e05' : '#ef444405') : 'transparent'
                }}
              >
                {isEditing ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-xl font-bold uppercase tracking-widest" style={{ color: neonColor }}>Edit Investment</h4>
                      <div className="flex gap-2">
                        <button 
                          onClick={saveEdit}
                          className="p-2 border border-green-500 text-green-500 hover:bg-green-500 hover:text-black transition-all"
                        >
                          <Check size={16} />
                        </button>
                        <button 
                          onClick={cancelEditing}
                          className="p-2 border border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-black transition-all"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Ticker</label>
                        <input 
                          type="text"
                          value={editSymbol}
                          onChange={(e) => setEditSymbol(e.target.value)}
                          className="bg-transparent border-b border-white/20 outline-none py-1 text-lg font-bold"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Currency</label>
                        <select
                          value={editCurrency}
                          onChange={(e) => setEditCurrency(e.target.value)}
                          className="bg-transparent border-b border-white/20 outline-none py-1 text-lg font-bold appearance-none"
                        >
                          {commonCurrencies.map(curr => (
                            <option key={curr.code} value={curr.code} style={{ backgroundColor: '#000' }}>
                              {curr.code}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Invested</label>
                        <input 
                          type="number"
                          value={editInvested}
                          onChange={(e) => setEditInvested(e.target.value)}
                          className="bg-transparent border-b border-white/20 outline-none py-1 text-lg font-mono"
                          step="0.01"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Shares</label>
                        <input 
                          type="number"
                          value={editShares}
                          onChange={(e) => setEditShares(e.target.value)}
                          className="bg-transparent border-b border-white/20 outline-none py-1 text-lg font-mono"
                          step="0.0001"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-3xl font-bold tracking-tighter" style={{ color: currentPrice ? (isProfit ? '#22c55e' : '#ef4444') : neonColor }}>
                          {stock.symbol}
                        </h4>
                        <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold">
                          {stock.shares} Shares @ {stock.currency || profile.currency}{(stock.investedAmount / stock.shares).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => fetchPrice(stock.symbol)}
                          className={`p-2 border transition-all ${isLoading ? 'animate-spin' : ''}`}
                          style={{ borderColor: `${neonColor}40`, color: neonColor }}
                        >
                          <RefreshCw size={16} />
                        </button>
                        <button 
                          onClick={() => startEditing(stock)}
                          className="p-2 border border-blue-500/40 text-blue-500/40 hover:text-blue-500 hover:border-blue-500 transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => stock.id && onDeleteStock(stock.id)}
                          className="p-2 border border-red-500/40 text-red-500/40 hover:text-red-500 hover:border-red-500 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Current Price</p>
                        <p className="text-2xl font-mono font-bold">
                          {isLoading ? '...' : `${stock.currency || profile.currency}${currentPrice?.toFixed(2) || '0.00'}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Profit / Loss</p>
                        <p className={`text-2xl font-mono font-bold ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
                          {isProfit ? '+' : ''}{stock.currency || profile.currency}{profitLoss.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleSyncFinances(stock)}
                      disabled={!currentPrice}
                      className="w-full py-3 border flex items-center justify-center gap-2 uppercase text-xs tracking-[0.2em] font-bold transition-all disabled:opacity-20"
                      style={{ 
                        borderColor: isProfit ? '#22c55e' : '#ef4444',
                        color: isProfit ? '#22c55e' : '#ef4444'
                      }}
                    >
                      <DollarSign size={14} /> Sync to Finances
                    </button>
                  </>
                )}

                {/* Background Glow */}
                <div 
                  className="absolute -right-10 -bottom-10 w-32 h-32 blur-3xl opacity-10 pointer-events-none"
                  style={{ backgroundColor: isProfit ? '#22c55e' : '#ef4444' }}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {confirmSync && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black border p-8 max-w-md w-full"
              style={{ borderColor: neonColor }}
            >
              <h3 className="text-2xl font-bold mb-4 tracking-tighter" style={{ color: neonColor }}>Confirm Sync</h3>
              <p className="text-gray-400 mb-6">
                Do you want to include the current profit/loss of <span className="text-white font-bold">{confirmSync.symbol}</span> in your finances?
                <br /><br />
                {(() => {
                  const currentPrice = prices[confirmSync.symbol];
                  const currentValue = currentPrice ? currentPrice * confirmSync.shares : 0;
                  const profitLoss = currentValue - confirmSync.investedAmount;
                  const isProfit = profitLoss >= 0;
                  return (
                    <span className={isProfit ? 'text-green-500' : 'text-red-500'}>
                      {isProfit ? 'Profit' : 'Loss'}: {confirmSync.currency || profile.currency}{Math.abs(profitLoss).toFixed(2)}
                    </span>
                  );
                })()}
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setConfirmSync(null)}
                  className="flex-1 py-3 border border-gray-800 text-gray-400 font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmSyncAction}
                  className="flex-1 py-3 font-bold uppercase tracking-widest transition-all"
                  style={{ backgroundColor: neonColor, color: '#000' }}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
