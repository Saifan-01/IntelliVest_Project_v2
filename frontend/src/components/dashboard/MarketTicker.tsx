'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';

export function MarketTicker() {
  const [marketData, setMarketData] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to the Flask Socket.IO server
    const socket: Socket = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8080');

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('market_update', (data) => {
      setMarketData(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (!marketData || marketData.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-slate-950 border-t border-slate-800/50 h-10 overflow-hidden flex items-center z-50">
      <div className="flex items-center px-4 bg-slate-900 h-full border-r border-slate-800/50 z-10 shrink-0">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
          Live Market
        </span>
      </div>
      
      <div className="flex-1 overflow-hidden relative">
        <motion.div 
          className="flex whitespace-nowrap absolute"
          animate={{ x: ["100%", "-100%"] }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
        >
          {marketData.map((item, index) => (
            <div key={index} className="flex items-center space-x-2 mx-8 text-sm font-mono">
              <span className="text-slate-300 font-bold">{item.name}</span>
              <span className="text-white">{item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className={item.change >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                {item.change > 0 ? '+' : ''}{item.change.toFixed(2)}%
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
