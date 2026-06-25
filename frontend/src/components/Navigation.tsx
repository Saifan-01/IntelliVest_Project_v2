'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, PieChart, Briefcase, LineChart, LogOut, User } from 'lucide-react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

const navItems = [
  { path: '/dashboard', name: 'Command Center', icon: LayoutDashboard },
  { path: '/market', name: 'Live Market', icon: LineChart },
  { path: '/budgets', name: 'Capital Allocation', icon: PieChart },
  { path: '/portfolio', name: 'Asset Portfolio', icon: Briefcase },
  { path: '/profile', name: 'Operator ID', icon: User },
];

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/login' || pathname === '/signup' || pathname === '/') {
    return null;
  }

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    router.push('/login');
  };

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="glass-card flex items-center gap-2 p-2 rounded-full border border-white/10 shadow-[0_0_40px_rgba(232,255,90,0.1)] bg-black/40 backdrop-blur-xl"
      >
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link key={item.path} href={item.path} className="relative group">
              <div className={`px-5 py-2.5 rounded-full flex items-center gap-2 text-sm transition-all duration-300 ${isActive ? 'text-black bg-[#E8FF5A]' : 'text-white hover:bg-white/10'}`}>
                <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-white'}`} />
                <span className="hidden md:inline-block font-gasoek tracking-wider uppercase text-xs mt-0.5">{item.name}</span>
              </div>
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 bg-[#E8FF5A] rounded-full shadow-[0_0_20px_rgba(232,255,90,0.4)] z-[-1]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          );
        })}
        
        <div className="w-px h-6 bg-white/20 mx-1"></div>
        
        <button 
          onClick={handleLogout}
          className="px-4 py-2.5 rounded-full flex items-center gap-2 text-sm font-medium text-[#FF3366] hover:bg-[#FF3366]/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </motion.div>
    </nav>
  );
}
