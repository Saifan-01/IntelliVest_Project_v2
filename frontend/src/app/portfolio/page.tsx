'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Briefcase, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import StockChartModal from '@/components/StockChartModal';

const container: any = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item: any = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

export default function PortfolioPage() {
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [liveData, setLiveData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAsset, setNewAsset] = useState({ symbol: '', company_name: '', quantity: 1, purchase_price: 0 });
  
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedChartSymbol, setSelectedChartSymbol] = useState<string | null>(null);

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchPortfolio();
  }, [router]);

  useEffect(() => {
    if (newAsset.symbol.length >= 2 && !newAsset.company_name) {
      const delayDebounceFn = setTimeout(async () => {
        setIsSearching(true);
        try {
          const res = await api.get(`/market/search?q=${newAsset.symbol}`);
          setSearchResults(res.data);
        } catch (err) {
          console.error('Search error', err);
        } finally {
          setIsSearching(false);
        }
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    } else {
      setSearchResults([]);
    }
  }, [newAsset.symbol]);

  const fetchPortfolio = async () => {
    try {
      const res = await api.get('/portfolio');
      setPortfolio(res.data);
      setLoading(false); // Render immediately
      if (res.data.length > 0) {
        fetchLivePrices(res.data.map((p: any) => p.symbol)); // Fetch live prices in the background
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchLivePrices = async (symbols: string[]) => {
    setRefreshing(true);
    try {
      const res = await api.post('/market/stocks', { symbols });
      const marketData = res.data.reduce((acc: any, stock: any) => {
        acc[stock.symbol] = stock;
        return acc;
      }, {});
      setLiveData(marketData);
    } catch (err) {
      toast.error('Failed to sync live market data');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/portfolio', newAsset);
      toast.success('Asset Tracked');
      setNewAsset({ symbol: '', company_name: '', quantity: 1, purchase_price: 0 });
      setShowAddForm(false);
      fetchPortfolio();
    } catch (err) {
      toast.error('Failed to track asset');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/portfolio/${id}`);
      toast.success('Asset Removed');
      fetchPortfolio();
    } catch (err) {
      toast.error('Failed to remove asset');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center relative overflow-hidden">
        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="text-emerald-500 font-mono text-xl tracking-widest uppercase">
          Syncing Portfolio Telemetry...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 relative overflow-hidden text-white">
      
      <motion.div variants={container} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        <motion.header variants={item} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl mt-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#39FF14] rounded-2xl shadow-[0_0_20px_rgba(57,255,20,0.5)]">
              <Briefcase className="w-8 h-8 text-black" />
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-gasoek uppercase tracking-wide text-white">Asset Portfolio</h2>
              <p className="text-[#39FF14] font-mono text-sm mt-2 font-bold">Live market tracking and holdings</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => fetchLivePrices(portfolio.map(p => p.symbol))}
              variant="outline"
              className="border-[#39FF14]/30 text-[#39FF14] hover:bg-[#39FF14]/10 font-mono h-12 px-6 rounded-full transition-all flex items-center gap-2 uppercase font-bold"
              disabled={refreshing || portfolio.length === 0}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Sync
            </Button>
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-[#39FF14] hover:bg-[#39FF14]/80 text-black font-gasoek h-12 px-6 rounded-full shadow-[0_0_20px_rgba(57,255,20,0.4)] transition-all flex items-center gap-2 text-sm uppercase tracking-wider"
            >
              <Plus className="w-5 h-5" /> Track Asset
            </Button>
          </div>
        </motion.header>

        <AnimatePresence>
          {showAddForm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowAddForm(false)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-[#0A0A0A] w-full max-w-lg rounded-[2.5rem] overflow-visible border border-[#39FF14]/50 shadow-[0_0_50px_rgba(57,255,20,0.2)] relative z-10"
              >
                <div className="p-8 border-b border-white/5 flex justify-between items-center">
                  <h3 className="text-2xl font-gasoek text-white uppercase tracking-wider">Initialize Tracking</h3>
                  <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-white transition-colors">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-[#FF3366] hover:text-white transition-colors">✕</div>
                  </button>
                </div>
                
                <form onSubmit={handleAddAsset} className="p-6 space-y-6">
                  <div className="space-y-2 relative">
                    <Label className="text-slate-300 font-mono text-xs uppercase tracking-wider">Stock Symbol / Ticker</Label>
                    <Input 
                      required 
                      placeholder="e.g. RELIANCE, AAPL" 
                      value={newAsset.symbol} 
                      onChange={e => setNewAsset({...newAsset, symbol: e.target.value.toUpperCase(), company_name: ''})} 
                      className="bg-black/50 border-white/10 text-white h-12 uppercase text-lg focus-visible:ring-emerald-500/50" 
                    />
                    {isSearching && (
                      <div className="absolute right-4 top-10">
                        <RefreshCw className="w-5 h-5 text-emerald-500 animate-spin" />
                      </div>
                    )}
                    {searchResults.length > 0 && (
                      <div className="absolute z-50 w-full top-full mt-2 bg-slate-900 border border-emerald-500/30 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden max-h-60 overflow-y-auto">
                        {searchResults.map((result, idx) => (
                          <div 
                            key={idx}
                            onClick={() => {
                              setNewAsset({ ...newAsset, symbol: result.symbol, company_name: result.name });
                              setSearchResults([]);
                            }}
                            className="px-5 py-4 hover:bg-emerald-500/10 cursor-pointer border-b border-white/5 last:border-0 transition-colors"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-emerald-400 font-mono text-lg">{result.symbol}</span>
                              <span className="text-xs text-slate-400 bg-black/50 px-2 py-1 rounded font-mono border border-white/5">{result.exchange}</span>
                            </div>
                            <div className="text-sm text-slate-300 truncate mt-1">{result.name}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300 font-mono text-xs uppercase tracking-wider">Company Name</Label>
                    <Input required placeholder="Reliance Industries" value={newAsset.company_name} onChange={e => setNewAsset({...newAsset, company_name: e.target.value})} className="bg-black/50 border-white/10 text-white h-12 focus-visible:ring-emerald-500/50" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300 font-mono text-xs uppercase tracking-wider">Quantity</Label>
                      <Input type="number" min="0.01" step="0.01" required placeholder="10" value={newAsset.quantity} onChange={e => setNewAsset({...newAsset, quantity: parseFloat(e.target.value) || 0})} className="bg-black/50 border-white/10 text-white h-12 focus-visible:ring-emerald-500/50" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300 font-mono text-xs uppercase tracking-wider">Purchase Price (₹)</Label>
                      <Input type="number" min="0" step="0.01" required placeholder="1500" value={newAsset.purchase_price} onChange={e => setNewAsset({...newAsset, purchase_price: parseFloat(e.target.value) || 0})} className="bg-black/50 border-white/10 text-white h-12 focus-visible:ring-emerald-500/50" />
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button type="submit" className="w-full h-14 bg-[#39FF14] hover:bg-[#39FF14]/80 text-black font-gasoek text-lg tracking-wide rounded-2xl shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all uppercase">
                      Confirm Asset
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <motion.div variants={item} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {portfolio.map((asset) => {
            const liveInfo = liveData[asset.symbol] || { price: 0, change: 0 };
            const isPositive = liveInfo.change >= 0;
            const currentTotalValue = liveInfo.price * asset.quantity;
            const totalCost = asset.purchase_price * asset.quantity;
            const profitLoss = currentTotalValue - totalCost;
            const profitLossPercent = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;
            const isProfit = profitLoss >= 0;

            return (
              <motion.div 
                key={asset.id} 
                whileHover={{ y: -5 }} 
                onClick={() => setSelectedChartSymbol(asset.symbol)}
                className={`rounded-[2rem] p-8 relative group overflow-hidden border backdrop-blur-xl transition-all cursor-pointer ${
                  isProfit ? 'bg-[#39FF14]/10 border-[#39FF14]/30 hover:border-[#39FF14]/60' : 'bg-[#FF3366]/10 border-[#FF3366]/30 hover:border-[#FF3366]/60'
                }`}
              >
                <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px] opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity ${isProfit ? 'bg-[#39FF14]' : 'bg-[#FF3366]'}`}></div>
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div>
                    <h3 className="text-3xl font-gasoek text-white uppercase tracking-wider">{asset.symbol}</h3>
                    <p className="text-sm font-bold text-slate-400 mt-1 uppercase">{asset.company_name}</p>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(asset.id);
                    }} 
                    className="p-2 bg-black/40 rounded-xl text-slate-400 hover:text-[#FF3366] hover:bg-[#FF3366]/20 transition-colors opacity-0 group-hover:opacity-100 relative z-10 shadow-md"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-end relative z-10">
                  <div>
                    <p className="text-xs text-white/50 font-bold uppercase tracking-wider mb-2">Live Valuation</p>
                    <div className="text-4xl font-gasoek text-white drop-shadow-md">
                      {liveInfo.price > 0 ? `₹${currentTotalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'SYNCING...'}
                    </div>
                    <div className="text-xs text-white/70 mt-2 font-bold uppercase tracking-wider">
                      {asset.quantity} shares @ ₹{asset.purchase_price}
                    </div>
                  </div>
                  
                  {liveInfo.price > 0 && (
                    <div className="text-right">
                      <div className={`flex items-center justify-end gap-1 font-mono font-bold px-3 py-1.5 rounded-lg mb-2 shadow-inner ${isProfit ? 'bg-[#39FF14]/20 text-[#39FF14]' : 'bg-[#FF3366]/20 text-[#FF3366]'}`}>
                        {isProfit ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {isProfit ? '+' : ''}₹{Math.abs(profitLoss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className={`text-sm font-bold uppercase tracking-wider ${isProfit ? 'text-[#39FF14]' : 'text-[#FF3366]'}`}>
                        ({isProfit ? '+' : ''}{profitLossPercent.toFixed(2)}% P&L)
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {portfolio.length === 0 && !loading && (
          <div className="text-center py-20 text-slate-500 font-mono border border-dashed border-white/10 rounded-2xl glass-card">
            No assets currently tracked. Add a stock symbol to begin live monitoring.
          </div>
        )}
      </motion.div>

      <StockChartModal stock={selectedChartSymbol ? { symbol: selectedChartSymbol } : null} onClose={() => setSelectedChartSymbol(null)} />
    </div>
  );
}
