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
