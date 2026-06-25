import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Newspaper, RefreshCw, ChevronDown, ChevronUp, BarChart2, Target, Activity, AlertCircle, ExternalLink } from 'lucide-react';
import api from '@/lib/api';

interface StockAnalysis {
  symbol: string;
  score: number;
  verdict: string;
  verdict_color: string;
  horizon: string;
  reasons: string[];
  current_price: number;
  day_change_pct: number;
  wk52_high?: number;
  wk52_low?: number;
  pe_ratio?: number;
  eps_growth?: number;
  rev_growth?: number;
  market_cap?: number;
  analyst_target?: number;
  analyst_upside?: number;
  trend_slope: number;
  news: { title: string; link: string; date: string; source: string }[];
  error?: string;
}

const verdictBg: Record<string, string> = {
  'STRONG BUY': 'from-[#39FF14]/20 to-[#39FF14]/5 border-[#39FF14]/40',
  'BUY':        'from-[#4CC9F0]/20 to-[#4CC9F0]/5 border-[#4CC9F0]/40',
  'HOLD':       'from-[#E8FF5A]/20 to-[#E8FF5A]/5 border-[#E8FF5A]/40',
  'REDUCE':     'from-[#FF9933]/20 to-[#FF9933]/5 border-[#FF9933]/40',
  'SELL':       'from-[#FF3366]/20 to-[#FF3366]/5 border-[#FF3366]/40',
  'N/A':        'from-white/5 to-white/2 border-white/10',
};

function ScoreArc({ score, color }: { score: number; color: string }) {
  const radius = 40;
  const circumference = Math.PI * radius; // half circle
  const offset = circumference - (score / 100) * circumference;
  return (
    <svg width="96" height="54" viewBox="0 0 96 54" className="overflow-visible">
      {/* Track */}
      <path d="M8 48 A40 40 0 0 1 88 48" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" strokeLinecap="round" />
      {/* Progress */}
      <motion.path
        d="M8 48 A40 40 0 0 1 88 48"
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
      <text x="48" y="44" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold" fontFamily="monospace">{score}</text>
    </svg>
  );
}

