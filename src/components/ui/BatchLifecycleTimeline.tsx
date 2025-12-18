/**
 * BATCH LIFECYCLE TIMELINE
 * 
 * Visual "You are here" indicator for batch progression.
 * Designed for institutional clarity - farmers should always
 * understand where their batch is in the lifecycle.
 */

import { cn } from '@/lib/utils';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  Link2, 
  Package,
  ArrowRight,
  CircleDot
} from 'lucide-react';
import { type BatchLifecycleStatus } from '@/lib/batch-lifecycle';
import { Badge } from './badge';

interface BatchLifecycleTimelineProps {
  currentStatus: BatchLifecycleStatus;
  showDescriptions?: boolean;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

const lifecycleSteps: Array<{
  key: BatchLifecycleStatus;
  label: string;
  shortLabel: string;
  description: string;
  icon: typeof FileText;
}> = [
  {
    key: 'forecast',
    label: 'Forecast',
    shortLabel: 'Forecast',
    description: 'Initial volume declaration. Edits allowed.',
    icon: FileText,
  },
  {
    key: 'soft_committed',
    label: 'Soft Commit',
    shortLabel: 'Soft',
    description: 'Signaled readiness. Volume may still adjust.',
    icon: Clock,
  },
  {
    key: 'confirmed',
    label: 'Confirmed',
    shortLabel: 'Confirmed',
    description: 'Locked for matching. Ready for pool allocation.',
    icon: CheckCircle2,
  },
  {
    key: 'matched',
    label: 'Matched',
    shortLabel: 'Matched',
    description: 'Allocated to buyer. Awaiting delivery.',
    icon: Link2,
  },
  {
    key: 'closed',
    label: 'Closed',
    shortLabel: 'Closed',
    description: 'Delivery complete. Settlement finalized.',
    icon: Package,
  },
];

const getStepStatus = (
  stepKey: BatchLifecycleStatus, 
  currentStatus: BatchLifecycleStatus
): 'completed' | 'current' | 'upcoming' => {
  const stepOrder: BatchLifecycleStatus[] = ['draft', 'forecast', 'soft_committed', 'confirmed', 'matched', 'closed'];
  const stepIndex = stepOrder.indexOf(stepKey);
  const currentIndex = stepOrder.indexOf(currentStatus);

  if (stepIndex < currentIndex) return 'completed';
  if (stepIndex === currentIndex) return 'current';
  return 'upcoming';
};

export function BatchLifecycleTimeline({ 
  currentStatus, 
  showDescriptions = false,
  orientation = 'horizontal',
  className 
}: BatchLifecycleTimelineProps) {
  const isHorizontal = orientation === 'horizontal';
  
  // Filter out draft from display
  const displaySteps = lifecycleSteps.filter(s => s.key !== 'draft');

  return (
    <div className={cn(
      'bg-muted/30 rounded-lg border border-border/50 p-4',
      className
    )}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <CircleDot className="w-4 h-4 text-primary" />
        <span className="text-xs font-medium text-foreground uppercase tracking-wide">
          Batch Lifecycle
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
                  stepStatus === 'upcoming' && 'bg-muted border-2 border-border text-muted-foreground'
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
                <div className="flex items-center gap-1.5">
                  <p className={cn(
                    'text-sm font-medium',
                    stepStatus === 'current' && 'text-primary',
                    stepStatus === 'completed' && 'text-foreground',
                    stepStatus === 'upcoming' && 'text-muted-foreground'
                  )}>
                    {isHorizontal ? step.shortLabel : step.label}
                  </p>
                  {stepStatus === 'current' && (
                    <Badge 
                      variant="outline" 
                      className="text-[9px] px-1 py-0 bg-primary/10 text-primary border-primary/30 font-normal"
                    >
                      You are here
                    </Badge>
                  )}
                </div>
                {showDescriptions && (
                  <p className={cn(
                    'text-xs mt-0.5 max-w-[120px]',
                    stepStatus === 'current' ? 'text-primary/70' : 'text-muted-foreground'
                  )}>
                    {step.description}
                  </p>
                )}
              </div>

              {/* Vertical connector */}
              {!isHorizontal && !isLast && (
                <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-border" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ===========================================
   COMPACT LIFECYCLE INDICATOR
   For use in tables and list views
   =========================================== */

interface CompactLifecycleIndicatorProps {
  currentStatus: BatchLifecycleStatus;
  className?: string;
}

export function CompactLifecycleIndicator({ currentStatus, className }: CompactLifecycleIndicatorProps) {
  const displaySteps = lifecycleSteps.filter(s => s.key !== 'draft');
  
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {displaySteps.map((step, index) => {
        const stepStatus = getStepStatus(step.key, currentStatus);
        
        return (
          <div key={step.key} className="flex items-center">
            <div className={cn(
              'w-2 h-2 rounded-full',
              stepStatus === 'completed' && 'bg-status-confirmed',
              stepStatus === 'current' && 'bg-primary ring-2 ring-primary/30',
              stepStatus === 'upcoming' && 'bg-muted border border-border'
            )} />
            {index < displaySteps.length - 1 && (
              <div className={cn(
                'w-3 h-0.5 mx-0.5',
                stepStatus === 'completed' ? 'bg-status-confirmed' : 'bg-border'
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}
