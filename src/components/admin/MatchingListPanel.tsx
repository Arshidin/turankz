import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  useMatchingsWithDetails,
  useFinalizeMatching,
  useCancelMatching,
  type MatchingWithDetails,
} from '@/hooks/useMatchings';
import { ReallocateVolumeDialog } from './ReallocateVolumeDialog';
import { MatchingAuditHistory } from './MatchingAuditHistory';
import { MatchingPremiumPanel, InlinePremiumSummary } from '@/components/premium';
import { PremiumBreakdown } from '@/lib/premium-eligibility';
import {
  MATCHING_STATUS_LABELS,
  type MatchingLifecycleStatus,
} from '@/lib/matching-lifecycle';
import {
  prepareSettlementData,
  exportSettlementCSV,
  printSettlementPDF,
} from '@/lib/settlement-export';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import {
  Link2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  MoreHorizontal,
  ArrowLeftRight,
  History,
  Calculator,
  Lock,
  Download,
  FileText,
} from 'lucide-react';

interface MatchingListPanelProps {
  requestId?: string;
  compact?: boolean;
  requestInfo?: { requestNumber: string; mpkName: string; targetWeek: string };
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

export function MatchingListPanel({ requestId, compact = false, requestInfo }: MatchingListPanelProps) {
  const { data: matchings, isLoading } = useMatchingsWithDetails(requestId);
  const finalizeMatching = useFinalizeMatching();
  const cancelMatching = useCancelMatching();

  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; matchId: string | null }>({
    open: false,
    matchId: null,
  });
  const [cancelReason, setCancelReason] = useState('');
  const [reallocateMatching, setReallocateMatching] = useState<MatchingWithDetails | null>(null);
  const [auditMatchId, setAuditMatchId] = useState<string | null>(null);
  const [premiumDialog, setPremiumDialog] = useState<MatchingWithDetails | null>(null);
  const [pendingPremiumBreakdown, setPendingPremiumBreakdown] = useState<PremiumBreakdown | null>(null);

  const handlePremiumCalculated = useCallback((breakdown: PremiumBreakdown) => {
    setPendingPremiumBreakdown(breakdown);
  }, []);

  const handleFinalize = (matchId: string) => {
    // If we have premium breakdown, include it in finalization
    if (pendingPremiumBreakdown) {
      finalizeMatching.mutate({ 
        matchId, 
        premiumBreakdown: pendingPremiumBreakdown 
      });
    } else {
      finalizeMatching.mutate({ matchId });
    }
    setPremiumDialog(null);
    setPendingPremiumBreakdown(null);
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

  const handleExportCSV = () => {
    if (!matchings) return;
    const { items, summary } = prepareSettlementData(matchings);
    if (items.length === 0) {
      toast.error('No finalized matchings to export');
      return;
    }
    exportSettlementCSV(items, summary, requestInfo?.requestNumber);
    toast.success('Settlement CSV exported');
  };

  const handlePrintPDF = () => {
    if (!matchings) return;
    const { items, summary } = prepareSettlementData(matchings);
    if (items.length === 0) {
      toast.error('No finalized matchings to print');
      return;
    }
    printSettlementPDF(items, summary, requestInfo);
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
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="text-blue-600">{activeCount} active</span>
                <span>·</span>
                <span className="text-emerald-600">{finalizedCount} finalized</span>
              </div>
              {finalizedCount > 0 && (
                <div className="flex items-center gap-1 border-l pl-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={handleExportCSV}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Export Settlement CSV</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={handlePrintPDF}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Print Settlement PDF</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Batch</TableHead>
                <TableHead className="text-xs">Heads</TableHead>
                <TableHead className="text-xs">Price</TableHead>
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
                  <TableCell className="py-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="cursor-help">
                            <InlinePremiumSummary
                              matchId={matching.id}
                              isFinalized={matching.status === 'finalized'}
                              totalPricePerKg={(matching as any).total_price_per_kg}
                              totalPremium={(matching as any).total_premium}
                              premiumLocked={(matching as any).premium_locked}
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          {matching.status === 'finalized' && (matching as any).premium_locked
                            ? 'Premium locked at finalization'
                            : 'Click finalize to lock premiums'}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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
                          onClick={() => setPremiumDialog(matching)}
                          disabled={finalizeMatching.isPending}
                        >
                          <Calculator className="h-3 w-3 mr-1" />
                          Review & Finalize
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setReallocateMatching(matching)}>
                              <ArrowLeftRight className="h-4 w-4 mr-2" />
                              Reallocate Volume
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setAuditMatchId(matching.id)}>
                              <History className="h-4 w-4 mr-2" />
                              View Audit History
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => setCancelDialog({ open: true, matchId: matching.id })}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel Matching
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                    {matching.status === 'finalized' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setAuditMatchId(matching.id)}
                      >
                        <History className="h-3 w-3 mr-1" />
                        History
                      </Button>
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

      {/* Reallocate Volume Dialog */}
      <ReallocateVolumeDialog
        matching={reallocateMatching}
        open={!!reallocateMatching}
        onOpenChange={(open) => !open && setReallocateMatching(null)}
      />

      {/* Audit History Dialog */}
      <Dialog open={!!auditMatchId} onOpenChange={(open) => !open && setAuditMatchId(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Matching Audit History
            </DialogTitle>
          </DialogHeader>
          <MatchingAuditHistory matchId={auditMatchId} />
        </DialogContent>
      </Dialog>

      {/* Premium Review & Finalize Dialog */}
      <Dialog 
        open={!!premiumDialog} 
        onOpenChange={(open) => {
          if (!open) {
            setPremiumDialog(null);
            setPendingPremiumBreakdown(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Review Premium Eligibility
            </DialogTitle>
            <DialogDescription>
              Review the calculated premiums before finalizing. Premiums will be locked after finalization.
            </DialogDescription>
          </DialogHeader>
          {premiumDialog && (
            <MatchingPremiumPanel
              matchId={premiumDialog.id}
              batchId={premiumDialog.batch_id}
              farmerId=""
              isFinalized={false}
              onCalculateComplete={handlePremiumCalculated}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPremiumDialog(null)}>
              Cancel
            </Button>
            <Button 
              onClick={() => premiumDialog && handleFinalize(premiumDialog.id)}
              disabled={finalizeMatching.isPending}
            >
              <Lock className="h-4 w-4 mr-2" />
              {finalizeMatching.isPending ? 'Finalizing...' : 'Finalize & Lock Premiums'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
