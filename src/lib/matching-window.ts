/**
 * MATCHING WINDOW LIFECYCLE MANAGEMENT
 * 
 * Controls time-based batch discipline through matching windows.
 * Only one window can be Active at a time.
 */

export const MATCHING_WINDOW_STATUSES = [
  'upcoming',
  'active',
  'locked',
  'closed',
] as const;

export type MatchingWindowStatus = typeof MATCHING_WINDOW_STATUSES[number];

export interface MatchingWindow {
  id: string;
  name: string;
  status: MatchingWindowStatus;
  start_date: string;
  lock_date: string;
  close_date: string;
  target_week: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

// Status labels
export const MATCHING_WINDOW_STATUS_LABELS: Record<MatchingWindowStatus, string> = {
  upcoming: 'Upcoming',
  active: 'Active',
  locked: 'Locked',
  closed: 'Closed',
};

export const MATCHING_WINDOW_STATUS_LABELS_RU: Record<MatchingWindowStatus, string> = {
  upcoming: 'Предстоящее',
  active: 'Активное',
  locked: 'Заблокировано',
  closed: 'Закрыто',
};

// Status descriptions
export const MATCHING_WINDOW_STATUS_DESCRIPTIONS: Record<MatchingWindowStatus, string> = {
  upcoming: 'Window is scheduled but not yet open for matching',
  active: 'Window is open for batch commitments and matching',
  locked: 'No new commitments accepted, matching in progress',
  closed: 'Window has completed, all matching finalized',
};

export const MATCHING_WINDOW_STATUS_DESCRIPTIONS_RU: Record<MatchingWindowStatus, string> = {
  upcoming: 'Окно запланировано, но ещё не открыто для сопоставления',
  active: 'Окно открыто для подтверждения партий и сопоставления',
  locked: 'Новые подтверждения не принимаются, идёт сопоставление',
  closed: 'Окно завершено, все сопоставления финализированы',
};

// Status colors for UI
export const MATCHING_WINDOW_STATUS_COLORS: Record<MatchingWindowStatus, {
  bg: string;
  text: string;
  border: string;
}> = {
  upcoming: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-500/30',
  },
  active: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-500/30',
  },
  locked: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-500/30',
  },
  closed: {
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    border: 'border-border',
  },
};

// Allowed transitions (Admin-only)
export interface WindowTransitionRule {
  from: MatchingWindowStatus;
  to: MatchingWindowStatus;
}

export const ALLOWED_WINDOW_TRANSITIONS: WindowTransitionRule[] = [
  { from: 'upcoming', to: 'active' },
  { from: 'active', to: 'locked' },
  { from: 'locked', to: 'closed' },
];

/**
 * Check if a window transition is allowed
 */
export function isWindowTransitionAllowed(
  fromStatus: MatchingWindowStatus,
  toStatus: MatchingWindowStatus
): boolean {
  return ALLOWED_WINDOW_TRANSITIONS.some(
    t => t.from === fromStatus && t.to === toStatus
  );
}

/**
 * Get allowed transitions for current status
 */
export function getAllowedWindowTransitions(
  currentStatus: MatchingWindowStatus
): MatchingWindowStatus[] {
  return ALLOWED_WINDOW_TRANSITIONS
    .filter(t => t.from === currentStatus)
    .map(t => t.to);
}

/**
 * Get the status index for ordering
 */
export function getWindowStatusIndex(status: MatchingWindowStatus): number {
  return MATCHING_WINDOW_STATUSES.indexOf(status);
}

/**
 * Get localized status label
 */
export function getWindowStatusLabel(
  status: MatchingWindowStatus,
  lang: 'en' | 'ru' = 'en'
): string {
  return lang === 'ru' 
    ? MATCHING_WINDOW_STATUS_LABELS_RU[status] 
    : MATCHING_WINDOW_STATUS_LABELS[status];
}

/**
 * Get localized status description
 */
export function getWindowStatusDescription(
  status: MatchingWindowStatus,
  lang: 'en' | 'ru' = 'en'
): string {
  return lang === 'ru'
    ? MATCHING_WINDOW_STATUS_DESCRIPTIONS_RU[status]
    : MATCHING_WINDOW_STATUS_DESCRIPTIONS[status];
}

/**
 * Check if batches can be committed in current window status
 */
export function canCommitBatches(status: MatchingWindowStatus): boolean {
  return status === 'active';
}

/**
 * Check if matching can occur in current window status
 */
export function canPerformMatching(status: MatchingWindowStatus): boolean {
  return status === 'active' || status === 'locked';
}

/**
 * Get window action label for transition
 */
export function getWindowTransitionLabel(
  toStatus: MatchingWindowStatus,
  lang: 'en' | 'ru' = 'en'
): string {
  const labels = {
    active: lang === 'ru' ? 'Открыть окно' : 'Open Window',
    locked: lang === 'ru' ? 'Заблокировать окно' : 'Lock Window',
    closed: lang === 'ru' ? 'Закрыть окно' : 'Close Window',
  };
  return labels[toStatus] || (lang === 'ru' ? 'Изменить статус' : 'Change Status');
}

/**
 * Get informational text for matching window banner
 */
