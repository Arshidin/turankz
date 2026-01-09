import { cn } from '@/lib/utils';
import { type BatchLifecycleStatus } from '@/lib/batch-lifecycle';
import { useStatusBadgeStyle, getStatusLabel, type BatchStatus } from '@/hooks/useStatusBadgeStyle';

/* ===========================================
   BATCH LIFECYCLE STATUS BADGE
   Primary status indicator across platform
   Now uses centralized useStatusBadgeStyle hook
   =========================================== */

// Accept both database format (underscore) and display format (hyphen)
// Also includes legacy 'delivered' for backwards compatibility
export type ReadinessStatus = BatchLifecycleStatus | 'soft-committed' | 'delivered';

const normalizeStatus = (status: ReadinessStatus): BatchStatus => {
  // Normalize to underscore format for class lookup
  const normalized = status.replace('-', '_') as string;
  // Map legacy 'delivered' to 'closed'
  if (normalized === 'delivered') return 'closed';
  return normalized as BatchStatus;
};

// Get current language from localStorage or default to 'ru'
const getCurrentLanguage = (): 'en' | 'ru' => {
  if (typeof window !== 'undefined') {
    const lang = localStorage.getItem('i18nextLng') || 'ru';
    return lang.startsWith('ru') ? 'ru' : 'en';
  }
  return 'ru';
};

interface StatusBadgeProps {
  status: ReadinessStatus;
  className?: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, className, size = 'md' }: StatusBadgeProps) {
  const normalizedStatus = normalizeStatus(status);
  const style = useStatusBadgeStyle('batch', normalizedStatus);
  const lang = getCurrentLanguage();
  const label = getStatusLabel('batch', normalizedStatus, lang);

  return (
    <span
      className={cn(
        'status-badge',
        style.className,
        size === 'sm' && 'text-[10px] px-1.5 py-0',
        className
      )}
    >
      {label}
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
   7 lifecycle statuses: draft → submitted → matching → partial → fulfilled → closed → cancelled
   Now uses centralized useStatusBadgeStyle hook
   =========================================== */

export type PoolRequestStatus = 'draft' | 'submitted' | 'matching' | 'partial' | 'fulfilled' | 'closed' | 'cancelled';

interface PoolStatusBadgeProps {
  status: PoolRequestStatus;
  className?: string;
  size?: 'sm' | 'md';
}

export function PoolStatusBadge({ status, className, size = 'md' }: PoolStatusBadgeProps) {
  const style = useStatusBadgeStyle('pool', status);
  const lang = getCurrentLanguage();
  const label = getStatusLabel('pool', status, lang);

  return (
    <span
      className={cn(
        'pool-badge',
        style.className,
        size === 'sm' && 'text-[10px] px-1.5 py-0',
        className
      )}
    >
      {label}
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
