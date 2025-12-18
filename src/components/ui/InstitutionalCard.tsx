/**
 * INSTITUTIONAL CARD COMPONENTS
 * 
 * Institutional-grade UI components for:
 * - Section headers with clear hierarchy
 * - Locked/Read-only state explanations
 * - Status progression timelines
 * - Empty states with guidance
 */

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { 
  Lock, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  ChevronRight,
  Calendar,
  Shield,
  Eye
} from 'lucide-react';
import { Card, CardContent } from './card';
import { Badge } from './badge';

/* ===========================================
   SECTION HEADER
   Clear, hierarchical section labels
   =========================================== */

interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({ title, description, action, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between mb-4', className)}>
      <div>
        <h2 className="text-sm font-medium text-foreground uppercase tracking-wide">
          {title}
        </h2>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

/* ===========================================
   LOCKED STATE BANNER
   Explains WHY something is locked
   =========================================== */

type LockReason = 
  | 'matching_window'
  | 'status_locked'
  | 'pending_confirmation'
  | 'admin_only'
  | 'time_window'
  | 'already_matched';

const lockReasonConfig: Record<LockReason, { label: string; description: string; icon: typeof Lock }> = {
  matching_window: {
    label: 'Locked by Matching Window',
    description: 'Changes are disabled during the current matching window. Edits will apply to the next window.',
    icon: Calendar,
  },
  status_locked: {
    label: 'Read-only after confirmation',
    description: 'This item has been confirmed and can no longer be modified.',
    icon: Lock,
  },
  pending_confirmation: {
    label: 'Awaiting confirmation',
    description: 'Admin confirmation is required before proceeding.',
    icon: Clock,
  },
  admin_only: {
    label: 'Admin action required',
    description: 'Only administrators can modify this item.',
    icon: Shield,
  },
  time_window: {
    label: 'Outside submission window',
    description: 'Submissions are only accepted during active matching windows.',
    icon: Calendar,
  },
  already_matched: {
    label: 'Already matched',
    description: 'This batch has been matched to a pool request and cannot be modified.',
    icon: CheckCircle2,
  },
};

interface LockedStateBannerProps {
  reason: LockReason;
  className?: string;
  compact?: boolean;
}

export function LockedStateBanner({ reason, className, compact = false }: LockedStateBannerProps) {
  const config = lockReasonConfig[reason];
  const Icon = config.icon;

  if (compact) {
    return (
      <div className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50 border border-border/50',
        className
      )}>
        <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <span className="text-sm text-muted-foreground">{config.label}</span>
      </div>
    );
  }

  return (
    <div className={cn(
      'flex items-start gap-3 px-4 py-3 rounded-lg bg-muted/30 border border-border',
      className
    )}>
      <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{config.label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{config.description}</p>
      </div>
    </div>
  );
}

/* ===========================================
   STATUS TIMELINE
   Visual progression indicator with "You are here"
   =========================================== */

interface TimelineStep {
  key: string;
  label: string;
  description?: string;
  status: 'completed' | 'current' | 'upcoming' | 'locked';
}

interface StatusTimelineProps {
  steps: TimelineStep[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function StatusTimeline({ steps, orientation = 'horizontal', className }: StatusTimelineProps) {
  const isHorizontal = orientation === 'horizontal';

  return (
    <div className={cn(
      'flex',
      isHorizontal ? 'items-center gap-2' : 'flex-col gap-3',
      className
    )}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        
        return (
          <div key={step.key} className={cn(
            'flex',
            isHorizontal ? 'items-center' : 'items-start gap-3'
          )}>
            {/* Step indicator */}
            <div className={cn(
              'flex items-center justify-center rounded-full flex-shrink-0 transition-all',
              isHorizontal ? 'w-8 h-8' : 'w-6 h-6',
              step.status === 'completed' && 'bg-status-confirmed text-status-confirmed-foreground',
              step.status === 'current' && 'bg-primary text-primary-foreground ring-2 ring-primary/30',
              step.status === 'upcoming' && 'bg-muted border border-border text-muted-foreground',
              step.status === 'locked' && 'bg-muted/50 border border-dashed border-border text-muted-foreground'
            )}>
              {step.status === 'completed' ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : step.status === 'locked' ? (
                <Lock className="w-3 h-3" />
              ) : (
                <span className="text-xs font-medium">{index + 1}</span>
              )}
            </div>

            {/* Step label */}
            {!isHorizontal && (
              <div className="flex-1">
                <p className={cn(
                  'text-sm font-medium',
                  step.status === 'current' && 'text-primary',
                  step.status === 'completed' && 'text-foreground',
                  (step.status === 'upcoming' || step.status === 'locked') && 'text-muted-foreground'
                )}>
                  {step.label}
                  {step.status === 'current' && (
                    <Badge variant="outline" className="ml-2 text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/30">
                      You are here
                    </Badge>
                  )}
                </p>
                {step.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                )}
              </div>
            )}

            {/* Connector line */}
            {!isLast && (
              <div className={cn(
                isHorizontal 
                  ? 'w-8 h-0.5 mx-1' 
                  : 'absolute left-3 top-6 bottom-0 w-0.5',
                step.status === 'completed' ? 'bg-status-confirmed' : 'bg-border'
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ===========================================
   WHAT HAPPENS NEXT CARD
   Clear guidance on next actions
   =========================================== */

interface WhatHappensNextProps {
  items: Array<{
    label: string;
    description?: string;
  }>;
  className?: string;
}

export function WhatHappensNext({ items, className }: WhatHappensNextProps) {
  return (
    <Card className={cn('border-primary/20 bg-primary/5', className)}>
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">What happens next</span>
        </div>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-start gap-2">
              <ChevronRight className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-foreground">{item.label}</p>
                {item.description && (
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ===========================================
   INSTITUTIONAL EMPTY STATE
   Calm, informative empty states
   =========================================== */

interface InstitutionalEmptyStateProps {
  icon: typeof Lock;
  title: string;
  description: string;
  guidance?: string;
  action?: ReactNode;
  variant?: 'default' | 'waiting' | 'locked' | 'no-data';
  className?: string;
}

export function InstitutionalEmptyState({ 
  icon: Icon, 
  title, 
  description, 
  guidance,
  action,
  variant = 'default',
  className 
}: InstitutionalEmptyStateProps) {
  const variantStyles = {
    default: 'bg-muted/30',
    waiting: 'bg-amber-500/5 border-amber-500/20',
    locked: 'bg-muted/50 border-dashed',
    'no-data': 'bg-background',
  };

  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 px-6 text-center rounded-lg border',
      variantStyles[variant],
      className
    )}>
      <div className={cn(
        'w-14 h-14 rounded-full flex items-center justify-center mb-4',
        variant === 'waiting' && 'bg-amber-500/10',
        variant === 'locked' && 'bg-muted',
        variant === 'default' && 'bg-muted/50',
        variant === 'no-data' && 'bg-secondary'
      )}>
        <Icon className={cn(
          'w-7 h-7',
          variant === 'waiting' && 'text-amber-600',
          variant === 'locked' && 'text-muted-foreground',
          (variant === 'default' || variant === 'no-data') && 'text-muted-foreground/60'
        )} />
      </div>
      <h3 className="text-base font-medium text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-3">{description}</p>
      {guidance && (
        <p className="text-xs text-muted-foreground/80 max-w-md mb-4 italic">{guidance}</p>
      )}
      {action}
    </div>
  );
}

/* ===========================================
   POOL REQUEST DISCLAIMER
   Clear label that this is NOT an order
   =========================================== */

interface PoolRequestDisclaimerProps {
  className?: string;
}

export function PoolRequestDisclaimer({ className }: PoolRequestDisclaimerProps) {
  return (
    <div className={cn(
      'flex items-start gap-3 px-4 py-3 rounded-lg bg-blue-500/5 border border-blue-500/20',
      className
    )}>
      <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-sm font-medium text-blue-700">This is not a purchase order</p>
        <p className="text-xs text-blue-600/80 mt-0.5">
          Pool Requests signal demand intent. Actual commitments occur only after matching is finalized by TURAN.
        </p>
      </div>
    </div>
  );
}

/* ===========================================
   OBSERVER MODE INDICATOR
   Shows observer/read-only status
   =========================================== */

interface ObserverModeIndicatorProps {
  message?: string;
  className?: string;
}

export function ObserverModeIndicator({ 
  message = 'You have read-only access. Full participation will be available after Admin activation.',
  className 
}: ObserverModeIndicatorProps) {
  return (
    <div className={cn(
      'flex items-start gap-3 px-4 py-3 rounded-lg bg-amber-500/5 border border-amber-500/20',
      className
    )}>
      <Eye className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-sm font-medium text-amber-700">Observer Mode</p>
        <p className="text-xs text-amber-600/80 mt-0.5">{message}</p>
      </div>
    </div>
  );
}
