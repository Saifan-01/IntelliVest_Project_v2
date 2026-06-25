import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface StockChartModalProps {
  stock: any | null;
  onClose: () => void;
}

// Map currency symbol → code
const CURRENCY_CODE_MAP: Record<string, string> = {
  '₹': 'INR', '$': 'USD', '£': 'GBP', '¥': 'JPY'
};

export default function StockChartModal({ stock, onClose }: StockChartModalProps) {
  const container = useRef<HTMLDivElement>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [loadingRate, setLoadingRate] = useState(false);

  // Determine currency code from stock.currency symbol or default to INR
  const currencySymbol = stock?.currency || '₹';
  const currencyCode = CURRENCY_CODE_MAP[currencySymbol] || stock?.currency_code || 'INR';
  const isINR = currencyCode === 'INR';
  const priceInr = stock ? stock.price * exchangeRate : 0;
  const totalInr = priceInr * quantity;

  // Fetch live exchange rate whenever stock changes
  useEffect(() => {
    if (!stock) return;
    if (isINR) { setExchangeRate(1); return; }

    setLoadingRate(true);
    api.get('/market/exchange-rates')
      .then(res => {
        const rate = res.data[currencyCode];
        setExchangeRate(rate || 1);
      })
      .catch(() => {
        // Fallback approximate rates
        const fallbacks: Record<string, number> = { USD: 83.5, GBP: 106.0, JPY: 0.55 };
        setExchangeRate(fallbacks[currencyCode] || 1);
      })
      .finally(() => setLoadingRate(false));
  }, [stock?.symbol]);

  // TradingView chart widget
  useEffect(() => {
    if (!stock?.symbol || !container.current) return;
    container.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;

    let tvSymbol = stock.symbol;
    if (tvSymbol.endsWith('.NS')) tvSymbol = 'BSE:' + tvSymbol.replace('.NS', '');
    else if (tvSymbol.endsWith('.BO')) tvSymbol = 'BSE:' + tvSymbol.replace('.BO', '');

    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: tvSymbol,
      interval: "D",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      enable_publishing: false,
      backgroundColor: "rgba(15, 23, 42, 0.9)",
      gridColor: "rgba(255, 255, 255, 0.05)",
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      container_id: "tradingview_widget"
    });

    container.current.appendChild(script);
  }, [stock?.symbol]);

  const handleAdd = async () => {
    if (!stock) return;
    setAdding(true);
    try {
      await api.post('/portfolio', {
        symbol: stock.symbol,
        company_name: stock.name,
        quantity: quantity,
        purchase_price: stock.price,
        currency: currencyCode,
        exchange_rate: exchangeRate,
      });
      toast.success(
        `Added ${quantity}x ${stock.symbol} — ₹${totalInr.toLocaleString('en-IN', { maximumFractionDigits: 2 })} added to Total Cost`
      );
      onClose();
    } catch (err: any) {
      toast.error('Failed to add to portfolio');
    } finally {
      setAdding(false);
    }
  };

  if (!stock) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="glass-card w-full h-full max-w-6xl max-h-[85vh] rounded-2xl overflow-hidden border border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.2)] relative z-10 flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/80 flex-shrink-0">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-white font-mono uppercase tracking-wider">{stock.symbol} <span className="text-emerald-500">Live Chart</span></h3>
              <span className="text-sm text-slate-400 font-bold">{stock.name}</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Quantity input */}
              <div className="flex items-center bg-black/50 border border-white/10 rounded-lg overflow-hidden h-10">
                <span className="px-3 text-slate-400 font-mono text-sm border-r border-white/10">QTY</span>
                <input 
                  type="number" 
                  min="0.1" 
                  step="0.1" 
                  value={quantity} 
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="bg-transparent text-white w-20 px-3 outline-none font-mono text-sm h-full"
                />
              </div>

              {/* INR Preview badge */}
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1 h-10 px-4 bg-slate-800/80 border border-white/10 rounded-lg">
                  {loadingRate ? (
                    <RefreshCw className="w-3 h-3 text-slate-400 animate-spin" />
                  ) : (
                    <>
                      <span className="text-slate-400 font-mono text-xs">{currencySymbol}{stock.price.toLocaleString()}</span>
                      {!isINR && (
                        <>
                          <span className="text-slate-600 mx-1">→</span>
                          <span className="text-[#E8FF5A] font-mono text-sm font-bold">₹{priceInr.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                        </>
                      )}
                    </>
                  )}
                </div>
                {!isINR && !loadingRate && (
                  <span className="text-xs text-slate-500 font-mono mt-0.5">
                    1 {currencyCode} = ₹{exchangeRate.toFixed(2)} (live)
                  </span>
                )}
              </div>

              {/* Total INR pill */}
              <div className="flex items-center h-10 px-4 bg-emerald-900/40 border border-emerald-500/30 rounded-lg">
                <span className="text-emerald-400 font-mono text-sm font-bold">
                  Total: ₹{totalInr.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
              </div>

              <button 
                onClick={handleAdd}
                disabled={adding || loadingRate}
                className="flex items-center gap-2 h-10 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                {adding ? 'Adding...' : 'Add to Portfolio'}
              </button>
              <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10">
                  <X className="w-5 h-5" />
                </div>
              </button>
            </div>
          </div>
          
          <div className="flex-1 w-full bg-slate-900/50 relative" ref={container}>
            {/* TradingView Widget injects here */}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