export function getWindowBannerInfo(
  status: MatchingWindowStatus,
  lang: 'en' | 'ru' = 'en'
): { title: string; message: string } {
  switch (status) {
    case 'upcoming':
      return lang === 'ru'
        ? { title: 'Предстоящее окно', message: 'Окно сопоставления откроется скоро. Подготовьте ваши партии.' }
        : { title: 'Upcoming Window', message: 'Matching window will open soon. Prepare your batches.' };
    case 'active':
      return lang === 'ru'
        ? { title: 'Окно открыто', message: 'Подтверждайте партии сейчас для участия в сопоставлении.' }
        : { title: 'Window Open', message: 'Commit your batches now to participate in matching.' };
    case 'locked':
      return lang === 'ru'
        ? { title: 'Окно заблокировано', message: 'Новые подтверждения не принимаются. Сопоставление в процессе.' }
        : { title: 'Window Locked', message: 'No new commitments accepted. Matching in progress.' };
    case 'closed':
      return lang === 'ru'
        ? { title: 'Окно закрыто', message: 'Это окно сопоставления завершено.' }
        : { title: 'Window Closed', message: 'This matching window has completed.' };
    default:
      return { title: '', message: '' };
  }
}

/**
 * COUNTDOWN UTILITIES
 * Calculate time remaining until lock_date
 */

export interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  totalHours: number;
  isExpired: boolean;
  formattedShort: string;
  formattedLong: string;
}

/**
 * Calculate countdown to a target date
 */
export function calculateCountdown(
  targetDate: string,
  lang: 'en' | 'ru' = 'en'
): CountdownResult {
  const now = new Date();
  const target = new Date(targetDate);
  
  // Set to end of day
  target.setHours(23, 59, 59, 999);
  
  const diffMs = target.getTime() - now.getTime();
  const isExpired = diffMs <= 0;
  
  if (isExpired) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      totalHours: 0,
      isExpired: true,
      formattedShort: lang === 'ru' ? 'Истекло' : 'Expired',
      formattedLong: lang === 'ru' ? 'Срок истёк' : 'Deadline has passed',
    };
  }
  
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;
  
  // Format short (e.g., "2d 5h" or "5h 30m")
  let formattedShort: string;
  if (days > 0) {
    formattedShort = lang === 'ru' 
      ? `${days}д ${hours}ч` 
      : `${days}d ${hours}h`;
  } else if (hours > 0) {
    formattedShort = lang === 'ru' 
      ? `${hours}ч ${minutes}м` 
      : `${hours}h ${minutes}m`;
  } else {
    formattedShort = lang === 'ru' 
      ? `${minutes}м` 
      : `${minutes}m`;
  }
  
  // Format long (e.g., "2 days, 5 hours remaining")
  let formattedLong: string;
  if (lang === 'ru') {
    if (days > 0) {
      formattedLong = `Осталось ${days} ${getDaysWord(days, 'ru')} и ${hours} ${getHoursWord(hours, 'ru')}`;
    } else if (hours > 0) {
      formattedLong = `Осталось ${hours} ${getHoursWord(hours, 'ru')} и ${minutes} ${getMinutesWord(minutes, 'ru')}`;
    } else {
      formattedLong = `Осталось ${minutes} ${getMinutesWord(minutes, 'ru')}`;
    }
  } else {
    if (days > 0) {
      formattedLong = `${days} day${days !== 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''} remaining`;
    } else if (hours > 0) {
      formattedLong = `${hours} hour${hours !== 1 ? 's' : ''}, ${minutes} minute${minutes !== 1 ? 's' : ''} remaining`;
    } else {
      formattedLong = `${minutes} minute${minutes !== 1 ? 's' : ''} remaining`;
    }
  }
  
  return {
    days,
    hours,
    minutes,
    totalHours,
    isExpired,
    formattedShort,
    formattedLong,
  };
}

// Russian word declension helpers
function getDaysWord(n: number, lang: 'ru' | 'en'): string {
  if (lang === 'en') return n === 1 ? 'day' : 'days';
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'день';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'дня';
  return 'дней';
}

function getHoursWord(n: number, lang: 'ru' | 'en'): string {
  if (lang === 'en') return n === 1 ? 'hour' : 'hours';
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'час';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'часа';
  return 'часов';
}

function getMinutesWord(n: number, lang: 'ru' | 'en'): string {
  if (lang === 'en') return n === 1 ? 'minute' : 'minutes';
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'минута';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'минуты';
  return 'минут';
}

/**
 * Get contextual message based on window status and countdown
 */
export function getContextualWindowMessage(
  status: MatchingWindowStatus,
  countdown: CountdownResult,
  lang: 'en' | 'ru' = 'en'
): string {
  if (status === 'active') {
    if (countdown.isExpired) {
      return lang === 'ru'
        ? 'Дедлайн прошёл. Обновления партий заблокированы.'
        : 'Deadline has passed. Batch updates are locked.';
    }
    if (countdown.days === 0 && countdown.hours < 24) {
      return lang === 'ru'
        ? `Срочно! Осталось ${countdown.formattedShort} для обновления партий.`
        : `Urgent! ${countdown.formattedShort} left to update batches.`;
    }
    return lang === 'ru'
      ? `Вы можете обновлять партии до дедлайна. ${countdown.formattedLong}.`
      : `You can still update batches before the deadline. ${countdown.formattedLong}.`;
  }
  
  if (status === 'locked' || countdown.isExpired) {
    return lang === 'ru'
      ? 'Обновление партий заблокировано до следующего Окна сопоставления.'
      : 'Batch updates are locked until the next Matching Window.';
  }
  
  if (status === 'upcoming') {
    return lang === 'ru'
      ? 'Подготовьте ваши партии. Окно откроется скоро.'
      : 'Prepare your batches. Window will open soon.';
  }
  
  return '';
}

/**
 * Determine urgency level based on countdown
 */
export function getCountdownUrgency(
  countdown: CountdownResult
): 'normal' | 'warning' | 'critical' | 'expired' {
  if (countdown.isExpired) return 'expired';
  if (countdown.days === 0 && countdown.hours < 6) return 'critical';
  if (countdown.days === 0 && countdown.hours < 24) return 'warning';
  return 'normal';
}
