/**
 * useStatusBadgeStyle Hook
 *
 * Centralizes all status badge styling across the platform.
 * Provides consistent colors, icons, and CSS classes for:
 * - Batch statuses
 * - Pool request statuses
 * - Matching statuses
 * - Execution statuses
 * - Grading statuses
 *
 * This eliminates inconsistency between:
 * - `status-draft`, `status-forecast` (batch)
 * - `pool-draft`, `pool-submitted` (pool)
 * - `grading-observer`, `grading-declared` (grading)
 */

import {
  FileText,
  Eye,
  AlertCircle,
  CheckCircle,
  Link2,
  XCircle,
  Package,
  Clock,
  Truck,
  Calendar,
  DollarSign,
  Activity,
  Star,
  Award,
  type LucideIcon,
} from 'lucide-react';

// ============================================
// TYPE DEFINITIONS
// ============================================

export type StatusType = 'batch' | 'pool' | 'matching' | 'execution' | 'grading';

// Batch lifecycle statuses (simplified FSM v2)
export type BatchStatus = 'draft' | 'available' | 'committed' | 'completed';

// Legacy batch statuses for backward compatibility
export type LegacyBatchStatus = 'forecast' | 'soft_committed' | 'confirmed' | 'matched' | 'closed';

// Combined type for migration period
export type AnyBatchStatus = BatchStatus | LegacyBatchStatus;

// Pool request lifecycle statuses
export type PoolStatus = 'draft' | 'submitted' | 'matching' | 'partial' | 'fulfilled' | 'closed' | 'cancelled';

// Matching lifecycle statuses
export type MatchingStatus = 'active' | 'finalized' | 'cancelled';

// Execution lifecycle statuses
export type ExecutionStatus = 'matched' | 'scheduled' | 'delivered' | 'confirmed' | 'settled' | 'closed';

// Grading/standard statuses
export type GradingStatus = 'observer' | 'standard' | 'declared' | 'certified';

// Union of all possible statuses
export type AnyStatus = BatchStatus | PoolStatus | MatchingStatus | ExecutionStatus | GradingStatus;

// Style configuration returned by the hook
export interface StatusStyle {
  className: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: LucideIcon;
  label: string;
  labelRu?: string;
}

// ============================================
// BATCH STATUS STYLES
// ============================================

// New simplified batch status styles (FSM v2)
const BATCH_STATUS_STYLES: Record<BatchStatus, Omit<StatusStyle, 'className'>> = {
  draft: {
    color: 'hsl(var(--pool-draft))',
    bgColor: 'hsl(var(--pool-draft-bg))',
    borderColor: 'hsl(var(--pool-draft) / 0.4)',
    icon: FileText,
    label: 'Draft',
    labelRu: 'Черновик',
  },
  available: {
    color: 'hsl(200 65% 50%)',
    bgColor: 'hsl(200 65% 95%)',
    borderColor: 'hsl(200 65% 50% / 0.25)',
    icon: Eye,
    label: 'Available',
    labelRu: 'Доступно',
  },
  committed: {
    color: 'hsl(280 50% 50%)',
    bgColor: 'hsl(280 50% 95%)',
    borderColor: 'hsl(280 50% 50% / 0.25)',
    icon: CheckCircle,
    label: 'Committed',
    labelRu: 'Подтверждено',
  },
  completed: {
    color: 'hsl(150 50% 40%)',
    bgColor: 'hsl(150 50% 95%)',
    borderColor: 'hsl(150 50% 40% / 0.25)',
    icon: Link2,
    label: 'Completed',
    labelRu: 'Завершено',
  },
};

// Legacy batch status styles for backward compatibility during migration
const LEGACY_BATCH_STATUS_STYLES: Record<LegacyBatchStatus, Omit<StatusStyle, 'className'>> = {
  forecast: BATCH_STATUS_STYLES.available,
  soft_committed: BATCH_STATUS_STYLES.available,
  confirmed: BATCH_STATUS_STYLES.committed,
  matched: BATCH_STATUS_STYLES.completed,
  closed: BATCH_STATUS_STYLES.completed,
};

// ============================================
// POOL REQUEST STATUS STYLES
// ============================================

