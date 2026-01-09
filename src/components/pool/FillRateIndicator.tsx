/**
 * FillRateIndicator Component
 *
 * Displays pool request fill rate with visual progress bar and status categorization.
 * Helps MPKs understand matching progress at a glance.
 */

import { CheckCircle2, TrendingUp, Clock, AlertTriangle, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  calculateMatchingProgress,
  getMatchingProgressStatus,
  getProgressStatusStyle,
  getMatchingProgressLabel,
} from '@/lib/pool-request-lifecycle';

interface FillRateIndicatorProps {
  /** Required volume for the pool request */
  requiredVolume: number;
  /** Currently matched volume */
  matchedVolume: number;
  /** Display variant */
  variant?: 'full' | 'compact' | 'inline';
  /** Show detailed breakdown */
  showDetails?: boolean;
}

export function FillRateIndicator({
  requiredVolume,
  matchedVolume,
  variant = 'full',
  showDetails = true,
}: FillRateIndicatorProps) {
  const progress = calculateMatchingProgress(requiredVolume, matchedVolume);
  const progressStatus = getMatchingProgressStatus(progress);
  const statusStyle = getProgressStatusStyle(progressStatus);

  const StatusIcon = getStatusIcon(progressStatus);

  // Compact badge variant (for tables, cards)
  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={statusStyle.badgeClass}>
              {progress.fillPercentage}%
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs space-y-1">
              <p className="font-medium">{getMatchingProgressLabel(progressStatus)}</p>
              <p>{matchedVolume} / {requiredVolume} голов</p>
              <p className="text-muted-foreground">Осталось: {progress.remainingVolume}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Inline text variant (for status displays)
  if (variant === 'inline') {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm">
        <StatusIcon className="w-4 h-4" />
        <span className="font-medium">{progress.fillPercentage}%</span>
        <span className="text-muted-foreground">заполнено</span>
      </span>
    );
  }

  // Full display variant (default, for detail views)
  return (
    <div className={`rounded-lg p-4 border ${statusStyle.badgeClass}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <StatusIcon className="w-4 h-4" />
          <span className="text-sm font-medium">{getMatchingProgressLabel(progressStatus)}</span>
        </div>
        <span className={`text-lg font-bold ${statusStyle.textClass}`}>
          {progress.fillPercentage}%
        </span>
      </div>

      <Progress
        value={progress.fillPercentage}
        className={`h-3 ${statusStyle.progressClass}`}
      />

      {showDetails && (
        <>
          <div className="flex items-center justify-between mt-2 text-sm">
            <span>
              <span className="font-semibold">{progress.matchedVolume}</span> /{' '}
              {progress.requestedVolume} голов
            </span>
            <span className="text-xs text-muted-foreground">
              Осталось: {progress.remainingVolume}
            </span>
          </div>

          {/* Contextual message based on fill rate */}
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              {getContextualMessage(progressStatus)}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Get appropriate icon for fill rate status
 */
function getStatusIcon(status: ReturnType<typeof getMatchingProgressStatus>) {
  switch (status) {
    case 'fulfilled':
      return CheckCircle2;
    case 'near-complete':
      return TrendingUp;
    case 'partial':
      return Clock;
    case 'at-risk':
      return AlertTriangle;
    case 'not-started':
      return Target;
    default:
      return Target;
  }
}

/**
 * Get contextual help message based on fill rate
 */
function getContextualMessage(status: ReturnType<typeof getMatchingProgressStatus>): string {
  switch (status) {
    case 'fulfilled':
      return '✓ Заявка полностью заполнена. Ожидайте подтверждения доставки.';
    case 'near-complete':
      return '↗ Почти готово! Осталось сопоставить небольшой объём.';
    case 'partial':
      return '⏳ Сопоставление продолжается. Администратор ищет подходящие партии.';
    case 'at-risk':
      return '⚠ Низкий процент заполнения. Рассмотрите возможность расширения критериев приемки.';
    case 'not-started':
      return '○ Сопоставление ещё не началось. Ожидайте начала окна matching.';
    default:
      return '';
  }
}

/**
 * FillRateBreakdown Component
 *
 * Shows detailed breakdown of fill rate by source (e.g., by region, by farm)
 */

interface FillRateBreakdownProps {
  /** Total required volume */
  requiredVolume: number;
  /** Array of matched volumes by source */
  matches: Array<{
    source: string;
    volume: number;
    percentage: number;
  }>;
}

export function FillRateBreakdown({ requiredVolume, matches }: FillRateBreakdownProps) {
  const totalMatched = matches.reduce((sum, m) => sum + m.volume, 0);
  const totalPercentage = Math.round((totalMatched / requiredVolume) * 100);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Разбивка по источникам</h4>
        <span className="text-sm text-muted-foreground">
          {totalMatched} / {requiredVolume} голов ({totalPercentage}%)
        </span>
      </div>

      <div className="space-y-2">
        {matches.map((match, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">{match.source}</span>
              <span className="text-muted-foreground">
                {match.volume} голов ({match.percentage}%)
              </span>
            </div>
            <Progress value={match.percentage} className="h-2" />
          </div>
        ))}
      </div>

      {totalPercentage < 100 && (
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Незаполненный объём</span>
            <span>{requiredVolume - totalMatched} голов ({100 - totalPercentage}%)</span>
          </div>
        </div>
      )}
    </div>
  );
}
