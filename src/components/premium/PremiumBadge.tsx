import { Badge } from '@/components/ui/badge';
import { Award, Star, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PremiumBadgeProps {
  status: string;
  premiumValue?: number;
  showValue?: boolean;
  size?: 'sm' | 'md';
}

const statusConfig: Record<string, { 
  label: string; 
  icon: typeof Award;
  variant: 'default' | 'secondary' | 'outline';
  className: string;
}> = {
  non_standard: { 
    label: 'Non-Standard', 
    icon: Award,
    variant: 'outline',
    className: 'border-muted-foreground/30 text-muted-foreground',
  },
  standard: { 
    label: 'Standard', 
    icon: Star,
    variant: 'secondary',
    className: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
  },
  high_standard: { 
    label: 'High Standard', 
    icon: Trophy,
    variant: 'default',
    className: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400',
  },
};

export function PremiumBadge({ status, premiumValue, showValue = false, size = 'md' }: PremiumBadgeProps) {
  const config = statusConfig[status] || statusConfig.non_standard;
  const Icon = config.icon;
  
  return (
    <Badge 
      variant={config.variant}
      className={cn(
        'gap-1 font-medium',
        config.className,
        size === 'sm' && 'text-xs px-2 py-0.5'
      )}
    >
      <Icon className={cn('h-3 w-3', size === 'sm' && 'h-2.5 w-2.5')} />
      {config.label}
      {showValue && premiumValue !== undefined && premiumValue > 0 && (
        <span className="ml-1 opacity-80">+{premiumValue} ₸/kg</span>
      )}
    </Badge>
  );
}