const POOL_STATUS_STYLES: Record<PoolStatus, Omit<StatusStyle, 'className'>> = {
  draft: {
    color: 'hsl(var(--pool-draft))',
    bgColor: 'hsl(var(--pool-draft-bg))',
    borderColor: 'hsl(var(--pool-draft) / 0.4)',
    icon: FileText,
    label: 'Draft',
    labelRu: 'Черновик',
  },
  submitted: {
    color: 'hsl(var(--pool-submitted))',
    bgColor: 'hsl(var(--pool-submitted-bg))',
    borderColor: 'hsl(var(--pool-submitted) / 0.25)',
    icon: Package,
    label: 'Submitted',
    labelRu: 'Подана',
  },
  matching: {
    color: 'hsl(var(--pool-matching))',
    bgColor: 'hsl(var(--pool-matching-bg))',
    borderColor: 'hsl(var(--pool-matching) / 0.25)',
    icon: Activity,
    label: 'Matching',
    labelRu: 'Сопоставление',
  },
  partial: {
    color: 'hsl(var(--pool-partial))',
    bgColor: 'hsl(var(--pool-partial-bg))',
    borderColor: 'hsl(var(--pool-partial) / 0.25)',
    icon: Clock,
    label: 'Partial',
    labelRu: 'Частично',
  },
  fulfilled: {
    color: 'hsl(var(--pool-fulfilled))',
    bgColor: 'hsl(var(--pool-fulfilled-bg))',
    borderColor: 'hsl(var(--pool-fulfilled) / 0.25)',
    icon: CheckCircle,
    label: 'Fulfilled',
    labelRu: 'Выполнена',
  },
  closed: {
    color: 'hsl(var(--pool-closed))',
    bgColor: 'hsl(var(--pool-closed-bg))',
    borderColor: 'hsl(var(--pool-closed) / 0.15)',
    icon: XCircle,
    label: 'Closed',
    labelRu: 'Закрыта',
  },
  cancelled: {
    color: 'hsl(var(--pool-cancelled))',
    bgColor: 'hsl(var(--pool-cancelled-bg))',
    borderColor: 'hsl(var(--pool-cancelled) / 0.3)',
    icon: XCircle,
    label: 'Cancelled',
    labelRu: 'Отменена',
  },
};

// ============================================
// MATCHING STATUS STYLES
// ============================================

const MATCHING_STATUS_STYLES: Record<MatchingStatus, Omit<StatusStyle, 'className'>> = {
  active: {
    color: 'hsl(150 50% 40%)',
    bgColor: 'hsl(150 50% 95%)',
    borderColor: 'hsl(150 50% 40% / 0.25)',
    icon: Link2,
    label: 'Active',
    labelRu: 'Активно',
  },
  finalized: {
    color: 'hsl(200 65% 50%)',
    bgColor: 'hsl(200 65% 95%)',
    borderColor: 'hsl(200 65% 50% / 0.25)',
    icon: CheckCircle,
    label: 'Finalized',
    labelRu: 'Завершено',
  },
  cancelled: {
    color: 'hsl(var(--pool-cancelled))',
    bgColor: 'hsl(var(--pool-cancelled-bg))',
    borderColor: 'hsl(var(--pool-cancelled) / 0.3)',
    icon: XCircle,
    label: 'Cancelled',
    labelRu: 'Отменено',
  },
};

// ============================================
// EXECUTION STATUS STYLES
// ============================================

const EXECUTION_STATUS_STYLES: Record<ExecutionStatus, Omit<StatusStyle, 'className'>> = {
  matched: {
    color: 'hsl(var(--exec-matched))',
    bgColor: 'hsl(var(--exec-matched-bg))',
    borderColor: 'hsl(var(--exec-matched) / 0.25)',
    icon: Link2,
    label: 'Matched',
    labelRu: 'Сопоставлено',
  },
  scheduled: {
    color: 'hsl(var(--exec-scheduled))',
    bgColor: 'hsl(var(--exec-scheduled-bg))',
    borderColor: 'hsl(var(--exec-scheduled) / 0.25)',
    icon: Calendar,
    label: 'Scheduled',
    labelRu: 'Запланировано',
  },
  delivered: {
    color: 'hsl(var(--exec-delivered))',
    bgColor: 'hsl(var(--exec-delivered-bg))',
    borderColor: 'hsl(var(--exec-delivered) / 0.25)',
    icon: Truck,
    label: 'Delivered',
    labelRu: 'Доставлено',
  },
  confirmed: {
    color: 'hsl(var(--exec-confirmed))',
    bgColor: 'hsl(var(--exec-confirmed-bg))',
    borderColor: 'hsl(var(--exec-confirmed) / 0.25)',
    icon: CheckCircle,
    label: 'Confirmed',
    labelRu: 'Подтверждено',
  },
  settled: {
    color: 'hsl(var(--exec-settled))',
    bgColor: 'hsl(var(--exec-settled-bg))',
    borderColor: 'hsl(var(--exec-settled) / 0.25)',
    icon: DollarSign,
    label: 'Settled',
    labelRu: 'Рассчитано',
  },
  closed: {
    color: 'hsl(var(--exec-closed))',
    bgColor: 'hsl(var(--exec-closed-bg))',
    borderColor: 'hsl(var(--exec-closed) / 0.15)',
    icon: XCircle,
    label: 'Closed',
    labelRu: 'Закрыто',
  },
};

