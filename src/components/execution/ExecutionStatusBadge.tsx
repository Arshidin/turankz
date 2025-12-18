import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  type ExecutionStatus, 
  formatExecutionStatus,
  EXECUTION_STATUS_LABELS,
} from '@/lib/execution-lifecycle';
import { 
  Package, 
  Calendar, 
  Truck, 
  CheckCircle2, 
  Receipt, 
  Lock,
} from 'lucide-react';

const STATUS_ICONS: Record<ExecutionStatus, React.ReactNode> = {
  matched: <Package className="h-3 w-3" />,
  scheduled: <Calendar className="h-3 w-3" />,
  delivered: <Truck className="h-3 w-3" />,
  confirmed: <CheckCircle2 className="h-3 w-3" />,
  settled: <Receipt className="h-3 w-3" />,
  closed: <Lock className="h-3 w-3" />,
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
  const { label, description, colors } = formatExecutionStatus(status);
  
  const badge = (
    <Badge 
      variant="outline" 
      className={`${colors.bg} ${colors.text} ${colors.border} gap-1`}
    >
      {showIcon && STATUS_ICONS[status]}
      {label}
    </Badge>
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
}

const STATUS_ORDER: ExecutionStatus[] = ['matched', 'scheduled', 'delivered', 'confirmed', 'settled', 'closed'];

export function ExecutionProgress({ currentStatus }: ExecutionProgressProps) {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);

  return (
    <div className="flex items-center gap-1">
      {STATUS_ORDER.map((status, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const { colors } = formatExecutionStatus(status);
        
        return (
          <TooltipProvider key={status}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className={`
                    flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium
                    ${isCompleted ? 'bg-emerald-500 text-white' : ''}
                    ${isCurrent ? `${colors.bg} ${colors.text} ring-2 ring-offset-1 ring-current` : ''}
                    ${!isCompleted && !isCurrent ? 'bg-muted text-muted-foreground' : ''}
                  `}
                >
                  {STATUS_ICONS[status]}
                </div>
              </TooltipTrigger>
              <TooltipContent>
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
