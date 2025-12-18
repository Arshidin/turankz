/**
 * ACTION EXPLANATION COMPONENTS
 * 
 * Components that explain WHY an action is unavailable.
 * Replaces disabled buttons without explanation with
 * clear, institutional guidance.
 */

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { 
  Lock, 
  Clock, 
  Calendar, 
  Shield, 
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Button } from './button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';

/* ===========================================
   ACTION BUTTON WITH EXPLANATION
   Shows tooltip explaining why action is unavailable
   =========================================== */

type UnavailableReason = 
  | 'not_your_role'
  | 'wrong_status'
  | 'window_closed'
  | 'window_locked'
  | 'pending_activation'
  | 'already_completed'
  | 'admin_only'
  | 'observer_mode'
  | 'restricted';

const reasonConfig: Record<UnavailableReason, { message: string; icon: typeof Lock }> = {
  not_your_role: {
    message: 'This action is not available for your role.',
    icon: Shield,
  },
  wrong_status: {
    message: 'This action is not available in the current status.',
    icon: Lock,
  },
  window_closed: {
    message: 'Submissions are closed. Wait for an active matching window.',
    icon: Calendar,
  },
  window_locked: {
    message: 'Changes are locked during the matching window.',
    icon: Clock,
  },
  pending_activation: {
    message: 'Available after Admin activates your account.',
    icon: Clock,
  },
  already_completed: {
    message: 'This action has already been completed.',
    icon: CheckCircle2,
  },
  admin_only: {
    message: 'Only administrators can perform this action.',
    icon: Shield,
  },
  observer_mode: {
    message: 'Read-only access. Full features available after activation.',
    icon: Lock,
  },
  restricted: {
    message: 'Your account has been restricted. Contact support.',
    icon: XCircle,
  },
};

interface ExplainedActionButtonProps {
  children: ReactNode;
  available: boolean;
  unavailableReason?: UnavailableReason;
  customMessage?: string;
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function ExplainedActionButton({
  children,
  available,
  unavailableReason,
  customMessage,
  onClick,
  variant = 'default',
  size = 'default',
  className,
}: ExplainedActionButtonProps) {
  const reason = unavailableReason ? reasonConfig[unavailableReason] : null;
  const message = customMessage || reason?.message || 'This action is currently unavailable.';
  const Icon = reason?.icon || Lock;

  if (available) {
    return (
      <Button 
        variant={variant} 
        size={size} 
        onClick={onClick}
        className={className}
      >
        {children}
      </Button>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-block">
            <Button 
              variant={variant} 
              size={size} 
              disabled
              className={cn('opacity-50 cursor-not-allowed', className)}
            >
              <Icon className="w-4 h-4 mr-2" />
              {children}
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>{message}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/* ===========================================
   ACTION UNAVAILABLE CARD
   Replaces action area with explanation
   =========================================== */

interface ActionUnavailableCardProps {
  title: string;
  reason: string;
  guidance?: string;
  icon?: typeof Lock;
  variant?: 'default' | 'warning' | 'info';
  className?: string;
}

export function ActionUnavailableCard({
  title,
  reason,
  guidance,
  icon: Icon = Lock,
  variant = 'default',
  className,
}: ActionUnavailableCardProps) {
  const variantStyles = {
    default: 'bg-muted/30 border-border',
    warning: 'bg-amber-500/5 border-amber-500/20',
    info: 'bg-blue-500/5 border-blue-500/20',
  };

  const iconStyles = {
    default: 'text-muted-foreground',
    warning: 'text-amber-600',
    info: 'text-blue-600',
  };

  return (
    <div className={cn(
      'rounded-lg border p-4',
      variantStyles[variant],
      className
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          'w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0',
          variant === 'default' && 'bg-muted',
          variant === 'warning' && 'bg-amber-500/10',
          variant === 'info' && 'bg-blue-500/10'
        )}>
          <Icon className={cn('w-4 h-4', iconStyles[variant])} />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{reason}</p>
          {guidance && (
            <p className="text-xs text-muted-foreground/80 mt-2 italic">{guidance}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ===========================================
   INLINE EXPLANATION
   Small inline text explaining unavailability
   =========================================== */

interface InlineExplanationProps {
  reason: string;
  icon?: typeof Lock;
  className?: string;
}

export function InlineExplanation({ 
  reason, 
  icon: Icon = Info, 
  className 
}: InlineExplanationProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">{reason}</span>
    </div>
  );
}

/* ===========================================
   CONSEQUENCE WARNING
   Shows what will happen if action is taken
   =========================================== */

interface ConsequenceWarningProps {
  title?: string;
  consequences: string[];
  severity?: 'info' | 'warning' | 'destructive';
  className?: string;
}

export function ConsequenceWarning({
  title = 'Before you continue',
  consequences,
  severity = 'warning',
  className,
}: ConsequenceWarningProps) {
  const styles = {
    info: {
      bg: 'bg-blue-500/5 border-blue-500/20',
      icon: 'text-blue-600',
      iconBg: 'bg-blue-500/10',
    },
    warning: {
      bg: 'bg-amber-500/5 border-amber-500/20',
      icon: 'text-amber-600',
      iconBg: 'bg-amber-500/10',
    },
    destructive: {
      bg: 'bg-destructive/5 border-destructive/20',
      icon: 'text-destructive',
      iconBg: 'bg-destructive/10',
    },
  };

  const Icon = severity === 'info' ? Info : AlertTriangle;

  return (
    <div className={cn(
      'rounded-lg border p-4',
      styles[severity].bg,
      className
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          'w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0',
          styles[severity].iconBg
        )}>
          <Icon className={cn('w-4 h-4', styles[severity].icon)} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <ul className="mt-2 space-y-1">
            {consequences.map((consequence, index) => (
              <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-muted-foreground/50">•</span>
                {consequence}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
