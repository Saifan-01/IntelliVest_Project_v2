'use client';

import { usePathname } from 'next/navigation';
import { AnimatedBackground } from './AnimatedBackground';
import { TechBackground } from './TechBackground';

export function BackgroundManager() {
  const pathname = usePathname();

  if (pathname === '/') {
    return <AnimatedBackground />;
  }

  if (pathname === '/login' || pathname === '/register') {
    return null; // Or a very subtle dark background if needed, but let's leave it unchanged (default body bg is black)
  }

  // Dashboard, Market, Budgets, Portfolio
  return <TechBackground />;
}
