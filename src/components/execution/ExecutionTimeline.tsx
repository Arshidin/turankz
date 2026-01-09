/**
 * ExecutionTimeline Component
 *
 * Sprint 7-8: Visual timeline showing execution lifecycle progress.
 * Shows each stage (Matched → Scheduled → Delivered → Confirmed → Settled → Closed)
 * with clear indication of current stage, who acts next, and timestamps.
 *
 * Features:
 * - Visual progress indicator
 * - Role-based action indicators (who needs to act)
 * - Timestamps for completed stages
 * - Responsive design (horizontal/vertical variants)
 */

import { useMemo } from 'react';
import {
  Package,
  Calendar,
  Truck,
  CheckCircle2,
  Receipt,
  Lock,
  Clock,
  User,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  type ExecutionStatus,
  EXECUTION_STATUS_ORDER,
  EXECUTION_STATUS_LABELS,
  EXECUTION_STATUS_LABELS_RU,
  EXECUTION_STATUS_DESCRIPTIONS,
  EXECUTION_STATUS_DESCRIPTIONS_RU,
  EXECUTION_STATUS_ACTORS,
  getStatusIndex,
  getExecutionProgress,
} from '@/lib/execution-lifecycle';
import { format, parseISO, isValid } from 'date-fns';
import { ru } from 'date-fns/locale';

interface ExecutionTimelineProps {
  /** Current execution status */
  currentStatus: ExecutionStatus;
  /** Variant: vertical for detail view, horizontal for compact */
  variant?: 'vertical' | 'horizontal' | 'compact';
  /** Language for labels */
  lang?: 'en' | 'ru';
  /** Timestamps for each completed stage */
  timestamps?: Partial<Record<ExecutionStatus, string>>;
  /** Show actor indicators */
  showActors?: boolean;
  /** Show as card or inline */
  asCard?: boolean;
  /** Custom className */
  className?: string;
}

const STATUS_ICONS: Record<ExecutionStatus, React.ReactNode> = {
  matched: <Package className="h-4 w-4" />,
  scheduled: <Calendar className="h-4 w-4" />,
  delivered: <Truck className="h-4 w-4" />,
  confirmed: <CheckCircle2 className="h-4 w-4" />,
  settled: <Receipt className="h-4 w-4" />,
  closed: <Lock className="h-4 w-4" />,
};

const ROLE_ICONS: Record<string, React.ReactNode> = {
  farmer: <User className="h-3 w-3" />,
  mpk: <Building2 className="h-3 w-3" />,
  admin: <ShieldCheck className="h-3 w-3" />,
};

type StageState = 'completed' | 'current' | 'upcoming';

interface StageInfo {
  status: ExecutionStatus;
  state: StageState;
  label: string;
  description: string;
  icon: React.ReactNode;
  timestamp?: string;
  actor: { role: string; action: string };
}

