import { cn } from '@/lib/utils';

type Status = 'forecast' | 'soft-committed' | 'confirmed';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusLabels: Record<Status, string> = {
  'forecast': 'Forecast',
  'soft-committed': 'Soft Committed',
  'confirmed': 'Confirmed',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium",
        status === 'forecast' && "status-forecast",
        status === 'soft-committed' && "status-soft-committed",
        status === 'confirmed' && "status-confirmed",
        className
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
