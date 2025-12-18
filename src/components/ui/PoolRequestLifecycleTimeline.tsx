/**
 * POOL REQUEST LIFECYCLE TIMELINE
 * 
 * Visual indicator for MPK pool request progression.
 * Clear separation between Draft → Submitted → Matched stages.
 */

import { cn } from '@/lib/utils';
import { 
  FileEdit, 
  Send, 
  Clock, 
  Percent, 
  CheckCircle2, 
  Archive,
  CircleDot
} from 'lucide-react';
import { Badge } from './badge';

type PoolRequestStatus = 'draft' | 'submitted' | 'matching' | 'partial' | 'fulfilled' | 'closed' | 'cancelled';

interface PoolRequestLifecycleTimelineProps {
  currentStatus: PoolRequestStatus;
  showDescriptions?: boolean;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

const lifecycleSteps: Array<{
  key: PoolRequestStatus;
  label: string;
  shortLabel: string;
  description: string;
  icon: typeof FileEdit;
}> = [
  {
    key: 'draft',
    label: 'Draft',
    shortLabel: 'Draft',
    description: 'Request being prepared. Not yet submitted.',
    icon: FileEdit,
  },
  {
    key: 'submitted',
    label: 'Submitted',
    shortLabel: 'Submitted',
    description: 'Awaiting Admin review and matching.',
    icon: Send,
  },
  {
    key: 'matching',
    label: 'Matching',
    shortLabel: 'Matching',
    description: 'Admin actively matching supply.',
    icon: Clock,
  },
  {
    key: 'partial',
    label: 'Partial',
    shortLabel: 'Partial',
    description: 'Some supply matched. Continuing...',
    icon: Percent,
  },
  {
    key: 'fulfilled',
    label: 'Fulfilled',
    shortLabel: 'Fulfilled',
    description: 'Request fully matched. Awaiting delivery.',
    icon: CheckCircle2,
  },
  {
    key: 'closed',
    label: 'Closed',
    shortLabel: 'Closed',
    description: 'Request completed and finalized.',
    icon: Archive,
  },
];

const getStepStatus = (
  stepKey: PoolRequestStatus, 
  currentStatus: PoolRequestStatus
): 'completed' | 'current' | 'upcoming' | 'skipped' => {
  const stepOrder: PoolRequestStatus[] = ['draft', 'submitted', 'matching', 'partial', 'fulfilled', 'closed'];
  const stepIndex = stepOrder.indexOf(stepKey);
  const currentIndex = stepOrder.indexOf(currentStatus);

  // Handle cancelled separately
  if (currentStatus === 'cancelled') {
    if (stepKey === currentStatus) return 'current';
    return 'skipped';
  }

  if (stepIndex < currentIndex) return 'completed';
  if (stepIndex === currentIndex) return 'current';
  return 'upcoming';
};

export function PoolRequestLifecycleTimeline({ 
  currentStatus, 
  showDescriptions = false,
  orientation = 'horizontal',
  className 
}: PoolRequestLifecycleTimelineProps) {
  const isHorizontal = orientation === 'horizontal';
  
  // Show simplified view for cancelled
  if (currentStatus === 'cancelled') {
    return (
      <div className={cn(
        'bg-muted/30 rounded-lg border border-dashed border-border/50 p-4',
        className
      )}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <Archive className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Request Cancelled</p>
            <p className="text-xs text-muted-foreground">This request has been cancelled and is no longer active.</p>
          </div>
        </div>
      </div>
    );
  }

  // Filter steps based on current status
  const displaySteps = lifecycleSteps.filter(s => s.key !== 'cancelled');

  return (
    <div className={cn(
      'bg-muted/30 rounded-lg border border-border/50 p-4',
      className
    )}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <CircleDot className="w-4 h-4 text-primary" />
        <span className="text-xs font-medium text-foreground uppercase tracking-wide">
          Request Progress
        </span>
      </div>

      {/* Timeline */}
      <div className={cn(
        'flex',
        isHorizontal ? 'items-start justify-between gap-2' : 'flex-col gap-4'
      )}>
        {displaySteps.map((step, index) => {
          const stepStatus = getStepStatus(step.key, currentStatus);
          const Icon = step.icon;
          const isLast = index === displaySteps.length - 1;

          return (
            <div 
              key={step.key} 
              className={cn(
                'flex',
                isHorizontal ? 'flex-col items-center flex-1' : 'items-start gap-3'
              )}
            >
              {/* Step circle + connector */}
              <div className={cn(
                'flex items-center',
                isHorizontal ? 'w-full justify-center' : ''
              )}>
                {/* Connector before (horizontal) */}
                {isHorizontal && index > 0 && (
                  <div className={cn(
                    'h-0.5 flex-1',
                    stepStatus === 'completed' || stepStatus === 'current' 
                      ? 'bg-primary/40' 
                      : 'bg-border'
                  )} />
                )}

                {/* Step indicator */}
                <div className={cn(
                  'flex items-center justify-center rounded-full flex-shrink-0 transition-all',
                  isHorizontal ? 'w-10 h-10' : 'w-8 h-8',
                  stepStatus === 'completed' && 'bg-status-confirmed text-white',
                  stepStatus === 'current' && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                  stepStatus === 'upcoming' && 'bg-muted border-2 border-border text-muted-foreground',
                  stepStatus === 'skipped' && 'bg-muted/50 border border-dashed border-border text-muted-foreground/50'
                )}>
                  <Icon className={cn(
                    isHorizontal ? 'w-5 h-5' : 'w-4 h-4'
                  )} />
                </div>

                {/* Connector after (horizontal) */}
                {isHorizontal && !isLast && (
                  <div className={cn(
                    'h-0.5 flex-1',
                    stepStatus === 'completed' ? 'bg-primary/40' : 'bg-border'
                  )} />
                )}
              </div>

              {/* Labels */}
              <div className={cn(
                isHorizontal ? 'mt-2 text-center' : 'flex-1'
              )}>
                <div className="flex items-center gap-1.5 justify-center">
                  <p className={cn(
                    'text-sm font-medium',
                    stepStatus === 'current' && 'text-primary',
                    stepStatus === 'completed' && 'text-foreground',
                    stepStatus === 'upcoming' && 'text-muted-foreground',
                    stepStatus === 'skipped' && 'text-muted-foreground/50'
                  )}>
                    {isHorizontal ? step.shortLabel : step.label}
                  </p>
                  {stepStatus === 'current' && (
                    <Badge 
                      variant="outline" 
                      className="text-[9px] px-1 py-0 bg-primary/10 text-primary border-primary/30 font-normal"
                    >
                      Current
                    </Badge>
                  )}
                </div>
                {showDescriptions && !isHorizontal && (
                  <p className={cn(
                    'text-xs mt-0.5',
                    stepStatus === 'current' ? 'text-primary/70' : 'text-muted-foreground'
                  )}>
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
