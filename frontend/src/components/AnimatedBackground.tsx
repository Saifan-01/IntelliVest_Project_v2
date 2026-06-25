'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function AnimatedBackground() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-[#0A0A0A]">
      {/* Massive blurred colorful blobs */}
      <motion.div 
        animate={{ 
          rotate: [0, 360],
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[20%] -left-[10%] w-[80vw] h-[80vw] max-w-[1000px] max-h-[1000px] bg-gradient-to-tr from-[#FF3366] via-[#FF9933] to-transparent rounded-full blur-[120px] mix-blend-screen opacity-40"
      ></motion.div>

      <motion.div 
        animate={{ 
          rotate: [360, 0],
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute top-[10%] -right-[10%] w-[70vw] h-[70vw] max-w-[900px] max-h-[900px] bg-gradient-to-bl from-[#9D4EDD] via-[#4CC9F0] to-transparent rounded-full blur-[120px] mix-blend-screen opacity-40"
      ></motion.div>

      <motion.div 
        animate={{ 
          y: [0, -50, 0],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-gradient-to-t from-[#E8FF5A] via-[#39FF14] to-transparent rounded-full blur-[120px] mix-blend-screen opacity-30"
      ></motion.div>
      
      {/* Noise overlay for texture */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay"></div>
    </div>
  );
}