export function ExecutionTimeline({
  currentStatus,
  variant = 'horizontal',
  lang = 'ru',
  timestamps = {},
  showActors = true,
  asCard = false,
  className,
}: ExecutionTimelineProps) {
  const currentIndex = getStatusIndex(currentStatus);
  const progress = getExecutionProgress(currentStatus);

  const stages: StageInfo[] = useMemo(() => {
    return EXECUTION_STATUS_ORDER.map((status, index) => {
      const state: StageState =
        index < currentIndex ? 'completed' :
        index === currentIndex ? 'current' : 'upcoming';

      const actorInfo = EXECUTION_STATUS_ACTORS[status];

      return {
        status,
        state,
        label: lang === 'ru' ? EXECUTION_STATUS_LABELS_RU[status] : EXECUTION_STATUS_LABELS[status],
        description: lang === 'ru' ? EXECUTION_STATUS_DESCRIPTIONS_RU[status] : EXECUTION_STATUS_DESCRIPTIONS[status],
        icon: STATUS_ICONS[status],
        timestamp: timestamps[status],
        actor: {
          role: actorInfo.role,
          action: lang === 'ru' ? actorInfo.actionRu : actorInfo.action,
        },
      };
    });
  }, [currentStatus, currentIndex, lang, timestamps]);

  const formatTimestamp = (ts: string | undefined) => {
    if (!ts) return null;
    try {
      const date = parseISO(ts);
      if (!isValid(date)) return null;
      return format(date, 'd MMM, HH:mm', { locale: lang === 'ru' ? ru : undefined });
    } catch {
      return null;
    }
  };

  const getStateStyles = (state: StageState) => {
    switch (state) {
      case 'completed':
        return {
          circle: 'bg-emerald-500 text-white border-emerald-500',
          line: 'bg-emerald-500',
          text: 'text-emerald-700',
          textMuted: 'text-emerald-600/70',
        };
      case 'current':
        return {
          circle: 'bg-primary text-primary-foreground border-primary ring-4 ring-primary/20',
          line: 'bg-muted-foreground/30',
          text: 'text-primary font-medium',
          textMuted: 'text-primary/70',
        };
      case 'upcoming':
        return {
          circle: 'bg-muted text-muted-foreground border-muted-foreground/30',
          line: 'bg-muted-foreground/20',
          text: 'text-muted-foreground',
          textMuted: 'text-muted-foreground/50',
        };
    }
  };

  // Compact variant - just progress bar
  if (variant === 'compact') {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium">
            {lang === 'ru' ? EXECUTION_STATUS_LABELS_RU[currentStatus] : EXECUTION_STATUS_LABELS[currentStatus]}
          </span>
          <span className="text-muted-foreground">{progress}%</span>
        </div>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{lang === 'ru' ? 'Начало' : 'Start'}</span>
          <span>{lang === 'ru' ? 'Завершено' : 'Complete'}</span>
        </div>
      </div>
    );
  }

  // Horizontal variant
  if (variant === 'horizontal') {
    const content = (
      <div className={cn('space-y-3', !asCard && className)}>
        {/* Progress bar */}
        <div className="relative">
          <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stage indicators */}
        <div className="flex justify-between">
          {stages.map((stage, index) => {
            const styles = getStateStyles(stage.state);
            const formattedTime = formatTimestamp(stage.timestamp);

            return (
              <TooltipProvider key={stage.status}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center gap-1 cursor-help">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all',
                          styles.circle
                        )}
                      >
                        {stage.icon}
                      </div>
                      <span className={cn('text-[10px] text-center max-w-[60px] leading-tight', styles.text)}>
                        {stage.label}
                      </span>
                      {formattedTime && (
                        <span className="text-[9px] text-muted-foreground">
                          {formattedTime}
                        </span>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[200px]">
                    <p className="font-medium">{stage.label}</p>
                    <p className="text-xs text-muted-foreground">{stage.description}</p>
                    {showActors && stage.state === 'current' && (
                      <div className="mt-2 pt-2 border-t flex items-center gap-1.5 text-xs">
                        {ROLE_ICONS[stage.actor.role]}
                        <span>{stage.actor.action}</span>
                      </div>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>

        {/* Current action indicator */}
        {showActors && currentStatus !== 'closed' && (
          <div className="flex items-center justify-center gap-2 text-xs bg-primary/5 rounded-lg p-2">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted-foreground">
              {lang === 'ru' ? 'Следующее действие:' : 'Next action:'}
            </span>
            <Badge variant="outline" className="gap-1 text-xs">
              {ROLE_ICONS[stages[currentIndex].actor.role]}
              {stages[currentIndex].actor.action}
            </Badge>
          </div>
        )}
      </div>
    );

    if (asCard) {
      return (
        <Card className={className}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {lang === 'ru' ? 'Прогресс исполнения' : 'Execution Progress'}
            </CardTitle>
          </CardHeader>
          <CardContent>{content}</CardContent>
        </Card>
      );
    }

    return content;
  }

  // Vertical variant (full detail view)
  const verticalContent = (
    <div className={cn('space-y-0', !asCard && className)}>
      {stages.map((stage, index) => {
        const styles = getStateStyles(stage.state);
        const formattedTime = formatTimestamp(stage.timestamp);
        const isLast = index === stages.length - 1;

        return (
          <div key={stage.status} className="flex gap-4">
            {/* Timeline column */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all z-10',
                  styles.circle
                )}
              >
                {stage.icon}
              </div>
              {!isLast && (
                <div className={cn('w-0.5 flex-1 min-h-[40px]', styles.line)} />
              )}
            </div>

            {/* Content column */}
            <div className={cn('pb-6 flex-1', isLast && 'pb-0')}>
              <div className="flex items-start justify-between">
                <div>
                  <p className={cn('text-sm', styles.text)}>{stage.label}</p>
                  <p className={cn('text-xs mt-0.5', styles.textMuted)}>
                    {stage.description}
                  </p>
                </div>
                {formattedTime && (
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {formattedTime}
                  </span>
                )}
              </div>

              {/* Actor indicator for current stage */}
              {showActors && stage.state === 'current' && stage.status !== 'closed' && (
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline" className="gap-1.5 text-xs bg-primary/5 border-primary/30">
                    {ROLE_ICONS[stage.actor.role]}
                    <span>{stage.actor.action}</span>
                  </Badge>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  if (asCard) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {lang === 'ru' ? 'Прогресс исполнения' : 'Execution Progress'}
            </span>
            <Badge variant="secondary" className="text-xs">
              {progress}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>{verticalContent}</CardContent>
      </Card>
    );
  }

  return verticalContent;
}

export default ExecutionTimeline;
