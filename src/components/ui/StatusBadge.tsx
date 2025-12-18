import { cn } from '@/lib/utils';
import { 
  type BatchLifecycleStatus, 
  BATCH_STATUS_LABELS, 
  BATCH_STATUS_LABELS_RU 
} from '@/lib/batch-lifecycle';

/* ===========================================
   BATCH LIFECYCLE STATUS BADGE
   Primary status indicator across platform
   =========================================== */

// Accept both database format (underscore) and display format (hyphen)
// Also includes legacy 'delivered' for backwards compatibility
export type ReadinessStatus = BatchLifecycleStatus | 'soft-committed' | 'delivered';

const normalizeStatus = (status: ReadinessStatus): BatchLifecycleStatus => {
  // Normalize to underscore format for class lookup
  const normalized = status.replace('-', '_') as string;
  // Map legacy 'delivered' to 'closed'
  if (normalized === 'delivered') return 'closed';
  return normalized as BatchLifecycleStatus;
};

// Get current language from localStorage or default to 'ru'
const getCurrentLanguage = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('i18nextLng') || 'ru';
  }
  return 'ru';
};

const getStatusLabel = (status: BatchLifecycleStatus): string => {
  const lang = getCurrentLanguage();
  if (lang === 'ru') {
    return BATCH_STATUS_LABELS_RU[status] || status;
  }
  return BATCH_STATUS_LABELS[status] || status;
};

interface StatusBadgeProps {
  status: ReadinessStatus;
  className?: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, className, size = 'md' }: StatusBadgeProps) {
  const normalizedStatus = normalizeStatus(status);
  
  const statusClass = {
    draft: 'status-draft',
    forecast: 'status-forecast',
    soft_committed: 'status-soft',
    confirmed: 'status-confirmed',
    matched: 'status-matched',
    closed: 'status-closed',
  }[normalizedStatus] || 'status-draft';

  return (
    <span
      className={cn(
        'status-badge',
        statusClass,
        size === 'sm' && 'text-[10px] px-1.5 py-0',
        className
      )}
    >
      {getStatusLabel(normalizedStatus)}
    </span>
  );
}

/* ===========================================
   FARMER GRADING BADGE
   Visually secondary to readiness status
   =========================================== */

export type FarmerGrading = 'observer' | 'declared_supplier' | 'standard_supplier';

const gradingLabels: Record<FarmerGrading, string> = {
  observer: 'Observer',
  declared_supplier: 'Declared Supplier',
  standard_supplier: 'Standard Supplier',
};

interface GradingBadgeProps {
  grading: FarmerGrading;
  className?: string;
  size?: 'sm' | 'md';
}

export function GradingBadge({ grading, className, size = 'md' }: GradingBadgeProps) {
  const gradingClass = {
    observer: 'grading-observer',
    declared_supplier: 'grading-declared',
    standard_supplier: 'grading-standard',
  }[grading];

  return (
    <span
      className={cn(
        'grading-badge',
        gradingClass,
        size === 'sm' && 'text-[10px] px-1.5 py-0',
        className
      )}
    >
      {gradingLabels[grading]}
    </span>
  );
}

/* ===========================================
   MPK STATUS BADGE
   Muted colors, not alerting
   =========================================== */

export type MpkStatus = 'active' | 'restricted' | 'inactive';

const mpkStatusLabels: Record<MpkStatus, string> = {
  active: 'Active',
  restricted: 'Restricted',
  inactive: 'Inactive',
};

interface MpkStatusBadgeProps {
  status: MpkStatus;
  className?: string;
  size?: 'sm' | 'md';
}

export function MpkStatusBadge({ status, className, size = 'md' }: MpkStatusBadgeProps) {
  const statusClass = {
    active: 'mpk-active',
    restricted: 'mpk-restricted',
    inactive: 'mpk-inactive',
  }[status];

  return (
    <span
      className={cn(
        'mpk-badge',
        statusClass,
        size === 'sm' && 'text-[10px] px-1.5 py-0',
        className
      )}
    >
      {mpkStatusLabels[status]}
    </span>
  );
}

/* ===========================================
   POOL REQUEST STATUS BADGE
   =========================================== */

export type PoolRequestStatus = 'pending' | 'partial' | 'fulfilled' | 'cancelled';

const poolStatusLabels: Record<PoolRequestStatus, string> = {
  pending: 'Pending',
  partial: 'Partial',
  fulfilled: 'Fulfilled',
  cancelled: 'Cancelled',
};

interface PoolStatusBadgeProps {
  status: PoolRequestStatus;
  className?: string;
  size?: 'sm' | 'md';
}

export function PoolStatusBadge({ status, className, size = 'md' }: PoolStatusBadgeProps) {
  const statusClass = {
    pending: 'pool-pending',
    partial: 'pool-partial',
    fulfilled: 'pool-fulfilled',
    cancelled: 'pool-cancelled',
  }[status];

  return (
    <span
      className={cn(
        'pool-badge',
        statusClass,
        size === 'sm' && 'text-[10px] px-1.5 py-0',
        className
      )}
    >
      {poolStatusLabels[status]}
    </span>
  );
}

/* ===========================================
   ADMIN SIGNAL BADGE
   Risk indicators - red reserved for these only
   =========================================== */

export type SignalType = 'risk' | 'warning' | 'positive';

interface SignalBadgeProps {
  type: SignalType;
  label: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function SignalBadge({ type, label, className, size = 'md' }: SignalBadgeProps) {
  const signalClass = {
    risk: 'signal-risk',
    warning: 'signal-warning',
    positive: 'signal-positive',
  }[type];

  return (
    <span
      className={cn(
        'signal-badge',
        signalClass,
        size === 'sm' && 'text-[10px] px-1.5 py-0',
        className
      )}
    >
      {label}
    </span>
  );
}

/* ===========================================
   RELIABILITY BADGE
   For farmer reliability indicators
   =========================================== */

export type ReliabilityLevel = 'high' | 'medium' | 'low';

const reliabilityLabels: Record<ReliabilityLevel, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

interface ReliabilityBadgeProps {
  level: ReliabilityLevel;
  className?: string;
  size?: 'sm' | 'md';
}

export function ReliabilityBadge({ level, className, size = 'md' }: ReliabilityBadgeProps) {
  const levelClass = {
    high: 'signal-positive',
    medium: 'signal-warning',
    low: 'signal-risk',
  }[level];

  return (
    <span
      className={cn(
        'signal-badge',
        levelClass,
        size === 'sm' && 'text-[10px] px-1.5 py-0',
        className
      )}
    >
      {reliabilityLabels[level]}
    </span>
  );
}