// ============================================
// GRADING STATUS STYLES
// ============================================

const GRADING_STATUS_STYLES: Record<GradingStatus, Omit<StatusStyle, 'className'>> = {
  observer: {
    color: 'hsl(215 15% 55%)',
    bgColor: 'hsl(215 15% 97%)',
    borderColor: 'hsl(215 15% 55% / 0.25)',
    icon: Eye,
    label: 'Observer',
    labelRu: 'Наблюдатель',
  },
  standard: {
    color: 'hsl(200 65% 50%)',
    bgColor: 'hsl(200 65% 95%)',
    borderColor: 'hsl(200 65% 50% / 0.25)',
    icon: Star,
    label: 'Standard',
    labelRu: 'Стандарт',
  },
  declared: {
    color: 'hsl(280 50% 50%)',
    bgColor: 'hsl(280 50% 95%)',
    borderColor: 'hsl(280 50% 50% / 0.25)',
    icon: Award,
    label: 'Declared',
    labelRu: 'Заявленный',
  },
  certified: {
    color: 'hsl(150 50% 40%)',
    bgColor: 'hsl(150 50% 95%)',
    borderColor: 'hsl(150 50% 40% / 0.25)',
    icon: CheckCircle,
    label: 'Certified',
    labelRu: 'Сертифицирован',
  },
};

// ============================================
// MAIN HOOK
// ============================================

/**
 * Get consistent status badge styles across the platform
 *
 * @param type - The type of status (batch, pool, matching, execution, grading)
 * @param status - The specific status value
 * @returns StatusStyle object with className, colors, icon, and label
 *
 * @example
 * const style = useStatusBadgeStyle('batch', 'confirmed');
 * // Returns: { className: 'status-confirmed', color: '...', icon: CheckCircle, ... }
 *
 * const style = useStatusBadgeStyle('pool', 'submitted');
 * // Returns: { className: 'pool-submitted', color: '...', icon: Package, ... }
 */
export function useStatusBadgeStyle(type: StatusType, status: AnyStatus): StatusStyle {
  let baseStyle: Omit<StatusStyle, 'className'>;
  let className: string;

  switch (type) {
    case 'batch': {
      // Check for new status first, then fall back to legacy
      const batchStatus = status as BatchStatus;
      const legacyStatus = status as LegacyBatchStatus;

      if (BATCH_STATUS_STYLES[batchStatus]) {
        baseStyle = BATCH_STATUS_STYLES[batchStatus];
      } else if (LEGACY_BATCH_STATUS_STYLES[legacyStatus]) {
        baseStyle = LEGACY_BATCH_STATUS_STYLES[legacyStatus];
      } else {
        baseStyle = BATCH_STATUS_STYLES.draft;
      }
      className = `status-${status}`;
      break;
    }
    case 'pool':
      baseStyle = POOL_STATUS_STYLES[status as PoolStatus] || POOL_STATUS_STYLES.draft;
      className = `pool-${status}`;
      break;
    case 'matching':
      baseStyle = MATCHING_STATUS_STYLES[status as MatchingStatus] || MATCHING_STATUS_STYLES.active;
      className = `matching-${status}`;
      break;
    case 'execution':
      baseStyle = EXECUTION_STATUS_STYLES[status as ExecutionStatus] || EXECUTION_STATUS_STYLES.matched;
      className = `exec-${status}`;
      break;
    case 'grading':
      baseStyle = GRADING_STATUS_STYLES[status as GradingStatus] || GRADING_STATUS_STYLES.observer;
      className = `grading-${status}`;
      break;
    default:
      // Fallback to draft style
      baseStyle = POOL_STATUS_STYLES.draft;
      className = 'status-unknown';
  }

  return {
    ...baseStyle,
    className,
  };
}

/**
 * Get only the CSS class name for a status badge
 * Useful when you only need the class without full style object
 */
export function getStatusBadgeClass(type: StatusType, status: AnyStatus): string {
  return useStatusBadgeStyle(type, status).className;
}

/**
 * Get only the icon component for a status
 * Useful when you need just the icon
 */
export function getStatusIcon(type: StatusType, status: AnyStatus): LucideIcon {
  return useStatusBadgeStyle(type, status).icon;
}

/**
 * Get localized label for a status
 */
export function getStatusLabel(type: StatusType, status: AnyStatus, lang: 'en' | 'ru' = 'en'): string {
  const style = useStatusBadgeStyle(type, status);
  return lang === 'ru' && style.labelRu ? style.labelRu : style.label;
}
