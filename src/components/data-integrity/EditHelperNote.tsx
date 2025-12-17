import { AlertCircle, Clock, Info, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditHelperNoteProps {
  variant: 'info' | 'warning' | 'locked';
  message: string;
  className?: string;
}

/**
 * Helper note displayed on edit forms
 * Communicates constraints and consequences
 */
export function EditHelperNote({ variant, message, className }: EditHelperNoteProps) {
  const styles = {
    info: {
      container: 'border-border bg-muted/30',
      icon: 'text-muted-foreground',
      text: 'text-muted-foreground',
      Icon: Info,
    },
    warning: {
      container: 'border-signal-warning/30 bg-signal-warning-bg',
      icon: 'text-signal-warning',
      text: 'text-signal-warning',
      Icon: AlertCircle,
    },
    locked: {
      container: 'border-muted bg-muted/50',
      icon: 'text-muted-foreground',
      text: 'text-muted-foreground',
      Icon: Lock,
    },
  };

  const style = styles[variant];
  const Icon = style.Icon;

  return (
    <div className={cn(
      'flex items-start gap-2 rounded-md border p-3',
      style.container,
      className
    )}>
      <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', style.icon)} />
      <p className={cn('text-xs', style.text)}>{message}</p>
    </div>
  );
}

interface LockoutIndicatorProps {
  daysRemaining: number;
  lockoutDays: number;
  entityType: 'batch' | 'request';
}

/**
 * Shows time remaining until changes are locked
 */
export function LockoutIndicator({ daysRemaining, lockoutDays, entityType }: LockoutIndicatorProps) {
  const isLocked = daysRemaining <= lockoutDays;
  const isApproaching = daysRemaining <= lockoutDays + 3 && !isLocked;

  if (!isLocked && !isApproaching) return null;

  const message = isLocked
    ? entityType === 'batch'
      ? 'Changes locked for current matching window.'
      : 'Changes locked. Contact Admin to modify.'
    : `Changes will be locked in ${daysRemaining - lockoutDays} days.`;

  return (
    <EditHelperNote
      variant={isLocked ? 'locked' : 'warning'}
      message={message}
    />
  );
}

interface FrequentChangesWarningProps {
  changeCount: number;
  threshold: number;
  periodDays: number;
  entityType: 'farmer' | 'mpk';
}

/**
 * Warning shown when user has made frequent changes
 */
export function FrequentChangesWarning({
  changeCount,
  threshold,
  periodDays,
  entityType,
}: FrequentChangesWarningProps) {
  if (changeCount < threshold) return null;

  const message = entityType === 'farmer'
    ? 'Frequent changes reduce matching priority.'
    : 'Frequent changes may delay fulfillment.';

  return (
    <EditHelperNote
      variant="warning"
      message={`${message} (${changeCount} changes in the last ${periodDays} days)`}
    />
  );
}

interface ChangeIndicatorProps {
  hasRecentChanges: boolean;
  lastChangeDate?: string;
  className?: string;
}

/**
 * Subtle indicator that a change was made
 * For display in lists and detail views
 */
export function ChangeIndicator({ hasRecentChanges, lastChangeDate, className }: ChangeIndicatorProps) {
  if (!hasRecentChanges) return null;

  return (
    <div className={cn('flex items-center gap-1 text-xs text-muted-foreground', className)}>
      <Clock className="h-3 w-3" />
      <span>Modified{lastChangeDate ? ` ${lastChangeDate}` : ''}</span>
    </div>
  );
}
