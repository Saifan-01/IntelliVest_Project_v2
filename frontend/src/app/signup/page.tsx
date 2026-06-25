'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { UserPlus, Lock, Mail, User } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/signup', { name, email, password });
      Cookies.set('token', res.data.access_token, { expires: 1 });
      Cookies.set('user', JSON.stringify(res.data.user), { expires: 1 });
      toast.success('Profile Initialized');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.msg || 'Failed to initialize profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 overflow-hidden relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="glass-card rounded-2xl p-8 neon-border">
          <div className="text-center mb-8">
            <motion.div 
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-500/20 text-pink-400 mb-4 ring-1 ring-pink-500/50 shadow-[0_0_20px_rgba(236,72,153,0.3)]"
            >
              <UserPlus className="w-8 h-8" />
            </motion.div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2 font-mono">Join IntelliVest</h1>
            <p className="text-slate-400 text-sm">Register as a new operator</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <Label htmlFor="name" className="text-slate-300 flex items-center gap-2">
                <User className="w-4 h-4" /> Full Name
              </Label>
              <Input 
                id="name" 
                placeholder="Agent Smith" 
                className="bg-black/50 border-white/10 text-white placeholder:text-slate-600 focus:border-pink-500/50 focus:ring-pink-500/20 h-12"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </motion.div>

            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              <Label htmlFor="email" className="text-slate-300 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email Address
              </Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="operator@intellivest.ai" 
                className="bg-black/50 border-white/10 text-white placeholder:text-slate-600 focus:border-pink-500/50 focus:ring-pink-500/20 h-12"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </motion.div>
            
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-2"
            >
              <Label htmlFor="password" className="text-slate-300 flex items-center gap-2">
                <Lock className="w-4 h-4" /> Passkey
              </Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                className="bg-black/50 border-white/10 text-white placeholder:text-slate-600 focus:border-pink-500/50 focus:ring-pink-500/20 h-12 tracking-widest"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="pt-2"
            >
              <Button 
                type="submit" 
                className="w-full h-12 bg-pink-600 hover:bg-pink-500 text-white font-medium rounded-lg shadow-[0_0_15px_rgba(236,72,153,0.4)] transition-all" 
                disabled={loading}
              >
                {loading ? 'Initializing...' : 'Create Profile'}
              </Button>
            </motion.div>
          </form>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8 text-center text-sm text-slate-500"
          >
            Already an operator? <a href="/login" className="text-pink-400 hover:text-pink-300 hover:underline transition-colors">Login</a>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
