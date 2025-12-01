import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'warning' | 'success' | 'danger';
}

export const StatCard = ({ title, value, icon: Icon, trend, variant = 'default' }: StatCardProps) => {
  const variantStyles = {
    default: 'bg-card border-border',
    warning: 'bg-amber-500/10 border-amber-500/20',
    success: 'bg-emerald-500/10 border-emerald-500/20',
    danger: 'bg-destructive/10 border-destructive/20',
  };

  const iconStyles = {
    default: 'bg-primary/10 text-primary',
    warning: 'bg-amber-500/20 text-amber-600',
    success: 'bg-emerald-500/20 text-emerald-600',
    danger: 'bg-destructive/20 text-destructive',
  };

  return (
    <div className={cn('rounded-xl border p-6 transition-all hover:shadow-md', variantStyles[variant])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-2 text-foreground">{value}</p>
          {trend && (
            <p
              className={cn(
                'text-sm mt-2 flex items-center gap-1',
                trend.isPositive ? 'text-emerald-600' : 'text-destructive'
              )}
            >
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-muted-foreground">vs last week</span>
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-lg', iconStyles[variant])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
