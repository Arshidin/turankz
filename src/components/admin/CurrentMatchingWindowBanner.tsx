/**
 * CURRENT MATCHING WINDOW BANNER
 * 
 * Displays the current matching window status prominently.
 * Fetches from database and visible to all roles.
 */

import { format, parseISO } from 'date-fns';
import { Calendar, Clock, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrentMatchingWindow } from '@/hooks/useMatchingWindows';
import {
  type MatchingWindowStatus,
  MATCHING_WINDOW_STATUS_COLORS,
  getWindowStatusLabel,
  getWindowBannerInfo,
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

export function CurrentMatchingWindowBanner({ compact = false }: CurrentMatchingWindowBannerProps) {
  const { data: window, isLoading, error } = useCurrentMatchingWindow();
  const lang = getCurrentLang();

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

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${colors.bg} ${colors.border}`}>
        {getStatusIcon(status)}
        <span className={`text-sm font-medium ${colors.text}`}>
          {getWindowStatusLabel(status, lang)}
        </span>
        <span className="text-xs text-muted-foreground">
          {window.target_week}
        </span>
      </div>
    );
  }

  return (
    <Alert className={`${colors.bg} ${colors.border}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${colors.text}`}>
          {getStatusIcon(status)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <AlertTitle className={`${colors.text} font-semibold`}>
              {bannerInfo.title}
            </AlertTitle>
            <Badge variant="outline" className={`${colors.bg} ${colors.text} ${colors.border}`}>
              {window.target_week}
            </Badge>
          </div>
          <AlertDescription className="mt-1 text-sm text-muted-foreground">
            {bannerInfo.message}
          </AlertDescription>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {lang === 'ru' ? 'Начало:' : 'Start:'} {formatDate(window.start_date)}
            </span>
            <span className="flex items-center gap-1">
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
