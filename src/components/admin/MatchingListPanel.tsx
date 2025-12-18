import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useMatchingsWithDetails,
  useFinalizeMatching,
  useCancelMatching,
  type MatchingWithDetails,
} from '@/hooks/useMatchings';
import {
  MATCHING_STATUS_LABELS,
  type MatchingLifecycleStatus,
} from '@/lib/matching-lifecycle';
import { format, parseISO } from 'date-fns';
import {
  Link2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';

interface MatchingListPanelProps {
  requestId?: string;
  compact?: boolean;
}

const getStatusBadge = (status: MatchingLifecycleStatus) => {
  switch (status) {
    case 'active':
      return (
        <Badge className="bg-blue-500/10 text-blue-600 border-0">
          <Clock className="h-3 w-3 mr-1" />
          Active
        </Badge>
      );
    case 'finalized':
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 border-0">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Finalized
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge variant="outline" className="text-muted-foreground">
          <XCircle className="h-3 w-3 mr-1" />
          Cancelled
        </Badge>
      );
  }
};

export function MatchingListPanel({ requestId, compact = false }: MatchingListPanelProps) {
  const { data: matchings, isLoading } = useMatchingsWithDetails(requestId);
  const finalizeMatching = useFinalizeMatching();
  const cancelMatching = useCancelMatching();

  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; matchId: string | null }>({
    open: false,
    matchId: null,
  });
  const [cancelReason, setCancelReason] = useState('');

  const handleFinalize = (matchId: string) => {
    finalizeMatching.mutate({ matchId });
  };

  const handleCancelConfirm = () => {
    if (!cancelDialog.matchId || !cancelReason.trim()) return;
    cancelMatching.mutate({
      matchId: cancelDialog.matchId,
      reason: cancelReason.trim(),
    });
    setCancelDialog({ open: false, matchId: null });
    setCancelReason('');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Link2 className="h-4 w-4" />
            Matchings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!matchings || matchings.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Link2 className="h-4 w-4" />
            Matchings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No matchings created yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const displayMatchings = compact ? matchings.slice(0, 5) : matchings;
  const activeCount = matchings.filter(m => m.status === 'active').length;
  const finalizedCount = matchings.filter(m => m.status === 'finalized').length;

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Link2 className="h-4 w-4" />
              Matchings
              <Badge variant="secondary" className="ml-2 text-xs">
                {matchings.length}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="text-blue-600">{activeCount} active</span>
              <span>·</span>
              <span className="text-emerald-600">{finalizedCount} finalized</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Batch</TableHead>
                <TableHead className="text-xs">Heads</TableHead>
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayMatchings.map(matching => (
                <TableRow key={matching.id}>
                  <TableCell className="py-2">
                    <div>
                      <span className="font-medium text-sm">
                        {matching.batch?.batch_number || matching.batch_id.slice(0, 8)}
                      </span>
                      {matching.batch && (
                        <span className="text-xs text-muted-foreground ml-2">
                          {matching.batch.region} · {matching.batch.grade}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-2 font-medium">
                    {matching.heads_matched}
                  </TableCell>
                  <TableCell className="py-2 text-sm text-muted-foreground">
                    {format(parseISO(matching.matching_date), 'MMM d')}
                  </TableCell>
                  <TableCell className="py-2">
                    {getStatusBadge(matching.status)}
                  </TableCell>
                  <TableCell className="py-2 text-right">
                    {matching.status === 'active' && (
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => handleFinalize(matching.id)}
                          disabled={finalizeMatching.isPending}
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Finalize
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-destructive hover:text-destructive"
                          onClick={() => setCancelDialog({ open: true, matchId: matching.id })}
                          disabled={cancelMatching.isPending}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    )}
                    {matching.status === 'cancelled' && matching.cancellation_reason && (
                      <span className="text-xs text-muted-foreground italic">
                        {matching.cancellation_reason.slice(0, 30)}...
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {compact && matchings.length > 5 && (
            <p className="text-xs text-muted-foreground text-center py-2">
              +{matchings.length - 5} more matchings
            </p>
          )}
        </CardContent>
      </Card>

      {/* Cancel Dialog */}
      <Dialog
        open={cancelDialog.open}
        onOpenChange={(open) => {
          setCancelDialog({ ...cancelDialog, open });
          if (!open) setCancelReason('');
        }}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Cancel Matching
            </DialogTitle>
            <DialogDescription>
              This will remove the binding between the batch and pool request.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="cancel-reason">Reason for Cancellation *</Label>
            <Textarea
              id="cancel-reason"
              placeholder="Explain why this matching is being cancelled..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialog({ open: false, matchId: null })}
            >
              Keep Matching
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelConfirm}
              disabled={!cancelReason.trim() || cancelMatching.isPending}
            >
              {cancelMatching.isPending ? 'Cancelling...' : 'Cancel Matching'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
