import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  malayalamTitle?: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'gold' | 'success' | 'warning';
  className?: string;
}

export function MetricCard({ 
  title, 
  malayalamTitle, 
  value, 
  icon: Icon, 
  trend, 
  variant = 'default',
  className 
}: MetricCardProps) {
  const cardClasses = cn(
    "metric-card animate-fade-in",
    variant === 'primary' && "metric-card-primary",
    variant === 'gold' && "metric-card-gold",
    variant === 'success' && "border-success/20 bg-success/5",
    variant === 'warning' && "border-warning/20 bg-warning/5",
    className
  );

  const iconClasses = cn(
    "w-12 h-12 rounded-xl flex items-center justify-center",
    variant === 'default' && "bg-primary/10 text-primary",
    variant === 'primary' && "bg-primary-foreground/20 text-primary-foreground",
    variant === 'gold' && "bg-secondary-foreground/10 text-secondary-foreground",
    variant === 'success' && "bg-success/10 text-success",
    variant === 'warning' && "bg-warning/10 text-warning"
  );

  const titleClasses = cn(
    "text-sm font-medium",
    variant === 'primary' && "text-primary-foreground/80",
    variant === 'gold' && "text-secondary-foreground/80",
    (variant === 'default' || variant === 'success' || variant === 'warning') && "text-muted-foreground"
  );

  const valueClasses = cn(
    "text-3xl font-bold mt-2",
    variant === 'primary' && "text-primary-foreground",
    variant === 'gold' && "text-secondary-foreground",
    (variant === 'default' || variant === 'success' || variant === 'warning') && "text-foreground"
  );

  return (
    <div className={cardClasses}>
      <div className="flex items-start justify-between">
        <div className={iconClasses}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className={cn(
            "text-sm font-medium px-2 py-1 rounded-full",
            trend.isPositive 
              ? "bg-success/10 text-success" 
              : "bg-destructive/10 text-destructive"
          )}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className={titleClasses}>{title}</p>
        {malayalamTitle && (
          <p className={cn(titleClasses, "font-malayalam text-xs mt-0.5")}>{malayalamTitle}</p>
        )}
        <p className={valueClasses}>{value}</p>
      </div>
    </div>
  );
}
