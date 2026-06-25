'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, TrendingUp, TrendingDown, Activity, Globe, Search, ArrowUpDown } from 'lucide-react';
import StockChartModal from '@/components/StockChartModal';
import { Input } from '@/components/ui/input';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

const REGIONS = [
  { id: 'india', label: 'India', flag: '🇮🇳' },
  { id: 'usa', label: 'United States', flag: '🇺🇸' },
  { id: 'uk', label: 'United Kingdom', flag: '🇬🇧' },
  { id: 'japan', label: 'Japan', flag: '🇯🇵' },
];

export default function MarketPage() {
  const router = useRouter();
  const [stocks, setStocks] = useState<any[]>([]);
  const [currency, setCurrency] = useState('₹');
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState('india');
  
  const prevPrices = useRef<Record<string, number>>({});
  const [flashStates, setFlashStates] = useState<Record<string, 'up' | 'down' | null>>({});
  
  const [selectedStock, setSelectedStock] = useState<any | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [customStocks, setCustomStocks] = useState<Record<string, string>>({}); // symbol -> name
  const [sortBy, setSortBy] = useState('default'); // default, gainers, losers, alpha

  // Debounced Search
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const delay = setTimeout(async () => {
        setIsSearching(true);
        try {
          const res = await api.get(`/market/search?q=${searchQuery}`);
          setSearchResults(res.data);
        } catch (err) {} finally { setIsSearching(false); }
      }, 500);
      return () => clearTimeout(delay);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      router.push('/login');
      return;
    }

    let isActive = true;

    const fetchTrending = async () => {
      try {
        const res = await api.get(`/market/trending?country=${selectedCountry}`);
        if (!isActive) return;
        let data = res.data.stocks;
        const fetchedCurrency = res.data.currency;
        const fetchedCurrencyCode = res.data.currency_code || 'INR';
        setCurrency(fetchedCurrency);
        // Tag each stock with its currency so the modal knows how to convert
        data = data.map((s: any) => ({ ...s, currency: fetchedCurrency, currency_code: fetchedCurrencyCode }));
        
        // Fetch custom stocks if any
        const customSymbols = Object.keys(customStocks);
        if (customSymbols.length > 0) {
          try {
            const customRes = await api.post('/market/stocks', { symbols: customSymbols });
            const customData = customRes.data.map((s: any) => ({
              name: customStocks[s.symbol] || s.symbol,
              symbol: s.symbol,
              price: s.price,
              change: s.change
            }));
            data = [...customData, ...data]; // Put custom at top
          } catch(e) {}
        }
        
        // Check for price changes
        const newFlashStates: Record<string, 'up' | 'down' | null> = {};
        data.forEach((stock: any) => {
          const prev = prevPrices.current[stock.symbol];
          if (prev !== undefined) {
            if (stock.price > prev) newFlashStates[stock.symbol] = 'up';
            else if (stock.price < prev) newFlashStates[stock.symbol] = 'down';
            else newFlashStates[stock.symbol] = null;
          }
          prevPrices.current[stock.symbol] = stock.price;
        });

        setStocks(data);
        setFlashStates(newFlashStates);
        setLoading(false);

        // Clear flashes after 1 second
        if (Object.keys(newFlashStates).length > 0) {
          setTimeout(() => {
            setFlashStates({});
          }, 1000);
        }
      } catch (err) {
        console.error('Failed to fetch trending stocks', err);
      }
    };

    // Initial fetch when country changes
    setLoading(true);
    setStocks([]); // Clear current stocks to show loading state smoothly
    fetchTrending();

    // Poll every 10 seconds
    const interval = setInterval(fetchTrending, 10000);
    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [router, selectedCountry, customStocks]);

  const handleAddCustomStock = (symbol: string, name: string) => {
    setCustomStocks(prev => ({...prev, [symbol]: name}));
    setSearchQuery('');
    setSearchResults([]);
  };

  // Sorting & Filtering logic
  const sortedStocks = [...stocks].sort((a, b) => {
    if (sortBy === 'gainers') return b.change - a.change;
    if (sortBy === 'losers') return a.change - b.change;
    if (sortBy === 'alpha') return a.symbol.localeCompare(b.symbol);
    return 0; // default (trending order)
  });

  const filteredStocks = sortedStocks.filter(stock => 
    searchQuery === '' || 
    stock.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen p-4 md:p-8 relative overflow-hidden text-white">
      
      <motion.div variants={container} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        <motion.header variants={item} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl mt-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#4CC9F0] rounded-2xl shadow-[0_0_20px_rgba(76,201,240,0.5)]">
              <Globe className="w-8 h-8 text-black" />
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-gasoek uppercase tracking-wide text-white">Global Live Market</h2>
              <p className="text-[#4CC9F0] font-mono text-sm mt-2 font-bold">Real-time telemetry of regional market movers</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-black rounded-lg border border-[#39FF14]/30 text-white font-mono text-sm font-bold shadow-[0_0_15px_rgba(57,255,20,0.2)]">
              <div className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse"></div>
              Live Polling: Active
            </div>
          </div>
        </motion.header>

        {/* Region Switcher & Filters */}
        <motion.div variants={item} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-50">
          <div className="flex flex-wrap gap-3">
            {REGIONS.map((region) => (
              <button
                key={region.id}
                onClick={() => { setSelectedCountry(region.id); setCustomStocks({}); }}
                className={`px-6 py-3 rounded-full font-gasoek text-sm tracking-wider uppercase transition-all duration-300 ${
                  selectedCountry === region.id 
                    ? 'bg-[#4CC9F0] text-black shadow-[0_0_20px_rgba(76,201,240,0.5)] scale-105' 
                    : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                }`}
              >
                <span className="mr-2 text-xl">{region.flag}</span> {region.label}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto relative">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search global stocks..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-black/50 border-white/10 text-white rounded-full focus-visible:ring-[#4CC9F0]/50"
              />
              
              {/* Search Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0A0A0A] border border-[#4CC9F0]/30 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden max-h-80 overflow-y-auto z-[100]">
                  {searchResults.map((res, idx) => (
                    <div 
                      key={idx}
                      onClick={() => handleAddCustomStock(res.symbol, res.name)}
                      className="p-4 border-b border-white/5 hover:bg-[#4CC9F0]/10 cursor-pointer transition-colors"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-[#4CC9F0] font-mono">{res.symbol}</span>
                        <span className="text-xs px-2 py-1 bg-white/10 rounded font-mono">{res.exchange}</span>
                      </div>
                      <div className="text-sm text-slate-300 truncate">{res.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="relative group">
              <button className="h-10 px-4 bg-black/50 border border-white/10 rounded-full flex items-center gap-2 hover:bg-white/5 transition-colors">
                <ArrowUpDown className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-bold uppercase tracking-wider text-slate-300">Sort</span>
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[90]">
                {['default', 'gainers', 'losers', 'alpha'].map(option => (
                  <button 
                    key={option}
                    onClick={() => setSortBy(option)}
                    className={`w-full text-left px-4 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${sortBy === option ? 'bg-[#4CC9F0]/20 text-[#4CC9F0]' : 'hover:bg-white/5 text-slate-300'}`}
                  >
                    {option === 'alpha' ? 'A-Z' : option === 'default' ? 'Trending' : `Top ${option}`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex h-[40vh] items-center justify-center relative overflow-hidden">
            <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="text-cyan-500 font-mono text-xl tracking-widest uppercase">
              Initializing {selectedCountry} Feed...
            </motion.div>
          </div>
        ) : (
          <motion.div variants={item} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <AnimatePresence>
              {filteredStocks.map((stock) => {
                const isPositive = stock.change >= 0;
                const flash = flashStates[stock.symbol];
                
                let bgClass = "bg-white/5 border-white/10";
                if (flash === 'up') bgClass = "bg-[#39FF14]/20 border-[#39FF14]/50 shadow-[0_0_30px_rgba(57,255,20,0.3)]";
                if (flash === 'down') bgClass = "bg-[#FF3366]/20 border-[#FF3366]/50 shadow-[0_0_30px_rgba(255,51,102,0.3)]";

                return (
                  <motion.div 
                    key={stock.symbol}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => setSelectedStock(stock)}
                    className={`rounded-[2rem] p-6 relative group overflow-hidden border backdrop-blur-xl transition-all duration-300 cursor-pointer hover:border-[#4CC9F0]/50 hover:shadow-[0_0_30px_rgba(76,201,240,0.3)] ${bgClass}`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-[60px] opacity-5 group-hover:opacity-10 transition-opacity"></div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-2xl font-gasoek text-white uppercase tracking-wider">{stock.symbol}</h3>
                          <p className="text-sm font-bold text-slate-400 truncate w-32 uppercase">{stock.name}</p>
                        </div>
                        <div className={`p-3 rounded-2xl ${isPositive ? 'bg-[#39FF14] text-black shadow-[0_0_15px_rgba(57,255,20,0.4)]' : 'bg-[#FF3366] text-white shadow-[0_0_15px_rgba(255,51,102,0.4)]'}`}>
                          {isPositive ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                        </div>
                      </div>

                      <div className="mt-4">
                        <motion.div 
                          key={stock.price}
                          initial={{ y: -10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          className="text-4xl font-gasoek text-white tracking-tight drop-shadow-md"
                        >
                          {currency}{stock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </motion.div>
                        
                        <div className="flex items-center gap-2 mt-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider ${isPositive ? 'bg-[#39FF14]/20 text-[#39FF14]' : 'bg-[#FF3366]/20 text-[#FF3366]'}`}>
                            {isPositive ? '+' : ''}{stock.change.toFixed(2)}%
                          </span>
                          <span className="text-xs text-white/50 font-bold uppercase tracking-widest">24H</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

      </motion.div>

      <StockChartModal stock={selectedStock} onClose={() => setSelectedStock(null)} />
    </div>
  );
}
