import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Lock,
  CalendarClock,
} from 'lucide-react';
import { useCurrentMatchingWindow } from '@/hooks/useMatchingWindows';
import { 
  getSubmissionStatusMessage, 
  canSubmitPoolRequest,
} from '@/lib/pool-request-lifecycle';
import { 
  calculateCountdown,
  MATCHING_WINDOW_STATUS_COLORS,
  MATCHING_WINDOW_STATUS_LABELS,
  type MatchingWindow,
  type MatchingWindowStatus,
} from '@/lib/matching-window';
import { format, parseISO } from 'date-fns';

interface MatchingWindowStatusBannerProps {
  onSubmissionStatusChange?: (canSubmit: boolean, window: MatchingWindow | null) => void;
}

export function MatchingWindowStatusBanner({ onSubmissionStatusChange }: MatchingWindowStatusBannerProps) {
  const { data: matchingWindow, isLoading } = useCurrentMatchingWindow();
  const [countdown, setCountdown] = useState<string>('');

  // Notify parent of submission status
  useEffect(() => {
    if (onSubmissionStatusChange) {
      const validation = canSubmitPoolRequest(matchingWindow || null);
      onSubmissionStatusChange(validation.canSubmit, matchingWindow || null);
    }
  }, [matchingWindow, onSubmissionStatusChange]);

  // Update countdown every minute
  useEffect(() => {
    if (!matchingWindow?.lock_date) return;

    const updateCountdown = () => {
      const result = calculateCountdown(matchingWindow.lock_date);
      setCountdown(result.formattedShort);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [matchingWindow?.lock_date]);

  if (isLoading) {
    return (
      <Card className="mb-6 border-muted animate-pulse">
        <CardContent className="p-4">
          <div className="h-12 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  const status = getSubmissionStatusMessage(matchingWindow || null);
  const validation = canSubmitPoolRequest(matchingWindow || null);

  // Determine banner styling based on urgency
  const getBannerStyles = () => {
    switch (status.urgency) {
      case 'critical':
        return 'border-destructive/50 bg-destructive/5';
      case 'warning':
        return 'border-amber-500/50 bg-amber-500/5';
      case 'blocked':
        return 'border-muted bg-muted/30';
      default:
        return 'border-primary/20 bg-primary/5';
    }
  };

  const getIcon = () => {
    switch (status.urgency) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />;
      case 'warning':
        return <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />;
      case 'blocked':
        return <Lock className="w-5 h-5 text-muted-foreground flex-shrink-0" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />;
    }
  };

  return (
    <Card className={`mb-6 ${getBannerStyles()}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <p className="text-sm font-medium">{status.title}</p>
              {matchingWindow && (
                <Badge 
                  variant="outline" 
                  className={`text-xs ${MATCHING_WINDOW_STATUS_COLORS[matchingWindow.status as MatchingWindowStatus].bg} ${MATCHING_WINDOW_STATUS_COLORS[matchingWindow.status as MatchingWindowStatus].text} ${MATCHING_WINDOW_STATUS_COLORS[matchingWindow.status as MatchingWindowStatus].border}`}
                >
                  {MATCHING_WINDOW_STATUS_LABELS[matchingWindow.status as MatchingWindowStatus]}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{status.message}</p>
            
            {/* Window details */}
            {matchingWindow && (
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CalendarClock className="w-3 h-3" />
                  <span>Target: {matchingWindow.target_week}</span>
                </div>
                {matchingWindow.status === 'active' && !validation.isLocked && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      Lock: {format(parseISO(matchingWindow.lock_date), 'MMM d')}
                      {countdown && ` (${countdown})`}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Countdown badge for urgent situations */}
          {status.showCountdown && countdown && status.urgency !== 'blocked' && (
            <div className={`px-3 py-1.5 rounded-md text-sm font-mono font-semibold ${
              status.urgency === 'critical' 
                ? 'bg-destructive/10 text-destructive' 
                : status.urgency === 'warning'
                ? 'bg-amber-500/10 text-amber-600'
                : 'bg-primary/10 text-primary'
            }`}>
              {countdown}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
