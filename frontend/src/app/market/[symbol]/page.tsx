'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, TrendingUp, TrendingDown, Clock, Activity, BarChart2, DollarSign, Loader2 } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import api from '@/lib/api';

const timeframes = ['1W', '1M', '3M', '6M', '1Y', '5Y'];

export default function AssetTerminal({ params }: { params: Promise<{ symbol: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const symbol = decodeURIComponent(resolvedParams.symbol);

  const [timeframe, setTimeframe] = useState('1Y');
  const [history, setHistory] = useState<any[]>([]);
  const [intel, setIntel] = useState<any>(null);
  const [loadingHist, setLoadingHist] = useState(true);
  const [loadingIntel, setLoadingIntel] = useState(true);

  // Fetch History
  useEffect(() => {
    const fetchHistory = async () => {
      setLoadingHist(true);
      try {
        const res = await api.get(`/market/history/${symbol}?range=${timeframe}`);
        setHistory(res.data);
      } catch (err) {
        console.error("Failed to fetch history");
      } finally {
        setLoadingHist(false);
      }
    };
    fetchHistory();
  }, [symbol, timeframe]);

  // Fetch Intel
  useEffect(() => {
    const fetchIntel = async () => {
      try {
        const res = await api.get(`/intel/analyze/${symbol}`);
        setIntel(res.data);
      } catch (err) {
        console.error("Failed to fetch intel");
      } finally {
        setLoadingIntel(false);
      }
    };
    fetchIntel();
  }, [symbol]);

  const priceDiff = history.length > 0 ? history[history.length - 1].price - history[0].price : 0;
  const isPos = priceDiff >= 0;
  const currentPrice = history.length > 0 ? history[history.length - 1].price : 0;
  const pctChange = history.length > 0 ? (priceDiff / history[0].price) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto px-6 animate-in fade-in duration-700">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-6 font-mono text-sm uppercase tracking-wider"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Market
      </button>

      {/* Header Panel */}
      <div className="rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl p-8 mb-6 relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 pointer-events-none transition-colors duration-1000 ${
          isPos ? 'bg-[#39FF14]' : 'bg-[#FF3366]'
        }`} />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl md:text-6xl font-gasoek uppercase text-white tracking-wider">{symbol}</h1>
              {intel && intel.verdict !== 'N/A' && (
                <span 
                  className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border"
                  style={{ color: intel.verdict_color, borderColor: intel.verdict_color + '50', backgroundColor: intel.verdict_color + '18' }}
                >
                  {intel.verdict}
                </span>
              )}
            </div>
            <p className="text-sm font-mono text-slate-400 uppercase tracking-widest">Asset Analytics Terminal</p>
          </div>

          <div className="text-left md:text-right">
            <div className="text-4xl md:text-5xl font-mono font-bold text-white mb-1">
              ${currentPrice > 0 ? currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '---'}
            </div>
            <div className={`flex items-center md:justify-end gap-2 text-lg font-bold font-mono ${isPos ? 'text-[#39FF14]' : 'text-[#FF3366]'}`}>
              {isPos ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              {isPos ? '+' : ''}{priceDiff.toFixed(2)} ({isPos ? '+' : ''}{pctChange.toFixed(2)}%)
              <span className="text-slate-500 text-xs ml-1 font-sans">{timeframe}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Column */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-gasoek uppercase text-white flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-slate-400" /> Price Action
              </h3>
              
              <div className="flex bg-black/40 rounded-lg p-1 border border-white/10">
                {timeframes.map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1 rounded-md text-xs font-mono font-bold transition-colors ${
                      timeframe === tf 
                        ? 'bg-white/20 text-white shadow-sm' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[400px] w-full">
              {loadingHist ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  <span className="font-mono text-xs uppercase tracking-widest">Loading Telemetry...</span>
                </div>
              ) : history.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-slate-500 font-mono text-sm uppercase">
                  No data available for {timeframe}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isPos ? "#39FF14" : "#FF3366"} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={isPos ? "#39FF14" : "#FF3366"} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="rgba(255,255,255,0.2)" 
                      fontSize={10}
                      tickLine={false}
                      minTickGap={30}
                    />
                    <YAxis 
                      domain={['auto', 'auto']} 
                      stroke="rgba(255,255,255,0.2)" 
                      fontSize={10}
                      tickLine={false}
                      tickFormatter={(val) => `$${val}`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#050505', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                      labelStyle={{ color: '#888', marginBottom: '4px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke={isPos ? "#39FF14" : "#FF3366"} 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorPrice)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Intelligence Column */}
        <div className="space-y-6">
          <div className="rounded-[2rem] bg-gradient-to-br from-[#9D4EDD]/10 to-transparent border border-[#9D4EDD]/30 backdrop-blur-xl p-6 relative overflow-hidden group">
            <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] bg-[#9D4EDD]/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-[#9D4EDD]/30 transition-colors duration-1000"></div>
            
            <h3 className="text-lg font-gasoek uppercase text-white mb-6 flex items-center gap-2 relative z-10">
              <div className="w-2 h-2 rounded-full bg-[#9D4EDD] animate-pulse"></div>
              AI Intelligence
            </h3>

            {loadingIntel ? (
              <div className="py-10 flex justify-center text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : intel && !intel.error ? (
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    <svg width="60" height="60" viewBox="0 0 60 60" className="rotate-[-90deg]">
                      <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                      <motion.circle 
                        cx="30" cy="30" r="26" fill="none" stroke={intel.verdict_color} strokeWidth="6"
                        strokeDasharray={163}
                        initial={{ strokeDashoffset: 163 }}
                        animate={{ strokeDashoffset: 163 - (intel.score / 100) * 163 }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                      />
                    </svg>
                    <div className="absolute mt-[18px] ml-1 text-xs font-bold font-mono">{intel.score}</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold uppercase tracking-wider text-slate-300">Conviction Score</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">Algorithm Confidence</div>
                  </div>
                </div>

                <div className="space-y-2">
                  {intel.reasons.map((r: string, i: number) => (
                    <div key={i} className="flex gap-3 text-sm text-slate-300 bg-black/40 p-3 rounded-xl border border-white/5">
                      <Activity className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: intel.verdict_color }} />
                      <span className="leading-snug">{r}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                  <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                    <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Analyst Target</div>
                    <div className="text-sm font-mono font-bold text-white mt-0.5">{intel.analyst_target ? `$${intel.analyst_target}` : 'N/A'}</div>
                  </div>
                  <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                    <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">P/E Ratio</div>
                    <div className="text-sm font-mono font-bold text-white mt-0.5">{intel.pe_ratio ? `${intel.pe_ratio}x` : 'N/A'}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm font-mono text-slate-500">Analysis unavailable.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
