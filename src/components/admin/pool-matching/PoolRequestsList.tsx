import { Skeleton } from '@/components/ui/skeleton';
import { PoolRequest } from '@/hooks/usePoolRequests';
import { PoolRequestCard } from './PoolRequestCard';

interface PoolRequestsListProps {
  requests: PoolRequest[] | undefined;
  isLoading: boolean;
  activeRequestId: string | null;
  onSelectRequest: (id: string) => void;
  onEdit: (request: PoolRequest) => void;
  onStatusOverride: (request: PoolRequest) => void;
  onViewAudit: (requestId: string) => void;
}

export function PoolRequestsList({
  requests,
  isLoading,
  activeRequestId,
  onSelectRequest,
  onEdit,
  onStatusOverride,
  onViewAudit,
}: PoolRequestsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <p className="font-medium text-foreground mb-1">No active pool requests.</p>
        <p className="text-sm text-muted-foreground">Pool requests appear once MPKs submit demand.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {requests
        .filter((request) => request.status !== 'draft')
        .map((request) => (
          <PoolRequestCard
            key={request.id}
            request={request}
            isActive={request.id === activeRequestId}
            onSelect={onSelectRequest}
            onEdit={onEdit}
            onStatusOverride={onStatusOverride}
            onViewAudit={onViewAudit}
          />
        ))}
    </div>
  );
}
