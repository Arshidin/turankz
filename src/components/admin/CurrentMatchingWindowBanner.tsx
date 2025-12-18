/**
 * CURRENT MATCHING WINDOW BANNER
 * 
 * Displays the current matching window status prominently with countdown.
 * Fetches from database and visible to all roles.
 */

import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar, Clock, Lock, CheckCircle2, AlertCircle, Timer, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrentMatchingWindow } from '@/hooks/useMatchingWindows';
import {
  type MatchingWindowStatus,
  MATCHING_WINDOW_STATUS_COLORS,
  getWindowStatusLabel,
  getWindowBannerInfo,
  calculateCountdown,
  getContextualWindowMessage,
  getCountdownUrgency,
  type CountdownResult,
} from '@/lib/matching-window';

interface CurrentMatchingWindowBannerProps {
  compact?: boolean;
}

// Get current language
const getCurrentLang = (): 'en' | 'ru' => {
  if (typeof window !== 'undefined') {
    const lang = localStorage.getItem('i18nextLng') || 'ru';
    return lang.startsWith('ru') ? 'ru' : 'en';
  }
  return 'ru';
};

// Get icon for status
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

// Get urgency color classes
const getUrgencyColors = (urgency: 'normal' | 'warning' | 'critical' | 'expired') => {
  switch (urgency) {
    case 'critical':
      return {
        bg: 'bg-destructive/10',
        text: 'text-destructive',
        border: 'border-destructive/30',
      };
    case 'warning':
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-500/30',
      };
    case 'expired':
      return {
        bg: 'bg-muted',
        text: 'text-muted-foreground',
        border: 'border-border',
      };
    default:
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-500/30',
      };
  }
};

export function CurrentMatchingWindowBanner({ compact = false }: CurrentMatchingWindowBannerProps) {
  const { data: window, isLoading, error } = useCurrentMatchingWindow();
  const lang = getCurrentLang();
  
  // Countdown state - updates every minute
  const [countdown, setCountdown] = useState<CountdownResult | null>(null);

  useEffect(() => {
    if (!window?.lock_date) {
      setCountdown(null);
      return;
    }

    // Initial calculation
    setCountdown(calculateCountdown(window.lock_date, lang));

    // Update every minute
    const interval = setInterval(() => {
      setCountdown(calculateCountdown(window.lock_date, lang));
    }, 60000);

    return () => clearInterval(interval);
  }, [window?.lock_date, lang]);

  if (isLoading) {
    return (
      <div className="rounded-lg border p-4">
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-3 w-48" />
      </div>
    );
  }

  if (error || !window) {
    if (compact) return null;
    
    return (
      <Alert className="border-muted bg-muted/50">
        <Calendar className="h-4 w-4" />
        <AlertTitle>
          {lang === 'ru' ? 'Нет активного окна' : 'No Active Window'}
        </AlertTitle>
        <AlertDescription className="text-sm text-muted-foreground">
          {lang === 'ru' 
            ? 'В настоящее время нет запланированных окон сопоставления.'
            : 'There are no scheduled matching windows at this time.'}
        </AlertDescription>
      </Alert>
    );
  }

  const status = window.status as MatchingWindowStatus;
  const colors = MATCHING_WINDOW_STATUS_COLORS[status];
  const bannerInfo = getWindowBannerInfo(status, lang);
  const urgency = countdown ? getCountdownUrgency(countdown) : 'normal';
  const contextualMessage = countdown 
    ? getContextualWindowMessage(status, countdown, lang) 
    : bannerInfo.message;

  // Use urgency colors for active windows with countdown
  const displayColors = status === 'active' && countdown ? getUrgencyColors(urgency) : colors;

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${displayColors.bg} ${displayColors.border}`}>
        {status === 'active' && countdown && !countdown.isExpired ? (
          <Timer className={`h-4 w-4 ${displayColors.text}`} />
        ) : (
          getStatusIcon(status)
        )}
        <span className={`text-sm font-medium ${displayColors.text}`}>
          {status === 'active' && countdown && !countdown.isExpired
            ? countdown.formattedShort
            : getWindowStatusLabel(status, lang)}
        </span>
        <span className="text-xs text-muted-foreground">
          {window.target_week}
        </span>
        {urgency === 'critical' && (
          <AlertTriangle className="h-3.5 w-3.5 text-destructive animate-pulse" />
        )}
      </div>
    );
  }

  return (
    <Alert className={`${displayColors.bg} ${displayColors.border}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${displayColors.text}`}>
          {status === 'active' && countdown && !countdown.isExpired ? (
            <Timer className="h-4 w-4" />
          ) : (
            getStatusIcon(status)
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <AlertTitle className={`${displayColors.text} font-semibold`}>
              {bannerInfo.title}
            </AlertTitle>
            <Badge variant="outline" className={`${displayColors.bg} ${displayColors.text} ${displayColors.border}`}>
              {window.target_week}
            </Badge>
            {/* Countdown Badge for Active Windows */}
            {status === 'active' && countdown && !countdown.isExpired && (
              <Badge 
                variant="outline" 
                className={`${displayColors.bg} ${displayColors.text} ${displayColors.border} font-mono`}
              >
                <Timer className="h-3 w-3 mr-1" />
                {countdown.formattedShort}
              </Badge>
            )}
            {urgency === 'critical' && (
              <Badge variant="destructive" className="animate-pulse">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {lang === 'ru' ? 'Срочно' : 'Urgent'}
              </Badge>
            )}
          </div>
          
          {/* Contextual Message */}
          <AlertDescription className="mt-1 text-sm text-muted-foreground">
            {contextualMessage}
          </AlertDescription>
          
          {/* Date Timeline */}
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {lang === 'ru' ? 'Начало:' : 'Start:'} {formatDate(window.start_date)}
            </span>
            <span className={`flex items-center gap-1 ${countdown?.isExpired ? 'text-muted-foreground line-through' : ''}`}>
              <Lock className="h-3 w-3" />
              {lang === 'ru' ? 'Блокировка:' : 'Lock:'} {formatDate(window.lock_date)}
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              {lang === 'ru' ? 'Закрытие:' : 'Close:'} {formatDate(window.close_date)}
            </span>
          </div>
        </div>
      </div>
    </Alert>
  );
}
