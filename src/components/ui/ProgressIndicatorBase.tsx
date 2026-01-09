/**
 * ProgressIndicatorBase Component
 *
 * Sprint 6 Task 9.3.1: Base component for all progress indicators.
 * Provides consistent variant support (full/compact/inline) and styling.
 *
 * This is the foundation for:
 * - FillRateIndicator
 * - MatchingProgressCard
 * - Any future progress-related components
 *
 * Usage:
 * <ProgressIndicatorBase
 *   value={75}
 *   label="Progress"
 *   variant="full"
 *   showDetails={true}
 * />
 */

import { LucideIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

/**
 * Progress status levels for styling
 */
export type ProgressStatus = 'success' | 'info' | 'warning' | 'danger' | 'neutral';

/**
 * Display variant options
 */
export type ProgressVariant = 'full' | 'compact' | 'inline';

/**
 * Style configuration for each progress status
 */
export const PROGRESS_STATUS_STYLES: Record<
  ProgressStatus,
  {
    textClass: string;
    barClass: string;
    badgeClass: string;
    progressClass: string;
    borderClass: string;
    bgClass: string;
  }
> = {
  success: {
    textClass: 'text-emerald-600',
    barClass: 'bg-emerald-500',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
    progressClass: '[&>div]:bg-emerald-500',
    borderClass: 'border-emerald-500/30',
    bgClass: 'bg-emerald-500/5',
  },
  info: {
    textClass: 'text-blue-600',
    barClass: 'bg-blue-500',
    badgeClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
    progressClass: '[&>div]:bg-blue-500',
    borderClass: 'border-blue-500/30',
    bgClass: 'bg-blue-500/5',
  },
  warning: {
    textClass: 'text-amber-600',
    barClass: 'bg-amber-500',
    badgeClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
    progressClass: '[&>div]:bg-amber-500',
    borderClass: 'border-amber-500/30',
    bgClass: 'bg-amber-500/5',
  },
  danger: {
    textClass: 'text-red-600',
    barClass: 'bg-red-500',
    badgeClass: 'bg-red-500/10 text-red-600 border-red-500/30',
    progressClass: '[&>div]:bg-red-500',
    borderClass: 'border-red-500/30',
    bgClass: 'bg-red-500/5',
  },
  neutral: {
    textClass: 'text-muted-foreground',
    barClass: 'bg-muted-foreground',
    badgeClass: 'bg-muted text-muted-foreground border-border',
    progressClass: '[&>div]:bg-muted-foreground',
    borderClass: 'border-border',
    bgClass: 'bg-muted/30',
  },
};

/**
 * Props for ProgressIndicatorBase
 */
interface ProgressIndicatorBaseProps {
  /** Progress value (0-100) */
  value: number;
  /** Status label (e.g., "Fulfilled", "In Progress") */
  label: string;
  /** Icon component to display */
  icon?: LucideIcon;
  /** Display variant */
  variant?: ProgressVariant;
  /** Progress status for styling */
  status?: ProgressStatus;
  /** Show detailed information */
  showDetails?: boolean;
  /** Primary metric (e.g., "75 / 100 heads") */
  primaryMetric?: string;
  /** Secondary metric (e.g., "Remaining: 25") */
  secondaryMetric?: string;
  /** Contextual message explaining the status */
  contextualMessage?: string;
  /** Tooltip content for compact/inline variants */
  tooltipContent?: ReactNode;
  /** Unit label (e.g., "%", "heads") */
  unit?: string;
  /** Additional CSS classes */
  className?: string;
}

export function ProgressIndicatorBase({
  value,
  label,
  icon: Icon,
  variant = 'full',
  status = 'neutral',
  showDetails = true,
  primaryMetric,
  secondaryMetric,
  contextualMessage,
  tooltipContent,
  unit = '%',
  className,
}: ProgressIndicatorBaseProps) {
  const styles = PROGRESS_STATUS_STYLES[status];
  const displayValue = unit === '%' ? `${value}%` : `${value} ${unit}`;

  // Compact badge variant (for tables, cards)
  if (variant === 'compact') {
    const content = (
      <Badge variant="outline" className={cn(styles.badgeClass, 'cursor-default')}>
        {displayValue}
      </Badge>
    );

    if (tooltipContent) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{content}</TooltipTrigger>
            <TooltipContent>
              <div className="text-xs space-y-1">{tooltipContent}</div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return content;
  }

  // Inline text variant (for status displays)
  if (variant === 'inline') {
    return (
      <span className={cn('inline-flex items-center gap-1.5 text-sm', className)}>
        {Icon && <Icon className={cn('w-4 h-4', styles.textClass)} />}
        <span className="font-medium">{displayValue}</span>
        <span className="text-muted-foreground">{label}</span>
      </span>
    );
  }

  // Full display variant (default, for detail views)
  return (
    <div
      className={cn(
        'rounded-lg p-4 border',
        styles.borderClass,
        styles.bgClass,
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon className={cn('w-4 h-4', styles.textClass)} />}
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className={cn('text-lg font-bold', styles.textClass)}>{displayValue}</span>
      </div>

      {/* Progress bar */}
      <Progress value={value} className={cn('h-3', styles.progressClass)} />

      {/* Details section */}
      {showDetails && (primaryMetric || secondaryMetric || contextualMessage) && (
        <>
          {/* Metrics */}
          {(primaryMetric || secondaryMetric) && (
            <div className="flex items-center justify-between mt-2 text-sm">
              {primaryMetric && <span>{primaryMetric}</span>}
              {secondaryMetric && (
                <span className="text-xs text-muted-foreground">{secondaryMetric}</span>
              )}
            </div>
          )}

          {/* Contextual message */}
          {contextualMessage && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-muted-foreground">{contextualMessage}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Helper function to determine progress status from percentage
 */
export function getProgressStatusFromPercentage(percentage: number): ProgressStatus {
  if (percentage >= 100) return 'success';
  if (percentage >= 80) return 'info';
  if (percentage >= 50) return 'warning';
  if (percentage > 0) return 'danger';
  return 'neutral';
}

/**
 * Helper function to determine progress status from thresholds
 */
export function getProgressStatusFromThresholds(
  value: number,
  thresholds: {
    success: number;
    info: number;
    warning: number;
    danger: number;
  }
): ProgressStatus {
  if (value >= thresholds.success) return 'success';
  if (value >= thresholds.info) return 'info';
  if (value >= thresholds.warning) return 'warning';
  if (value >= thresholds.danger) return 'danger';
  return 'neutral';
}
