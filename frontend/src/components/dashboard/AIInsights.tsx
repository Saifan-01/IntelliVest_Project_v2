'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Sparkles, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

export function AIInsights() {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await api.get('/ai/insights');
        if (Array.isArray(res.data)) {
          setInsights(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch AI insights', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  return (
    <div className="rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl p-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#9D4EDD] rounded-full blur-[100px] opacity-10 pointer-events-none"></div>
      
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-[#9D4EDD] rounded-2xl shadow-[0_0_20px_rgba(157,78,221,0.5)]">
          <Cpu className="w-8 h-8 text-white" />
        </div>
        <div>
          <h3 className="text-3xl font-gasoek text-white uppercase flex items-center gap-3">
            IntelliVest Neural Engine <Sparkles className="w-6 h-6 text-[#E8FF5A]" />
          </h3>
          <p className="text-[#9D4EDD] font-bold text-sm mt-1 uppercase tracking-wider">Real-time analysis and strategic recommendations</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12 text-[#9D4EDD] font-gasoek text-xl animate-pulse tracking-widest uppercase">
          [ Processing Financial Telemetry... ]
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3 relative z-10">
          {insights.map((insight, index) => {
            let badgeColor = "bg-slate-500/20 text-slate-300 border-slate-500/50";
            if (insight.action === "BUY") badgeColor = "bg-[#39FF14]/20 text-[#39FF14] border-[#39FF14]/50 shadow-[0_0_15px_rgba(57,255,20,0.3)]";
            if (insight.action === "SELL") badgeColor = "bg-[#FF3366]/20 text-[#FF3366] border-[#FF3366]/50 shadow-[0_0_15px_rgba(255,51,102,0.3)]";
            if (insight.action === "HOLD") badgeColor = "bg-[#4CC9F0]/20 text-[#4CC9F0] border-[#4CC9F0]/50 shadow-[0_0_15px_rgba(76,201,240,0.3)]";

            return (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.15 }}
                className="p-6 rounded-3xl bg-black/50 border border-white/5 hover:border-[#9D4EDD]/50 transition-all group flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-bold text-white font-mono text-sm uppercase tracking-wider group-hover:text-[#9D4EDD] transition-colors pr-2">
                    {insight.title}
                  </h4>
                  {insight.action && (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono border ${badgeColor}`}>
                      {insight.action} {insight.asset ? `• ${insight.asset}` : ''}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                  {insight.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
