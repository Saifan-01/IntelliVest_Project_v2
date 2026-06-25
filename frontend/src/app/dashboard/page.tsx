'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import { OverviewChart } from '@/components/dashboard/OverviewChart';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { AIInsights } from '@/components/dashboard/AIInsights';
import { StockIntelligence } from '@/components/dashboard/StockIntelligence';
import { Activity, CreditCard, DollarSign, Wallet, LogOut, Edit2, Check, X, TrendingUp, TrendingDown, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [portfolioLive, setPortfolioLive] = useState<any>(null);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  const [editingBalance, setEditingBalance] = useState(false);
  const [newBalanceInput, setNewBalanceInput] = useState('');

  useEffect(() => {
    const token = Cookies.get('token');
    const userData = Cookies.get('user');
    if (!token) {
      router.push('/login');
      return;
    }
    if (userData) setUser(JSON.parse(userData));

    const fetchDashboard = async () => {
      try {
        const res = await api.get('/transactions');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchPortfolioLive = async () => {
      try {
        const res = await api.get('/portfolio/live');
        setPortfolioLive(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchPortfolio = async () => {
      try {
        const res = await api.get('/portfolio');
        setPortfolio(res.data);
      } catch (err) {}
    };

    fetchDashboard();
    fetchPortfolioLive();
    fetchPortfolio();

    const interval = setInterval(fetchPortfolioLive, 60000); // 1 minute
    return () => clearInterval(interval);
  }, [router]);

  const totalCost = portfolioLive?.total_cost || 0;
  const liveValue = portfolioLive?.live_value || 0;

  const handleUpdateBalance = async () => {
    try {
      const val = parseFloat(newBalanceInput);
      if (isNaN(val)) return;
      await api.put('/me/balance', { initial_balance: val });
      setEditingBalance(false);
      
      // Refresh dashboard data
      const res = await api.get('/transactions');
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (planId: number, symbol: string, quantityInr: number) => {
    try {
      const res = await api.delete(`/portfolio/${planId}`);
      const refunded = res.data?.refunded_inr || 0;
      toast.success(`Removed ${symbol} — ₹${refunded.toLocaleString('en-IN', { maximumFractionDigits: 2 })} deducted from Total Cost`);
      // Refresh portfolio and live stats
      const [pRes, lRes] = await Promise.all([api.get('/portfolio'), api.get('/portfolio/live')]);
      setPortfolio(pRes.data);
      setPortfolioLive(lRes.data);
    } catch (err) {
      toast.error('Failed to remove asset');
    }
  };

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern animate-grid opacity-30"></div>
        <motion.div 
          animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-indigo-500 font-mono text-xl tracking-widest uppercase"
        >
          Initializing Systems...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 relative overflow-hidden text-white">
      
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto space-y-6 relative z-10"
      >
        <motion.header variants={item} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
          <div>
            <h2 className="text-4xl md:text-5xl font-gasoek uppercase tracking-wide text-white">Command Center</h2>
            <p className="text-[#4CC9F0] font-mono text-sm mt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#4CC9F0] animate-pulse"></span>
              Operator: {user?.name || 'Unknown'}
            </p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#FF3366] hover:bg-[#FF3366]/80 text-white rounded-full transition-colors text-sm font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(255,51,102,0.4)]"
          >
            <LogOut className="w-4 h-4" /> Disconnect
          </button>
        </motion.header>

        <motion.div variants={item} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[2rem] p-6 relative overflow-hidden bg-gradient-to-br from-[#E8FF5A]/20 to-[#39FF14]/10 border border-[#E8FF5A]/30 backdrop-blur-xl group cursor-default">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#E8FF5A] rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Total Cost</h3>
                </div>
                <div className="p-2 bg-[#E8FF5A]/20 rounded-xl">
                  <DollarSign className="h-5 w-5 text-[#E8FF5A]" />
                </div>
              </div>
              <div className="text-4xl font-gasoek text-white mt-2 drop-shadow-md">₹{totalCost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
              <div className="text-xs text-white/50 font-bold uppercase mt-1">Total Capital Allocated to Assets</div>
            </div>
          </div>
          
          <div className="rounded-[2rem] p-6 relative overflow-hidden bg-gradient-to-br from-[#4CC9F0]/20 to-transparent border border-[#4CC9F0]/30 backdrop-blur-xl group cursor-default">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#4CC9F0] rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex flex-row items-center justify-between pb-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Asset Inflow</h3>
                <div className="p-2 bg-[#4CC9F0]/20 rounded-xl">
                  <Wallet className="h-5 w-5 text-[#4CC9F0]" />
                </div>
              </div>
              <div className="text-4xl font-gasoek text-[#4CC9F0] mt-2">+₹{(portfolioLive?.inflow || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="text-xs text-[#4CC9F0]/70 font-bold uppercase mt-1">Total Profit Inflow</div>
            </div>
          </div>
          
          <div className="rounded-[2rem] p-6 relative overflow-hidden bg-gradient-to-br from-[#FF3366]/20 to-transparent border border-[#FF3366]/30 backdrop-blur-xl group cursor-default">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF3366] rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex flex-row items-center justify-between pb-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Capital Outflow</h3>
                <div className="p-2 bg-[#FF3366]/20 rounded-xl">
                  <CreditCard className="h-5 w-5 text-[#FF3366]" />
                </div>
              </div>
              <div className="text-4xl font-gasoek text-[#FF3366] mt-2">-₹{(portfolioLive?.outflow || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="text-xs text-[#FF3366]/70 font-bold uppercase mt-1">Total Loss Outflow</div>
            </div>
          </div>
          
          {/* Replace Activity Index with Live P&L */}
          <div className={`rounded-[2rem] p-6 relative overflow-hidden border backdrop-blur-xl group cursor-default transition-colors ${
            !portfolioLive ? 'bg-white/5 border-white/10' : 
            portfolioLive.pnl >= 0 ? 'bg-gradient-to-br from-[#39FF14]/20 to-transparent border-[#39FF14]/30' : 'bg-gradient-to-br from-[#FF3366]/20 to-transparent border-[#FF3366]/30'
          }`}>
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity ${
              !portfolioLive ? 'bg-white/10' : portfolioLive.pnl >= 0 ? 'bg-[#39FF14]' : 'bg-[#FF3366]'
            }`}></div>
            <div className="relative z-10">
              <div className="flex flex-row items-center justify-between pb-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live Portfolio P&L</h3>
                <div className={`p-2 rounded-xl ${!portfolioLive ? 'bg-white/10' : portfolioLive.pnl >= 0 ? 'bg-[#39FF14]/20' : 'bg-[#FF3366]/20'}`}>
                  {portfolioLive?.pnl >= 0 ? <TrendingUp className={`h-5 w-5 ${portfolioLive ? 'text-[#39FF14]' : 'text-white/50'}`} /> : <TrendingDown className="h-5 w-5 text-[#FF3366]" />}
                </div>
              </div>
              <div className={`text-4xl font-gasoek mt-2 ${!portfolioLive ? 'text-white/50' : portfolioLive.pnl >= 0 ? 'text-[#39FF14]' : 'text-[#FF3366]'}`}>
                {portfolioLive?.pnl >= 0 ? '+' : ''}₹{Math.abs(portfolioLive?.pnl || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
              <div className="text-xs text-white/50 font-bold uppercase mt-1">
                ({portfolioLive?.pnl >= 0 ? '+' : ''}{(portfolioLive?.pnl_percent || 0).toFixed(2)}%) SYNCS MINUTELY
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* AI STOCK INTELLIGENCE - MOVED TO TOP AS STANDOUT FEATURE */}
        <motion.div variants={item} className="mt-8 mb-8">
          <StockIntelligence />
        </motion.div>

        <motion.div variants={item}>
          <AIInsights />
        </motion.div>
        
        <motion.div variants={item} className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl p-6">
            <h3 className="text-2xl font-gasoek uppercase text-white mb-6 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#9D4EDD] animate-pulse"></div>
              Capital Flow Overview
            </h3>
            <div className="h-[350px]">
              <OverviewChart chartData={data?.chart} />
            </div>
          </div>
          
          <div className="col-span-3 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl p-6 flex flex-col">
            <div className="mb-6">
              <h3 className="text-2xl font-gasoek uppercase text-white">Recent Telemetry</h3>
              <p className="text-sm text-slate-400 mt-1 font-bold">Last {data?.transactions?.length || 0} recorded financial movements.</p>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <RecentTransactions transactions={data?.transactions || []} />
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="grid gap-6 md:grid-cols-2 mt-6">
          <div className="rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl p-6 flex flex-col h-[400px]">
            <h3 className="text-2xl font-gasoek uppercase text-white mb-6 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#E8FF5A] animate-pulse"></div>
              Asset Portfolio
            </h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
              {portfolio.length === 0 ? (
                <div className="text-center text-slate-500 font-mono mt-10">No assets in portfolio</div>
              ) : (
                <AnimatePresence>
                  {portfolio.map((p) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 60, transition: { duration: 0.3 } }}
                      layout
                      className="flex justify-between items-center p-3 rounded-xl bg-black/50 border border-white/5 hover:border-[#E8FF5A]/30 transition-colors group"
                    >
                      <div>
                        <div className="font-bold font-mono text-[#E8FF5A]">{p.symbol}</div>
                        <div className="text-xs text-slate-400 truncate w-32">{p.company_name}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-bold font-mono">{p.quantity} <span className="text-slate-500 text-xs">units</span></div>
                          <div className="text-xs text-slate-400">
                            {p.currency !== 'INR' ? `${p.currency} ${p.purchase_price}` : `₹${p.purchase_price}`}
                            {p.currency !== 'INR' && <span className="text-[#E8FF5A] ml-1">≈ ₹{(p.purchase_price_inr || p.purchase_price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemove(p.id, p.symbol, (p.purchase_price_inr || p.purchase_price) * p.quantity)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg bg-[#FF3366]/10 border border-[#FF3366]/20 hover:bg-[#FF3366]/30 text-[#FF3366]"
                          title="Remove from portfolio"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl p-6 flex flex-col h-[400px]">
            <h3 className="text-2xl font-gasoek uppercase text-white mb-6 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#4CC9F0] animate-pulse"></div>
              Capital Allocation Stats
            </h3>
            <div className="flex-1 flex flex-col justify-center space-y-4">
              {portfolio.length === 0 ? (
                <div className="text-center text-slate-500 font-mono">Allocate capital to see stats</div>
              ) : (
                <>
                  {portfolio.slice(0, 5).map((p, i) => {
                    const cost = p.quantity * (p.purchase_price_inr || p.purchase_price);
                    const percent = totalCost > 0 ? (cost / totalCost) * 100 : 0;
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-sm font-mono font-bold">
                          <span className="text-[#4CC9F0]">{p.symbol}</span>
                          <span>{percent.toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-white/10">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-[#4CC9F0]"
                          />
                        </div>
                      </div>
                    );
                  })}
                  {portfolio.length > 5 && (
                    <div className="text-xs text-slate-500 font-mono text-center mt-4">
                      + {portfolio.length - 5} more assets
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