function StockCard({ data }: { data: StockAnalysis }) {
  const [expanded, setExpanded] = useState(false);
  const isPos = data.day_change_pct >= 0;
  const bg = verdictBg[data.verdict] || verdictBg['N/A'];

  const fmtCap = (v?: number) => {
    if (!v) return '—';
    if (v >= 1e12) return `$${(v / 1e12).toFixed(1)}T`;
    if (v >= 1e9)  return `$${(v / 1e9).toFixed(1)}B`;
    if (v >= 1e6)  return `$${(v / 1e6).toFixed(1)}M`;
    return `$${v.toFixed(0)}`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-[1.5rem] border bg-gradient-to-br ${bg} backdrop-blur-xl overflow-hidden`}
    >
      {/* Header row */}
      <div className="p-5 flex items-start justify-between gap-4">
        {/* Left: score arc + symbol */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <ScoreArc score={data.score} color={data.verdict_color} />
            <span className="text-[10px] font-mono text-slate-400 uppercase mt-0.5">AI Score</span>
          </div>
          <div>
            <div className="text-2xl font-gasoek uppercase tracking-wider" style={{ color: data.verdict_color }}>{data.symbol}</div>
            <div
              className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-widest border"
              style={{ color: data.verdict_color, borderColor: data.verdict_color + '50', backgroundColor: data.verdict_color + '18' }}
            >
              {data.verdict}
            </div>
            <div className="text-xs text-slate-400 font-mono mt-1">{data.horizon} horizon</div>
          </div>
        </div>

        {/* Right: price + day change */}
        <div className="text-right flex-shrink-0">
          <div className="text-2xl font-bold font-mono text-white">{data.current_price?.toLocaleString()}</div>
          <div className={`flex items-center justify-end gap-1 text-sm font-bold ${isPos ? 'text-[#39FF14]' : 'text-[#FF3366]'}`}>
            {isPos ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {isPos ? '+' : ''}{data.day_change_pct?.toFixed(2)}%
          </div>
          {data.analyst_upside !== null && data.analyst_upside !== undefined && (
            <div className="text-xs text-slate-400 font-mono mt-1">
              Target: <span className={data.analyst_upside >= 0 ? 'text-[#4CC9F0]' : 'text-[#FF3366]'}>{data.analyst_upside >= 0 ? '+' : ''}{data.analyst_upside}%</span>
            </div>
          )}
        </div>
      </div>

      {/* AI Reasoning */}
      <div className="px-5 pb-3">
        <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">
          <Activity className="w-3 h-3" /> AI Analysis
        </div>
        <ul className="space-y-1">
          {data.reasons.map((r, i) => (
            <li key={i} className="text-xs text-slate-300 flex gap-2">
              <span style={{ color: data.verdict_color }} className="flex-shrink-0 mt-0.5">▸</span>
              {r}
            </li>
          ))}
        </ul>
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-500 hover:text-white transition-colors border-t border-white/5"
      >
        {expanded ? <><ChevronUp className="w-3 h-3" />Less</> : <><ChevronDown className="w-3 h-3" />News & Metrics</>}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4">
              {/* Metrics row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'P/E Ratio',   value: data.pe_ratio   != null ? `${data.pe_ratio}x` : '—' },
                  { label: 'EPS Growth',  value: data.eps_growth  != null ? `${data.eps_growth}%` : '—' },
                  { label: 'Rev Growth',  value: data.rev_growth  != null ? `${data.rev_growth}%` : '—' },
                  { label: 'Market Cap',  value: fmtCap(data.market_cap) },
                  { label: '52W High',    value: data.wk52_high  != null ? data.wk52_high.toLocaleString() : '—' },
                  { label: '52W Low',     value: data.wk52_low   != null ? data.wk52_low.toLocaleString() : '—' },
                  { label: 'Trend',       value: data.trend_slope != 0 ? `${data.trend_slope > 0 ? '+' : ''}${data.trend_slope}%` : 'Flat' },
                  { label: 'Analyst Tgt', value: data.analyst_target != null ? data.analyst_target.toLocaleString() : '—' },
                ].map(m => (
                  <div key={m.label} className="bg-black/40 rounded-xl p-3 border border-white/5">
                    <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">{m.label}</div>
                    <div className="text-sm font-mono font-bold text-white mt-0.5">{m.value}</div>
                  </div>
                ))}
              </div>

              {/* News feed */}
              {data.news.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                      <Newspaper className="w-3 h-3" /> Live News
                    </div>
                    <Link 
                      href={`/market/${data.symbol}`}
                      className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white hover:text-[#9D4EDD] transition-colors bg-white/5 hover:bg-white/10 px-2 py-1 rounded-md"
                    >
                      <ExternalLink className="w-3 h-3" /> View Terminal
                    </Link>
                  </div>
                  <div className="space-y-2">
                    {data.news.map((n, i) => (
                      <a
                        key={i}
                        href={n.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex gap-3 p-3 bg-black/40 border border-white/5 rounded-xl hover:border-white/20 transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-white font-medium group-hover:text-[#4CC9F0] transition-colors line-clamp-2">{n.title}</div>
                          <div className="text-[10px] text-slate-500 mt-1 font-mono">{n.source} · {n.date}</div>
                        </div>
                        <span className="text-slate-600 group-hover:text-[#4CC9F0] transition-colors flex-shrink-0">↗</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function StockIntelligence() {
  const [analyses, setAnalyses] = useState<StockAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const fetchAnalyses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/intel/analyze');
      setAnalyses(res.data);
      setLastFetch(new Date());
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalyses();
  }, [fetchAnalyses]);

  if (analyses.length === 0 && !loading) {
    return (
      <div className="rounded-[2rem] bg-white/5 border border-white/10 p-10 text-center">
        <AlertCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-500 font-mono uppercase text-sm">Add stocks to your portfolio to see AI predictions</p>
      </div>
    );
  }

  return (
    <div className="relative rounded-[2rem] bg-gradient-to-br from-[#9D4EDD]/10 to-transparent border border-[#9D4EDD]/30 backdrop-blur-xl p-6 lg:p-8 overflow-hidden group">
      {/* Background glowing orb */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#9D4EDD]/20 rounded-full blur-[120px] pointer-events-none group-hover:bg-[#9D4EDD]/30 transition-colors duration-1000"></div>
      
      <div className="relative z-10 flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-full bg-[#9D4EDD]/20 border border-[#9D4EDD]/30 text-[#9D4EDD] text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#9D4EDD] animate-pulse" />
              Standout Feature
            </span>
          </div>
          <h3 className="text-3xl md:text-4xl font-gasoek uppercase text-white drop-shadow-md">
            AI Stock Intelligence
          </h3>
          <p className="text-sm font-mono text-[#9D4EDD]/80 mt-2 uppercase tracking-wide">
            Quantitative scoring · Fundamentals · Live news · Trading Signals
          </p>
        </div>
        <button
          onClick={fetchAnalyses}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#9D4EDD]/20 border border-[#9D4EDD]/30 text-[#9D4EDD] hover:bg-[#9D4EDD]/30 transition-colors text-sm font-bold disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Analysing...' : 'Refresh'}
        </button>
      </div>

      {loading && analyses.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-[1.5rem] border border-white/10 p-5 animate-pulse space-y-3">
              <div className="h-16 bg-white/5 rounded-xl" />
              <div className="h-4 bg-white/5 rounded-lg w-2/3" />
              <div className="h-4 bg-white/5 rounded-lg w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {analyses.map(a => <StockCard key={a.symbol} data={a} />)}
          </AnimatePresence>
        </div>
      )}

      {lastFetch && (
        <p className="text-[10px] text-slate-600 font-mono mt-4 text-right uppercase">
          Last analysis: {lastFetch.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
