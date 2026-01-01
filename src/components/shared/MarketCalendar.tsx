/**
 * MARKET CALENDAR
 * 
 * Read-only calendar view of matching windows for Farmer and MPK.
 * Shows upcoming, active, and locked windows in a timeline format.
 * Helps users understand market rhythm and plan ahead.
 * 
 * Access:
 * - Farmer: read-only
 * - MPK: read-only
 * - Admin: manage (existing functionality in admin panel)
 */

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMatchingWindows } from '@/hooks/useMatchingWindows';
import { 
  type MatchingWindow,
  type MatchingWindowStatus,
  MATCHING_WINDOW_STATUS_COLORS,
  MATCHING_WINDOW_STATUS_LABELS_RU,
  MATCHING_WINDOW_STATUS_LABELS,
  getWindowStatusDescription,
  getEffectiveWindowStatus,
  calculateCountdown,
} from '@/lib/matching-window';
import { 
  Calendar, 
  Clock, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  Info,
  Timer
} from 'lucide-react';
import { format, parseISO, isAfter, isBefore, startOfToday } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface WindowWithEffectiveStatus extends MatchingWindow {
  effectiveStatus: MatchingWindowStatus;
}

export function MarketCalendar() {
  const { t, i18n } = useTranslation();
  const { data: windows, isLoading } = useMatchingWindows();
  const lang = i18n.language?.startsWith('ru') ? 'ru' : 'en';

  // Compute effective status for each window and categorize
  const categorizedWindows = useMemo(() => {
    if (!windows) return { upcoming: [], active: [], locked: [], closed: [] };

    const now = startOfToday();
    const windowsWithStatus: WindowWithEffectiveStatus[] = windows.map(w => ({
      ...w,
      effectiveStatus: getEffectiveWindowStatus(w),
    }));

    // Categorize windows
    const upcoming: WindowWithEffectiveStatus[] = [];
    const active: WindowWithEffectiveStatus[] = [];
    const locked: WindowWithEffectiveStatus[] = [];
    const closed: WindowWithEffectiveStatus[] = [];

    windowsWithStatus.forEach(window => {
      const status = window.effectiveStatus;
      
      if (status === 'upcoming') {
        upcoming.push(window);
      } else if (status === 'active') {
        active.push(window);
      } else if (status === 'locked') {
        locked.push(window);
      } else if (status === 'closed') {
        closed.push(window);
      }
    });

    // Sort upcoming by start_date (ascending - nearest first)
    upcoming.sort((a, b) => 
      new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );

    // Sort closed by close_date (descending - most recent first)
    closed.sort((a, b) => 
      new Date(b.close_date).getTime() - new Date(a.close_date).getTime()
    );

    return { upcoming, active, locked, closed };
  }, [windows]);

  const { upcoming, active, locked, closed } = categorizedWindows;

  // Show only upcoming, active, and recent locked/closed (last 3)
  const visibleWindows = useMemo(() => {
    return [
      ...upcoming.slice(0, 5), // Next 5 upcoming
      ...active, // All active (should be 0 or 1)
      ...locked, // All locked
      ...closed.slice(0, 2), // Last 2 closed
    ];
  }, [upcoming, active, locked, closed]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Market Calendar</CardTitle>
          <CardDescription>Matching windows schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!windows || windows.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Market Calendar</CardTitle>
          <CardDescription>Matching windows schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center py-8">
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
              <Calendar className="h-6 w-6 text-muted-foreground/60" />
            </div>
            <p className="font-medium text-foreground mb-1">
              {lang === 'ru' ? 'Нет запланированных окон' : 'No scheduled windows'}
            </p>
            <p className="text-sm text-muted-foreground max-w-sm">
              {lang === 'ru' 
                ? 'Окна сопоставления будут отображаться здесь, когда они будут созданы администратором.'
                : 'Matching windows will appear here once they are created by an administrator.'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), lang === 'ru' ? 'd MMM yyyy' : 'MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  const getStatusIcon = (status: MatchingWindowStatus) => {
    switch (status) {
      case 'upcoming':
        return <Clock className="h-4 w-4" />;
      case 'active':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'locked':
        return <Lock className="h-4 w-4" />;
      case 'closed':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: MatchingWindowStatus) => {
    return lang === 'ru' 
      ? MATCHING_WINDOW_STATUS_LABELS_RU[status]
      : MATCHING_WINDOW_STATUS_LABELS[status];
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div>
          <CardTitle className="text-base mb-1">Market Calendar</CardTitle>
          <CardDescription className="flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5" />
            {lang === 'ru' 
              ? 'Расписание окон сопоставления. Окна определяют, когда можно подтверждать партии и создавать сопоставления.'
              : 'Matching windows schedule. Windows determine when batches can be committed and matchings created.'}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Explanation Alert */}
        <Alert className="mb-4 border-primary/20 bg-primary/5">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {lang === 'ru' ? (
              <>
                <strong>Окна сопоставления</strong> — это периоды времени, когда можно подтверждать партии и создавать сопоставления. 
                После блокировки окна новые подтверждения не принимаются, но сопоставление продолжается.
              </>
            ) : (
              <>
                <strong>Matching windows</strong> are time periods when batches can be committed and matchings created. 
                After a window is locked, no new commitments are accepted, but matching continues.
              </>
            )}
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          {visibleWindows.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              {lang === 'ru' 
                ? 'Нет окон для отображения'
                : 'No windows to display'}
            </div>
          ) : (
            visibleWindows.map((window) => {
              const status = window.effectiveStatus;
              const colors = MATCHING_WINDOW_STATUS_COLORS[status];
              const isActive = status === 'active';
              const isLocked = status === 'locked';
              const isClosed = status === 'closed';
              
              // Calculate countdown for active windows
              const countdown = isActive && window.lock_date
                ? calculateCountdown(window.lock_date, lang)
                : null;

              return (
                <div
                  key={window.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    isActive
                      ? `${colors.bg} ${colors.border} border-2`
                      : isLocked || isClosed
                      ? 'bg-muted/30 border-muted opacity-75'
                      : `${colors.bg} ${colors.border}`
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Window Info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className={`${colors.text} flex items-center gap-1.5`}>
                          {getStatusIcon(status)}
                          <span className="font-medium">{window.name}</span>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${colors.bg} ${colors.text} ${colors.border}`}
                        >
                          {getStatusLabel(status)}
                        </Badge>
                        {isActive && countdown && !countdown.isExpired && (
                          <Badge 
                            variant="outline" 
                            className="text-xs font-mono bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
                          >
                            <Timer className="h-3 w-3 mr-1" />
                            {countdown.formattedShort}
                          </Badge>
                        )}
                      </div>

                      <div className="text-sm text-muted-foreground">
                        {lang === 'ru' ? 'Целевая неделя:' : 'Target week:'} <span className="font-medium text-foreground">{window.target_week}</span>
                      </div>

                      {/* Timeline */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {lang === 'ru' ? 'Начало:' : 'Start:'} {formatDate(window.start_date)}
                          </span>
                        </div>
                        <div className={`flex items-center gap-1.5 ${isLocked || isClosed ? 'line-through opacity-50' : ''}`}>
                          <Lock className="h-3 w-3" />
                          <span>
                            {lang === 'ru' ? 'Блокировка:' : 'Lock:'} {formatDate(window.lock_date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>
                            {lang === 'ru' ? 'Закрытие:' : 'Close:'} {formatDate(window.close_date)}
                          </span>
                        </div>
                      </div>

                      {/* Status Description */}
                      <p className="text-xs text-muted-foreground">
                        {getWindowStatusDescription(status, lang)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Show count if there are more windows */}
        {(closed.length > 2 || upcoming.length > 5) && (
          <div className="mt-4 pt-4 border-t text-center text-xs text-muted-foreground">
            {lang === 'ru' 
              ? `Показано ${visibleWindows.length} из ${windows.length} окон`
              : `Showing ${visibleWindows.length} of ${windows.length} windows`}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

