'use client';

import { motion } from 'framer-motion';
import { Cpu, Network, Binary, BrainCircuit } from 'lucide-react';
import { useEffect, useState } from 'react';

export function TechBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#050505] pointer-events-none" />;
  }

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#050505] pointer-events-none">
      
      {/* Abstract Circuit Grid */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: `
            linear-gradient(to right, #39FF14 1px, transparent 1px),
            linear-gradient(to bottom, #39FF14 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      ></div>

      {/* Center CPU Core Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#39FF14]/5 rounded-full blur-[120px]"></div>

      {/* Flowing Data Streams (Matrix-like) - REMOVED PER USER REQUEST */}

      <div className="absolute inset-0">
        {/* Icons removed per user request */}
      </div>

      {/* Hex/Math overlays */}
      <div className="absolute bottom-10 left-10 text-white/10 font-mono text-xs space-y-1">
        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
          INITIALIZING_ALGORITHM_WEIGHTS...
        </motion.div>
        <div>EPOCH_493: LOSS=0.0034 ACC=0.998</div>
        <div>PREDICTIVE_MODEL: ONLINE</div>
        <div>TENSOR_CALCULATIONS: ACTIVE</div>
      </div>
      <div className="absolute top-32 right-10 text-[#39FF14]/20 font-mono text-[10px] space-y-1 text-right">
        <div>0x00FF34: EXECUTE_PREDICTION()</div>
        <div>0x00FF38: ALLOCATE_CAPITAL_NODE()</div>
        <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1, repeat: Infinity }}>
          {'>'} _PROCESSING
        </motion.div>
      </div>
    </div>
  );
}
