import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Transaction } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
          <p className="text-sm text-muted-foreground">Latest financial activities</p>
        </div>
      </div>

      <div className="space-y-4">
        {transactions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No transactions yet</p>
        ) : (
          transactions.map((transaction) => (
            <div 
              key={transaction.id}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                transaction.type === 'credit' 
                  ? "bg-success/10 text-success" 
                  : "bg-destructive/10 text-destructive"
              )}>
                {transaction.type === 'credit' ? (
                  <ArrowDownRight className="w-5 h-5" />
                ) : (
                  <ArrowUpRight className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {transaction.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  {transaction.name && <span className="font-malayalam">{transaction.name} • </span>}
                  {format(new Date(transaction.date), 'dd MMM yyyy')}
                </p>
              </div>
              <p className={cn(
                "text-sm font-semibold",
                transaction.type === 'credit' ? "text-success" : "text-destructive"
              )}>
                {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
