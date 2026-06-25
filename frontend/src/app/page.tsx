'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight, Cpu, Target, Zap, ChevronDown, Quote, Globe, Shield } from 'lucide-react';
import SmoothScroll from '@/components/SmoothScroll';
import { useState, useRef } from 'react';

// Marquee Logos
const logos = ["OpenAI", "NVIDIA", "Anthropic", "Stripe", "Goldman Sachs", "Bloomberg", "Binance", "Coinbase"];

// Services
const services = [
  { icon: <Zap />, title: 'AI Trading Agents', desc: 'Deploy neural networks to automate high-frequency portfolio adjustments.' },
  { icon: <Target />, title: 'Precision Telemetry', desc: 'Real-time global market feeds injected with nanosecond latency.' },
  { icon: <Shield />, title: 'Encrypted State', desc: 'Bank-grade encryption protecting every capital transaction and asset.' },
  { icon: <Globe />, title: 'Global Markets', desc: 'Connect to US, UK, Japan, and Indian markets seamlessly.' }
];

// Features Tab
const features = [
  { id: 'dashboard', label: 'Command Center', image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=2574&auto=format&fit=crop' },
  { id: 'analytics', label: 'Deep Analytics', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop' },
  { id: 'ai', label: 'Agent Hub', image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2565&auto=format&fit=crop' }
];

// Testimonials
const testimonials = [
  { quote: "IntelliVest completely revolutionized how we allocate capital.", author: "Sarah J.", role: "Hedge Fund Manager" },
  { quote: "The AI agent telemetry is lightyears ahead of standard retail tools.", author: "Michael T.", role: "Day Trader" },
  { quote: "Beautiful, aggressive, and incredibly powerful. A masterpiece.", author: "Elena R.", role: "Quant Developer" },
];

// FAQ
const faqs = [
  { q: "How do the AI Agents work?", a: "They analyze real-time market telemetry and execute trades based on your predefined risk vectors and algorithms." },
  { q: "Which markets are supported?", a: "We currently support US, UK, Japan, and India markets with real-time currency conversion." },
  { q: "Is my capital secure?", a: "Yes, IntelliVest utilizes quantum-resistant encryption for all state transitions." }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-black text-white selection:bg-[#4CC9F0]/30 font-space overflow-x-hidden">
        
        {/* NAVBAR */}
        <nav className="fixed top-0 left-0 right-0 z-50 p-6 mix-blend-difference">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#4CC9F0] rounded-xl flex items-center justify-center transform rotate-3">
                <Cpu className="w-6 h-6 text-black" />
              </div>
              <span className="font-gasoek text-2xl tracking-wide uppercase text-white">INTELLIVEST</span>
            </div>
            <Link href="/login" className="group flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold uppercase tracking-wider text-sm hover:bg-[#4CC9F0] transition-colors duration-300">
              Access Terminal
              <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center group-hover:rotate-45 transition-transform duration-300">
                <ArrowUpRight className="w-3 h-3 text-white" />
              </div>
            </Link>
          </div>
        </nav>

        {/* HERO SECTION */}
        <section ref={heroRef} className="relative min-h-screen flex items-center pt-20 overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#4CC9F0]/20 to-[#9D4EDD]/20 blur-[120px] -z-10" />
          <motion.div 
            style={{ y, opacity }}
            className="container mx-auto px-6 relative z-10"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
            >
              <div className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse"></div>
              <span className="text-sm font-bold uppercase tracking-widest text-[#39FF14]">Armory Agentic Edition</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
              className="text-7xl md:text-8xl lg:text-[10rem] font-gasoek uppercase leading-[0.85] tracking-tight max-w-6xl"
            >
              POWER YOUR <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4CC9F0] via-[#9D4EDD] to-[#39FF14]">
                FINANCIAL FUTURE
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 text-xl md:text-2xl text-zinc-400 max-w-2xl font-medium"
            >
              Deploy custom enterprise financial agents and automate complex investment workflows in real-time.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-12 flex flex-col sm:flex-row gap-4"
            >
              <Link href="/login" className="bg-white text-black px-8 py-4 rounded-full font-bold uppercase tracking-wider text-center hover:bg-[#4CC9F0] transition-colors">
                Initialize System
              </Link>
              <Link href="/login" className="border border-zinc-700 hover:border-white px-8 py-4 rounded-full font-bold uppercase tracking-wider text-center transition-colors">
                View Telemetry Demo
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* TRUSTED BY MARQUEE */}
        <section className="py-20 border-y border-white/5 bg-black/50 backdrop-blur-lg overflow-hidden">
          <div className="container mx-auto px-6 mb-8">
            <p className="text-center text-sm font-bold uppercase tracking-widest text-zinc-500">Telemetry Sources & Partners</p>
          </div>
          <div className="flex whitespace-nowrap overflow-hidden relative">
            <motion.div 
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 20, ease: "linear", repeat: Infinity }}
              className="flex gap-16 items-center pr-16"
            >
              {[...logos, ...logos, ...logos].map((logo, i) => (
                <span key={i} className="text-2xl md:text-4xl font-gasoek text-zinc-800 uppercase tracking-widest">{logo}</span>
              ))}
            </motion.div>
          </div>
        </section>

        {/* SERVICES */}
        <section className="py-32 container mx-auto px-6">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-gasoek uppercase mb-16"
          >
            Core Infrastructure
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((svc, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-zinc-900/50 border border-white/5 rounded-[2rem] p-8 hover:bg-zinc-900 transition-colors group"
              >
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform group-hover:bg-[#4CC9F0]/20 group-hover:text-[#4CC9F0]">
                  {svc.icon}
                </div>
                <h3 className="text-xl font-bold font-mono uppercase mb-4 text-white group-hover:text-[#4CC9F0] transition-colors">{svc.title}</h3>
                <p className="text-zinc-400 font-medium">{svc.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FEATURES / INTERACTIVE TABS */}
        <section className="py-32 bg-zinc-950">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
              <div className="lg:w-1/3 space-y-8">
                <motion.h2 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="text-4xl md:text-5xl font-gasoek uppercase"
                >
                  Unparalleled Control
                </motion.h2>
                <div className="flex flex-col gap-4">
                  {features.map((feat, i) => (
                    <button 
                      key={feat.id}
                      onClick={() => setActiveTab(feat.id)}
                      className={`text-left px-6 py-4 rounded-2xl border transition-all ${
                        activeTab === feat.id 
                          ? 'border-[#4CC9F0] bg-[#4CC9F0]/10 text-[#4CC9F0]' 
                          : 'border-white/5 hover:border-white/20 text-zinc-500'
                      }`}
                    >
                      <h4 className="text-xl font-bold font-mono uppercase">{feat.label}</h4>
                    </button>
                  ))}
                </div>
              </div>
              <div className="lg:w-2/3 w-full h-[400px] md:h-[600px] rounded-[2rem] overflow-hidden relative border border-white/10">
                {features.map((feat) => (
                  <motion.div
                    key={feat.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ 
                      opacity: activeTab === feat.id ? 1 : 0,
                      scale: activeTab === feat.id ? 1 : 0.95,
                      pointerEvents: activeTab === feat.id ? 'auto' : 'none'
                    }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0"
                  >
                    <img src={feat.image} alt={feat.label} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="absolute bottom-8 left-8">
                      <span className="px-4 py-2 bg-black/50 backdrop-blur-md rounded-full text-[#4CC9F0] font-mono text-sm border border-[#4CC9F0]/30 uppercase">Live Preview Active</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="py-32 container mx-auto px-6 overflow-hidden">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-gasoek uppercase text-center mb-20"
          >
            Verified Operators
          </motion.h2>
          <div className="flex flex-wrap justify-center gap-6">
            {testimonials.map((t, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="w-full md:w-[400px] bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-[2rem] p-8 hover:border-[#9D4EDD]/50 transition-colors"
              >
                <Quote className="w-10 h-10 text-[#9D4EDD] mb-6 opacity-50" />
                <p className="text-xl font-medium mb-8">"{t.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center font-bold text-xl">{t.author[0]}</div>
                  <div>
                    <h4 className="font-bold font-mono uppercase">{t.author}</h4>
                    <p className="text-zinc-500 text-sm">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="py-32 bg-zinc-950 border-y border-white/5">
          <div className="container mx-auto px-6 max-w-4xl">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-gasoek uppercase mb-16 text-center"
            >
              System Protocols
            </motion.h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-white/10 rounded-2xl overflow-hidden">
                  <button 
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full px-6 py-6 text-left flex justify-between items-center hover:bg-white/5 transition-colors"
                  >
                    <span className="font-bold font-mono text-lg uppercase">{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  <motion.div 
                    initial={false}
                    animate={{ height: openFaq === i ? 'auto' : 0 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-6 text-zinc-400 font-medium">{faq.a}</p>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-20 border-t border-white/10 bg-black">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#4CC9F0] rounded-lg flex items-center justify-center transform rotate-3">
                  <Cpu className="w-5 h-5 text-black" />
                </div>
                <span className="font-gasoek text-xl tracking-wide uppercase">INTELLIVEST</span>
              </div>
              <div className="flex gap-8 font-mono text-sm text-zinc-400 uppercase font-bold">
                <Link href="#" className="hover:text-white transition-colors">Protocols</Link>
                <Link href="#" className="hover:text-white transition-colors">Telemetry</Link>
                <Link href="#" className="hover:text-white transition-colors">Agents</Link>
                <Link href="#" className="hover:text-white transition-colors">Security</Link>
              </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-600 text-sm font-mono uppercase">
              <p>© 2026 INTELLIVEST SYSTEMS. ALL RIGHTS RESERVED.</p>
              <p>ENCRYPTED & SECURED</p>
            </div>
          </div>
        </footer>

      </div>
    </SmoothScroll>
  );
}
