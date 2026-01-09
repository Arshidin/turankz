/**
 * MatchConfidenceIndicator Component
 *
 * Reusable component for displaying match confidence scores between batches and pool requests.
 * Follows the same multi-variant pattern as FillRateIndicator for consistency.
 *
 * Variants:
 * - 'badge': Small badge with just the score
 * - 'score': Score with label, no details
 * - 'card': Full card with score, label, and explanation
 * - 'inline': Inline text with icon and score
 *
 * Usage:
 * <MatchConfidenceIndicator
 *   confidence={calculateMatchConfidence(batch, request)}
 *   variant="card"
 *   showDetails={true}
 * />
 */

import { CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { MatchConfidence } from '@/lib/matching-validation';
import { cn } from '@/lib/utils';

interface MatchConfidenceIndicatorProps {
  /** Match confidence object from calculateMatchConfidence() */
  confidence: MatchConfidence | null;
  /** Display variant */
  variant?: 'badge' | 'score' | 'card' | 'inline';
  /** Show detailed breakdown (only for 'card' variant) */
  showDetails?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function MatchConfidenceIndicator({
  confidence,
  variant = 'card',
  showDetails = false,
  className,
}: MatchConfidenceIndicatorProps) {
  // Null check
  if (!confidence) {
    return null;
  }

  const { score, level, color, label } = confidence;

  // Color class mappings
  const colorClasses = {
    emerald: {
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/5',
      text: 'text-emerald-600',
      badge: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
    },
    blue: {
      border: 'border-blue-500/30',
      bg: 'bg-blue-500/5',
      text: 'text-blue-600',
      badge: 'bg-blue-500/15 text-blue-700 border-blue-500/30',
    },
    amber: {
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/5',
      text: 'text-amber-600',
      badge: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
    },
    red: {
      border: 'border-red-500/30',
      bg: 'bg-red-500/5',
      text: 'text-red-600',
      badge: 'bg-red-500/15 text-red-700 border-red-500/30',
    },
  }[color];

  // Icon based on level
  const StatusIcon = {
    perfect: CheckCircle2,
    good: Info,
    acceptable: AlertCircle,
    poor: AlertTriangle,
  }[level];

  // Contextual message based on level
  const getMessage = (): string => {
    switch (level) {
      case 'perfect':
        return 'All criteria match perfectly. Ideal matching.';
      case 'good':
        return 'Strong match with minor variations. Recommended.';
      case 'acceptable':
        return 'Acceptable match with some mismatches. Review carefully.';
      case 'poor':
        return 'Poor match with significant mismatches. Admin override required.';
      default:
        return '';
    }
  };

  const getMessageRu = (): string => {
    switch (level) {
      case 'perfect':
        return 'Все критерии полностью совпадают. Идеальное соответствие.';
      case 'good':
        return 'Хорошее совпадение с незначительными отклонениями. Рекомендуется.';
      case 'acceptable':
        return 'Приемлемое соответствие с некоторыми несовпадениями. Проверьте внимательно.';
      case 'poor':
        return 'Плохое соответствие со значительными несовпадениями. Требуется подтверждение администратора.';
      default:
        return '';
    }
  };

  // Badge variant (compact, for tables)
  if (variant === 'badge') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={cn(colorClasses.badge, className)}>
              {score}%
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs space-y-1">
              <p className="font-medium">{label}</p>
              <p className="text-muted-foreground">{getMessage()}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Score variant (just score + label, no card)
  if (variant === 'score') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <StatusIcon className={cn('h-4 w-4', colorClasses.text)} />
        <span className={cn('text-2xl font-bold', colorClasses.text)}>{score}%</span>
        <Badge className={colorClasses.badge}>{label}</Badge>
      </div>
    );
  }

  // Inline variant (text-only with icon)
  if (variant === 'inline') {
    return (
      <span className={cn('inline-flex items-center gap-1.5 text-sm', className)}>
        <StatusIcon className={cn('w-4 h-4', colorClasses.text)} />
        <span className="font-medium">{score}%</span>
        <span className="text-muted-foreground">{label}</span>
      </span>
    );
  }

  // Card variant (default, full display)
  return (
    <div className={cn(`rounded-lg p-4 border-2 ${colorClasses.border} ${colorClasses.bg}`, className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <StatusIcon className={cn('h-4 w-4', colorClasses.text)} />
          <span className="text-sm font-medium">Match Confidence</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('text-2xl font-bold', colorClasses.text)}>{score}%</span>
          <Badge className={colorClasses.badge}>{label}</Badge>
        </div>
      </div>

      {showDetails && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-muted-foreground">{getMessage()}</p>
          <p className="text-xs text-muted-foreground mt-1 italic">{getMessageRu()}</p>
        </div>
      )}
    </div>
  );
}

/**
 * MatchConfidenceBreakdown Component
 *
 * Shows detailed scoring breakdown by criteria
 */

interface MatchConfidenceBreakdownProps {
  /** Breakdown of scores by criteria */
  breakdown: {
    deliveryPeriod: number; // 0-30 points
    region: number; // 0-25 points
    grade: number; // 0-25 points
    weight: number; // 0-10 points
    age: number; // 0-10 points
  };
  /** Additional CSS classes */
  className?: string;
}

export function MatchConfidenceBreakdown({ breakdown, className }: MatchConfidenceBreakdownProps) {
  const total = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

  const criteria = [
    { label: 'Delivery Period', labelRu: 'Период доставки', score: breakdown.deliveryPeriod, max: 30 },
    { label: 'Region', labelRu: 'Регион', score: breakdown.region, max: 25 },
    { label: 'Grade', labelRu: 'Грейд', score: breakdown.grade, max: 25 },
    { label: 'Weight Range', labelRu: 'Диапазон веса', score: breakdown.weight, max: 10 },
    { label: 'Age Range', labelRu: 'Диапазон возраста', score: breakdown.age, max: 10 },
  ];

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Scoring Breakdown</h4>
        <span className="text-sm text-muted-foreground">Total: {total}/100</span>
      </div>

      <div className="space-y-2">
        {criteria.map((criterion, index) => {
          const percentage = (criterion.score / criterion.max) * 100;
          const isFullScore = criterion.score === criterion.max;

          return (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">
                  {criterion.label} <span className="text-muted-foreground">/ {criterion.labelRu}</span>
                </span>
                <span className={cn('font-medium', isFullScore ? 'text-emerald-600' : 'text-muted-foreground')}>
                  {criterion.score}/{criterion.max}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={cn(
                    'h-2 rounded-full transition-all',
                    isFullScore ? 'bg-emerald-500' : percentage >= 70 ? 'bg-blue-500' : 'bg-amber-500'
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2 border-t text-xs text-muted-foreground">
        <p className="italic">Higher scores indicate better match compatibility. Perfect match = 100 points.</p>
      </div>
    </div>
  );
}
