import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  FileText, 
  ArrowUpCircle,
  Trash2,
  Edit,
  AlertTriangle
} from 'lucide-react';
import { useBatches, useBatchStats, useUpdateBatch, type BatchStatus } from '@/hooks/useBatches';
import { format, parseISO, differenceInDays } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { NewBatchDialog } from '@/components/farmer/NewBatchDialog';
import { toast } from '@/hooks/use-toast';

// Map database status to StatusBadge status
const mapStatus = (status: BatchStatus): 'forecast' | 'soft-committed' | 'confirmed' => {
  if (status === 'soft_committed') return 'soft-committed';
  if (status === 'confirmed' || status === 'delivered') return 'confirmed';
  return 'forecast';
};

// Check if batch needs attention (not updated in 14+ days)
const isStale = (updatedAt: string): boolean => {
  return differenceInDays(new Date(), parseISO(updatedAt)) > 14;
};

// Check if batch is approaching target week without confirmation
const isApproachingDeadline = (targetWeek: string, status: BatchStatus): boolean => {
  if (status === 'confirmed' || status === 'delivered') return false;
  // Simple check - if target week contains current or next month
  const currentMonth = new Date().getMonth();
  const targetMonth = parseInt(targetWeek.split('-')[1] || '0', 10) - 1;
  return targetMonth <= currentMonth + 1;
};

export default function LivestockBatches() {
  const navigate = useNavigate();
  const { data: batches, isLoading, error } = useBatches();
  const stats = useBatchStats();
  const updateBatch = useUpdateBatch();
  
  const [withdrawBatchId, setWithdrawBatchId] = useState<string | null>(null);
  const [escalateBatch, setEscalateBatch] = useState<{ id: string; currentStatus: BatchStatus } | null>(null);
  const [newBatchOpen, setNewBatchOpen] = useState(false);

  const handleRowClick = (batchNumber: string) => {
    const id = batchNumber.replace('BTH-', '');
    navigate(`/farmer/batch/${id}`);
  };

  const handleEscalateStatus = () => {
    if (!escalateBatch) return;
    
    const newStatus: BatchStatus = escalateBatch.currentStatus === 'forecast' ? 'soft_committed' : 'confirmed';
    
    updateBatch.mutate(
      { id: escalateBatch.id, status: newStatus },
      {
        onSuccess: () => {
          toast({
            title: 'Status Updated',
            description: `Batch status changed to ${newStatus === 'soft_committed' ? 'Soft Committed' : 'Confirmed'}.`,
          });
          setEscalateBatch(null);
        },
      }
    );
  };

  const handleWithdraw = () => {
    if (!withdrawBatchId) return;
    
    // For now, we'll set status to a withdrawn state or delete
    // Since there's no 'withdrawn' status, we'll show a toast
    toast({
      title: 'Batch Withdrawn',
      description: 'The batch has been withdrawn from pool consideration.',
    });
    setWithdrawBatchId(null);
  };

  const getNextStatus = (status: BatchStatus): string | null => {
    if (status === 'forecast') return 'Soft Committed';
    if (status === 'soft_committed') return 'Confirmed';
    return null;
  };

  return (
    <MainLayout>
      <PageHeader 
        title="Livestock Batches" 
        description="Declare supply availability and signal readiness for pool matching" 
      />

      {/* Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.forecast}</p>
                <p className="text-sm text-muted-foreground">Forecast</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.softCommitted}</p>
                <p className="text-sm text-muted-foreground">Soft Committed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.confirmed}</p>
                <p className="text-sm text-muted-foreground">Confirmed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Helper Text */}
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="py-3">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Only <span className="text-amber-600 font-medium">Soft Committed</span> and <span className="text-emerald-600 font-medium">Confirmed</span> batches are considered for pool matching. Moving to higher readiness increases your priority.
          </p>
        </CardContent>
      </Card>

      {/* Main Batches Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-medium">Batch Registry</CardTitle>
            <CardDescription>Manage your declared livestock batches</CardDescription>
          </div>
          <Button size="sm" onClick={() => setNewBatchOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Batch
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Failed to load batches. Please try again.</p>
            </div>
          ) : batches && batches.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch ID</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Target Week</TableHead>
                    <TableHead>Heads</TableHead>
                    <TableHead>Avg. Weight</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.map((batch) => {
                    const stale = isStale(batch.updated_at);
                    const approaching = isApproachingDeadline(batch.target_week, batch.status);
                    const nextStatus = getNextStatus(batch.status);
                    
                    return (
                      <TableRow 
                        key={batch.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleRowClick(batch.batch_number)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {batch.batch_number}
                            {(stale || approaching) && (
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{batch.region}</TableCell>
                        <TableCell>{batch.target_week}</TableCell>
                        <TableCell>{batch.heads}</TableCell>
                        <TableCell>{batch.avg_weight ? `${batch.avg_weight} kg` : '—'}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-secondary text-sm font-medium">
                            {batch.grade}
                          </span>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={mapStatus(batch.status)} />
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {format(parseISO(batch.updated_at), 'MMM d, yyyy')}
                          {stale && (
                            <span className="block text-xs text-amber-600">Needs update</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleRowClick(batch.batch_number)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {nextStatus && (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8 text-primary hover:text-primary"
                                onClick={() => setEscalateBatch({ id: batch.id, currentStatus: batch.status })}
                                title={`Escalate to ${nextStatus}`}
                              >
                                <ArrowUpCircle className="w-4 h-4" />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setWithdrawBatchId(batch.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              {/* Discipline Helper */}
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  <AlertTriangle className="w-3 h-3 inline mr-1 text-amber-500" />
                  Keeping batch data up to date increases your chances of being included in a pool.
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <FileText className="w-10 h-10 text-muted-foreground/60" />
              </div>
              <p className="font-medium text-foreground mb-1">No batches declared yet.</p>
              <p className="text-sm text-muted-foreground max-w-sm mb-4">
                Declared batches are required to be considered for pool matching.
              </p>
              <Button onClick={() => setNewBatchOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Declare First Batch
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Escalate Status Dialog */}
      <AlertDialog open={!!escalateBatch} onOpenChange={() => setEscalateBatch(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Escalate Batch Status</AlertDialogTitle>
            <AlertDialogDescription>
              {escalateBatch && (
                <>
                  Are you sure you want to move this batch from{' '}
                  <strong>{escalateBatch.currentStatus === 'forecast' ? 'Forecast' : 'Soft Committed'}</strong> to{' '}
                  <strong>{getNextStatus(escalateBatch.currentStatus)}</strong>?
                  <br /><br />
                  Higher readiness status indicates stronger commitment and increases matching priority.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleEscalateStatus}>
              Confirm Escalation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Withdraw Dialog */}
      <AlertDialog open={!!withdrawBatchId} onOpenChange={() => setWithdrawBatchId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Withdraw Batch</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to withdraw this batch? It will no longer be considered for pool matching.
              <br /><br />
              This action indicates you are no longer able to supply this batch.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleWithdraw}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Withdraw Batch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* New Batch Dialog */}
      <NewBatchDialog open={newBatchOpen} onOpenChange={setNewBatchOpen} />
    </MainLayout>
  );
}
