import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function RecentTransactions({ transactions }: { transactions: any[] }) {
  if (!transactions || transactions.length === 0) {
    return <div className="text-slate-500 py-4">No recent transactions</div>;
  }

  return (
    <div className="space-y-8">
      {transactions.map((tx) => (
        <div key={tx.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-slate-800 text-slate-300">
              {tx.cat?.substring(0, 2).toUpperCase() || 'TX'}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none text-slate-100">{tx.desc}</p>
            <p className="text-sm text-slate-400">{tx.cat} • {tx.date}</p>
          </div>
          <div className={`ml-auto font-medium ${tx.amt > 0 ? 'text-emerald-400' : 'text-slate-100'}`}>
            {tx.amt > 0 ? '+' : ''}₹{Math.abs(tx.amt).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
