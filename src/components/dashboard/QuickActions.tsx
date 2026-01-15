import { Link } from 'react-router-dom';
import { Receipt, TrendingDown, Package, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const actions = [
  {
    title: 'Add Credit',
    malayalam: 'സംഭാവന ചേർക്കുക',
    description: 'Record a new donation',
    href: '/add-credit',
    icon: Receipt,
    color: 'success' as const,
  },
  {
    title: 'Add Expense',
    malayalam: 'ചെലവ് ചേർക്കുക',
    description: 'Record new expenditure',
    href: '/add-expense',
    icon: TrendingDown,
    color: 'destructive' as const,
  },
  {
    title: 'Add Item',
    malayalam: 'വസ്തു ചേർക്കുക',
    description: 'Add to inventory',
    href: '/property',
    icon: Package,
    color: 'primary' as const,
  },
];

export function QuickActions() {
  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-card">
      <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
      <div className="space-y-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            to={action.href}
            className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-accent/50 transition-all group"
          >
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              action.color === 'success' && "bg-success/10 text-success",
              action.color === 'destructive' && "bg-destructive/10 text-destructive",
              action.color === 'primary' && "bg-primary/10 text-primary"
            )}>
              <action.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{action.title}</p>
              <p className="text-xs text-muted-foreground font-malayalam">{action.malayalam}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </div>
    </div>
  );
}
