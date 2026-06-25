'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

export default function BudgetsPage() {
  const router = useRouter();
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBudget, setNewBudget] = useState({ name: '', limit: '', color: '#4f46e5' });

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchBudgets();
  }, [router]);

  const fetchBudgets = async () => {
    try {
      const res = await api.get('/budgets');
      setBudgets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/budgets', { ...newBudget, icon: 'fas fa-wallet' });
      toast.success('Capital Allocation Registered');
      setNewBudget({ name: '', limit: '', color: '#4f46e5' });
      setShowAddForm(false);
      fetchBudgets();
    } catch (err) {
      toast.error('Failed to register allocation');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/budgets/${id}`);
      toast.success('Allocation Removed');
      fetchBudgets();
    } catch (err) {
      toast.error('Failed to remove allocation');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center relative overflow-hidden">
        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="text-indigo-500 font-mono text-xl tracking-widest uppercase">
          Loading Allocation Data...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 relative overflow-hidden text-white">
      
      <motion.div variants={container} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        <motion.header variants={item} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl mt-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#E8FF5A] rounded-2xl shadow-[0_0_20px_rgba(232,255,90,0.5)]">
              <PieChart className="w-8 h-8 text-black" />
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-gasoek uppercase tracking-wide text-white">Capital Allocation</h2>
              <p className="text-[#E8FF5A] font-mono text-sm mt-2 font-bold">Manage departmental budgets and limits</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-[#E8FF5A] hover:bg-[#E8FF5A]/80 text-black font-gasoek uppercase tracking-wider h-12 px-6 rounded-full shadow-[0_0_20px_rgba(232,255,90,0.4)] transition-all flex items-center gap-2 text-sm"
          >
            <Plus className="w-5 h-5" /> New Allocation
          </Button>
        </motion.header>

        <AnimatePresence>
          {showAddForm && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }}
              className="rounded-[2rem] overflow-hidden bg-white/5 border border-[#E8FF5A]/30 backdrop-blur-xl"
            >
              <form onSubmit={handleAddBudget} className="p-8 grid gap-6 md:grid-cols-4 items-end">
                <div className="space-y-2 md:col-span-1">
                  <Label className="text-white font-bold text-xs uppercase tracking-wider">Category Name</Label>
                  <Input required placeholder="e.g. Infrastructure" value={newBudget.name} onChange={e => setNewBudget({...newBudget, name: e.target.value})} className="bg-black/50 border-white/20 text-white h-12 rounded-xl" />
                </div>
                <div className="space-y-2 md:col-span-1">
                  <Label className="text-white font-bold text-xs uppercase tracking-wider">Limit (₹)</Label>
                  <Input required type="number" placeholder="50000" value={newBudget.limit} onChange={e => setNewBudget({...newBudget, limit: e.target.value})} className="bg-black/50 border-white/20 text-white h-12 rounded-xl" />
                </div>
                <div className="space-y-2 md:col-span-1">
                  <Label className="text-white font-bold text-xs uppercase tracking-wider">Accent Color</Label>
                  <div className="flex items-center gap-3 bg-black/50 border border-white/20 rounded-xl p-2 h-12">
                    <input type="color" value={newBudget.color} onChange={e => setNewBudget({...newBudget, color: e.target.value})} className="w-8 h-8 rounded-lg border-0 bg-transparent cursor-pointer" />
                    <span className="text-slate-300 font-mono text-sm">{newBudget.color}</span>
                  </div>
                </div>
                <div className="md:col-span-1 pb-1">
                  <Button type="submit" className="w-full h-12 bg-white hover:bg-slate-200 text-black font-gasoek uppercase tracking-wider rounded-xl">Initialize</Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={item} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => {
            const progress = Math.min((budget.spent / budget.limit) * 100, 100);
            const isOverBudget = budget.spent > budget.limit;

            return (
              <motion.div key={budget.id} whileHover={{ y: -5 }} className="rounded-[2rem] p-8 relative group overflow-hidden bg-white/5 border border-white/10 backdrop-blur-xl transition-all hover:border-white/30">
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px] opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity" style={{ backgroundColor: budget.color }}></div>
                
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full border-[3px] border-[#0A0A0A]" style={{ backgroundColor: budget.color, boxShadow: `0 0 20px ${budget.color}` }}></div>
                    <h3 className="text-2xl font-gasoek text-white uppercase tracking-wider">{budget.name}</h3>
                  </div>
                  <button onClick={() => handleDelete(budget.id)} className="p-2 bg-black/40 rounded-xl text-slate-400 hover:text-[#FF3366] hover:bg-[#FF3366]/20 transition-colors opacity-0 group-hover:opacity-100 shadow-md">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="flex justify-between text-sm font-bold uppercase tracking-wider">
                    <span className="text-slate-400">Expended</span>
                    <span className={isOverBudget ? 'text-[#FF3366]' : 'text-white'}>₹{budget.spent.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold uppercase tracking-wider mb-2">
                    <span className="text-slate-400">Limit</span>
                    <span style={{ color: budget.color }}>₹{budget.limit.toLocaleString()}</span>
                  </div>
                  
                  <div className="h-4 w-full bg-black rounded-full overflow-hidden border border-white/10 shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: isOverBudget ? '#FF3366' : budget.color, boxShadow: `0 0 20px ${isOverBudget ? '#FF3366' : budget.color}` }}
                    />
                  </div>
                  
                  <div className="text-right text-xs font-bold uppercase tracking-widest text-slate-500 mt-4">
                    {budget.transactions} Transactions Logged
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {budgets.length === 0 && !loading && (
          <div className="text-center py-20 text-slate-500 font-mono border border-dashed border-white/10 rounded-2xl glass-card">
            No capital allocations active. Initialize a budget to begin tracking.
          </div>
        )}
      </motion.div>
    </div>
  );
}
