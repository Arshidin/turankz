import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  type ExecutionStatus, 
  EXECUTION_STATUS_LABELS,
  EXECUTION_STATUS_DESCRIPTIONS,
} from '@/lib/execution-lifecycle';
import { 
  Package, 
  Calendar, 
  Truck, 
  CheckCircle2, 
  Receipt, 
  Lock,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_ICONS: Record<ExecutionStatus, React.ReactNode> = {
  matched: <Package className="h-3 w-3" />,
  scheduled: <Calendar className="h-3 w-3" />,
  delivered: <Truck className="h-3 w-3" />,
  confirmed: <CheckCircle2 className="h-3 w-3" />,
  settled: <Receipt className="h-3 w-3" />,
  closed: <Lock className="h-3 w-3" />,
};

const STATUS_CLASSES: Record<ExecutionStatus, string> = {
  matched: 'exec-matched',
  scheduled: 'exec-scheduled',
  delivered: 'exec-delivered',
  confirmed: 'exec-confirmed',
  settled: 'exec-settled',
  closed: 'exec-closed',
};

interface ExecutionStatusBadgeProps {
  status: ExecutionStatus;
  showIcon?: boolean;
  showTooltip?: boolean;
}

export function ExecutionStatusBadge({ 
  status, 
  showIcon = true,
  showTooltip = true,
}: ExecutionStatusBadgeProps) {
  const label = EXECUTION_STATUS_LABELS[status];
  const description = EXECUTION_STATUS_DESCRIPTIONS[status];
  
  const badge = (
    <span className={cn('exec-badge', STATUS_CLASSES[status])}>
      {showIcon && STATUS_ICONS[status]}
      {label}
    </span>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Progress indicator showing the execution lifecycle
interface ExecutionProgressProps {
  currentStatus: ExecutionStatus;
  size?: 'sm' | 'md';
}

const STATUS_ORDER: ExecutionStatus[] = ['matched', 'scheduled', 'delivered', 'confirmed', 'settled', 'closed'];

export function ExecutionProgress({ currentStatus, size = 'md' }: ExecutionProgressProps) {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5';
  const stepSize = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';

  return (
    <div className="flex items-center gap-0.5">
      {STATUS_ORDER.map((status, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        
        return (
          <TooltipProvider key={status}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                  <div 
                    className={cn(
                      'flex items-center justify-center rounded-full text-xs font-medium transition-all',
                      stepSize,
                      isCompleted && 'bg-emerald-500 text-white',
                      isCurrent && 'exec-badge ring-1 ring-offset-1',
                      isCurrent && STATUS_CLASSES[status],
                      !isCompleted && !isCurrent && 'bg-muted text-muted-foreground/50'
                    )}
                  >
                    {isCompleted ? (
                      <Check className={iconSize} />
                    ) : (
                      <span className={cn('opacity-60', iconSize)}>{STATUS_ICONS[status]}</span>
                    )}
                  </div>
                  {index < STATUS_ORDER.length - 1 && (
                    <div 
                      className={cn(
                        'w-2 h-0.5 mx-0.5',
                        isCompleted ? 'bg-emerald-500' : 'bg-border'
                      )}
                    />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs font-medium">{EXECUTION_STATUS_LABELS[status]}</p>
                <p className="text-xs text-muted-foreground">
                  {isCompleted ? 'Completed' : isCurrent ? 'Current' : 'Pending'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
}