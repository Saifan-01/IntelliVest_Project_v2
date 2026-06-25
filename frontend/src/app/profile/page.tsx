'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User as UserIcon, Shield, Activity, Calendar, Wallet, TrendingUp, TrendingDown, Layers, Terminal } from 'lucide-react';
import api from '@/lib/api';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/user/profile');
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <Terminal className="w-8 h-8 animate-pulse text-[#4CC9F0]" />
          <div className="text-xs font-mono uppercase tracking-widest text-slate-500">Decrypting Operator Profile...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <div className="text-white text-center mt-20">Error loading profile.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 animate-in fade-in duration-700">
      <div className="mb-8">
        <h1 className="text-4xl font-gasoek uppercase text-white tracking-wider">Operator Identity</h1>
        <p className="text-sm font-mono text-slate-400 mt-2 uppercase tracking-widest">Encrypted Profile & Behavioral Metrics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#4CC9F0]/20 rounded-full blur-[60px] pointer-events-none"></div>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-[#4CC9F0]/20 border border-[#4CC9F0]/30 flex items-center justify-center text-[#4CC9F0]">
                <UserIcon className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
                <div className="text-xs font-mono text-slate-400">ID: OP-{profile.id.toString().padStart(4, '0')}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Authentication Email</div>
                <div className="text-sm font-mono text-white mt-1">{profile.email}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Network Join Date</div>
                <div className="text-sm font-mono text-white mt-1">{profile.joined}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Security Clearance</div>
                <div className="flex items-center gap-1 mt-1 text-sm font-mono text-[#39FF14]">
                  <Shield className="w-3 h-3" /> LEVEL 4 (Verified)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Intelligence & Metrics */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* AI Risk Profile */}
          <div className="rounded-[2rem] border backdrop-blur-xl p-8 relative overflow-hidden group" style={{ borderColor: `${profile.ai_analysis.risk_color}30`, backgroundColor: `${profile.ai_analysis.risk_color}10` }}>
            <div className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] rounded-full blur-[100px] pointer-events-none transition-colors duration-1000" style={{ backgroundColor: `${profile.ai_analysis.risk_color}20` }}></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4" style={{ color: profile.ai_analysis.risk_color }} />
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">AI Behavioral Assessment</span>
                </div>
                <h3 className="text-3xl font-gasoek uppercase mb-2" style={{ color: profile.ai_analysis.risk_color }}>
                  {profile.ai_analysis.risk_profile}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed font-mono mt-4">
                  {profile.ai_analysis.assessment}
                </p>
              </div>
            </div>
          </div>

          {/* Telemetry Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-[2rem] bg-white/5 border border-white/10 p-6 flex flex-col justify-center">
              <div className="text-slate-500 mb-2"><Layers className="w-5 h-5" /></div>
              <div className="text-3xl font-gasoek text-white">{profile.metrics.total_trades}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-1">Actions Logged</div>
            </div>

            <div className="rounded-[2rem] bg-white/5 border border-white/10 p-6 flex flex-col justify-center">
              <div className="text-[#E8FF5A] mb-2"><Wallet className="w-5 h-5" /></div>
              <div className="text-3xl font-gasoek text-[#E8FF5A]">{profile.metrics.active_positions}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-1">Active Positions</div>
            </div>

            <div className="rounded-[2rem] bg-white/5 border border-white/10 p-6 flex flex-col justify-center">
              <div className="text-[#39FF14] mb-2"><TrendingUp className="w-5 h-5" /></div>
              <div className="text-3xl font-gasoek text-[#39FF14]">₹{profile.metrics.total_inflow.toLocaleString()}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-1">All-Time Inflow</div>
            </div>

            <div className="rounded-[2rem] bg-white/5 border border-white/10 p-6 flex flex-col justify-center">
              <div className="text-[#FF3366] mb-2"><TrendingDown className="w-5 h-5" /></div>
              <div className="text-3xl font-gasoek text-[#FF3366]">₹{profile.metrics.total_outflow.toLocaleString()}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-1">All-Time Outflow</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
