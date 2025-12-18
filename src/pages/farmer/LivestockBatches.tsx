import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Plus, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  FileText, 
  ArrowUpCircle,
  Trash2,
  Edit,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { useBatches, useBatchStats, useUpdateBatch, type BatchStatus } from '@/hooks/useBatches';
import { useStandardPremiums, getPremiumByLevel } from '@/hooks/usePremiums';
import { useIsObserver, useCanCreateBatches } from '@/hooks/useCurrentFarmer';
import { useGlobalBatchLockStatus } from '@/hooks/useBatchTimeLock';
import { getTimeLockedTooltip } from '@/lib/batch-time-lock';
import { type BatchLifecycleStatus } from '@/lib/batch-lifecycle';
import { PremiumBadge } from '@/components/premium';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ru } from 'date-fns/locale';
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
import { AggregatedDemandCard } from '@/components/farmer/AggregatedDemandCard';
import { CurrentMatchingWindowBanner } from '@/components/admin/CurrentMatchingWindowBanner';
import { toast } from '@/hooks/use-toast';

// Map database status to StatusBadge status
const mapStatus = (status: BatchStatus): BatchStatus => {
  return status;
};

// Check if batch needs attention (not updated in 14+ days)
const isStale = (updatedAt: string): boolean => {
  return differenceInDays(new Date(), parseISO(updatedAt)) > 14;
};

// Check if batch is approaching target week without confirmation
const isApproachingDeadline = (targetWeek: string, status: BatchStatus): boolean => {
  if (status === 'confirmed' || status === 'matched' || status === 'closed') return false;
  // Simple check - if target week contains current or next month
  const currentMonth = new Date().getMonth();
  const targetMonth = parseInt(targetWeek.split('-')[1] || '0', 10) - 1;
  return targetMonth <= currentMonth + 1;
};

export default function LivestockBatches() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { data: batches, isLoading, error } = useBatches();
  const stats = useBatchStats();
  const updateBatch = useUpdateBatch();
  const { data: standardPremiums } = useStandardPremiums();
  const isObserver = useIsObserver();
  const canCreateBatches = useCanCreateBatches();
  const { checkBatchLock } = useGlobalBatchLockStatus();
  
  const [withdrawBatchId, setWithdrawBatchId] = useState<string | null>(null);
  const [escalateBatch, setEscalateBatch] = useState<{ id: string; currentStatus: BatchStatus } | null>(null);
  const [newBatchOpen, setNewBatchOpen] = useState(false);

  const dateLocale = i18n.language === 'ru' ? ru : undefined;

  const handleRowClick = (batchNumber: string) => {
    const id = batchNumber.replace('BTH-', '');
    navigate(`/farmer/batch/${id}`);
  };

  const getStatusLabel = (status: BatchStatus): string => {
    if (status === 'forecast') return t('batches.forecast');
    if (status === 'soft_committed') return t('batches.softCommitted');
    return t('batches.confirmed');
  };

  const handleEscalateStatus = () => {
    if (!escalateBatch) return;
    
    const newStatus: BatchStatus = escalateBatch.currentStatus === 'forecast' ? 'soft_committed' : 'confirmed';
    
    updateBatch.mutate(
      { id: escalateBatch.id, status: newStatus },
      {
        onSuccess: () => {
          toast({
            title: t('batches.statusUpdated'),
            description: t('batches.statusChangedTo', { status: getStatusLabel(newStatus) }),
          });
          setEscalateBatch(null);
        },
      }
    );
  };

  const handleWithdraw = () => {
    if (!withdrawBatchId) return;
    
    toast({
      title: t('batches.batchWithdrawn'),
      description: t('batches.batchWithdrawnDescription'),
    });
    setWithdrawBatchId(null);
  };

  const getNextStatus = (status: BatchStatus): string | null => {
    if (status === 'forecast') return t('batches.softCommitted');
    if (status === 'soft_committed') return t('batches.confirmed');
    return null;
  };

  return (
    <MainLayout>
      <PageHeader 
        title={t('batches.title')} 
        description={t('batches.description')} 
      />

      {/* Observer Mode Banner */}
      {isObserver && (
        <Alert className="mb-4 border-amber-500/30 bg-amber-500/5">
          <Lock className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-sm">
            <span className="font-medium text-amber-700">Observer Mode</span>
            <span className="text-muted-foreground"> — You have read-only access. Batch creation and confirmation will be available after Admin activation.</span>
          </AlertDescription>
        </Alert>
      )}

      {/* Matching Window Status Banner */}
      <CurrentMatchingWindowBanner />

      {/* Two-column layout: Batch Stats + Market Signals side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4 mb-6">
        {/* Batch Stats - compact inline */}
        <div className="lg:col-span-2 grid grid-cols-3 gap-3">
          <Card className="border-muted">
            <CardContent className="py-4 px-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-muted">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xl font-semibold">{stats.forecast}</p>
                  <p className="text-xs text-muted-foreground">{t('batches.forecast')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-amber-500/20">
            <CardContent className="py-4 px-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-amber-500/10">
                  <Clock className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xl font-semibold">{stats.softCommitted}</p>
                  <p className="text-xs text-muted-foreground">{t('batches.softCommitted')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-emerald-500/20">
            <CardContent className="py-4 px-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-emerald-500/10">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xl font-semibold">{stats.confirmed}</p>
                  <p className="text-xs text-muted-foreground">{t('batches.confirmed')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Market Demand Signals - collapsible, right side */}
        <div className="lg:col-span-1">
          <AggregatedDemandCard />
        </div>
      </div>

      {/* Main Batches Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-medium">{t('batches.batchRegistry')}</CardTitle>
            <CardDescription>{t('batches.manageBatches')}</CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-block">
                  <Button 
                    size="sm" 
                    onClick={() => setNewBatchOpen(true)}
                    disabled={!canCreateBatches}
                    className={!canCreateBatches ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    {!canCreateBatches && <Lock className="w-3 h-3 mr-2" />}
                    <Plus className="w-4 h-4 mr-2" />
                    {t('batches.newBatch')}
                  </Button>
                </span>
              </TooltipTrigger>
              {!canCreateBatches && (
                <TooltipContent>
                  <p>Available after Admin activation</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
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
              <p className="text-sm text-muted-foreground">{t('batches.failedToLoad')}</p>
            </div>
          ) : batches && batches.length > 0 ? (
            <>
            <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('batches.batchNumber')}</TableHead>
                    <TableHead>{t('common.region')}</TableHead>
                    <TableHead>{t('batches.targetWeek')}</TableHead>
                    <TableHead>{t('batches.heads')}</TableHead>
                    <TableHead>{t('batches.characteristics')}</TableHead>
                    <TableHead>{t('common.grade')}</TableHead>
                    <TableHead>{t('batches.standardStatus')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                    <TableHead>{t('batches.lastUpdated')}</TableHead>
                    <TableHead className="text-right">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.map((batch) => {
                    const stale = isStale(batch.updated_at);
                    const approaching = isApproachingDeadline(batch.target_week, batch.status);
                    const nextStatus = getNextStatus(batch.status);
                    const hasCharacteristics = batch.breed || batch.gender || batch.age_min || batch.age_max || batch.weight_min || batch.weight_max;
                    const standardStatus = (batch as any).standard_status || 'non_standard';
                    const premiumValue = getPremiumByLevel(standardPremiums, standardStatus)?.premium_value ?? 0;
                    const batchLockStatus = checkBatchLock(batch.status as BatchLifecycleStatus);
                    const isTimeLocked = batchLockStatus.isLocked;
                    
                    return (
                      <TableRow 
                        key={batch.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleRowClick(batch.batch_number)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {batch.batch_number}
                            {isTimeLocked && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Lock className="w-4 h-4 text-amber-500" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{getTimeLockedTooltip()}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            {!isTimeLocked && (stale || approaching) && (
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{batch.region}</TableCell>
                        <TableCell>{batch.target_week}</TableCell>
                        <TableCell>{batch.heads}</TableCell>
                        <TableCell>
                          {hasCharacteristics ? (
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {batch.breed && (
                                <Badge variant="outline" className="text-xs">{batch.breed}</Badge>
                              )}
                              {batch.gender && (
                                <Badge variant="outline" className="text-xs">{batch.gender}</Badge>
                              )}
                              {(batch.age_min || batch.age_max) && (
                                <Badge variant="outline" className="text-xs">
                                  {batch.age_min ?? '–'}–{batch.age_max ?? '–'} mo
                                </Badge>
                              )}
                              {(batch.weight_min || batch.weight_max) && (
                                <Badge variant="outline" className="text-xs">
                                  {batch.weight_min ?? '–'}–{batch.weight_max ?? '–'} kg
                                </Badge>
                          )}
                                          </div>
                                          ) : (
                                            <span className="text-xs text-muted-foreground">{t('batches.notSpecified')}</span>
                                          )}
                                        </TableCell>
                                        <TableCell>
                                          <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-secondary text-sm font-medium">
                                            {batch.grade}
                                          </span>
                                        </TableCell>
                        <TableCell>
                          <PremiumBadge 
                            status={standardStatus} 
                            premiumValue={premiumValue}
                            showValue={premiumValue > 0}
                            size="sm"
                          />
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={mapStatus(batch.status)} />
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {format(parseISO(batch.updated_at), 'd MMM yyyy', { locale: dateLocale })}
                          {stale && (
                            <span className="block text-xs text-amber-600">{t('batches.needsUpdate')}</span>
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
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="inline-block">
                                      <Button 
                                        variant="ghost" 
                                        size="icon"
                                        className={`h-8 w-8 ${(!canCreateBatches || isTimeLocked) ? 'opacity-50 cursor-not-allowed' : 'text-primary hover:text-primary'}`}
                                        onClick={() => canCreateBatches && !isTimeLocked && setEscalateBatch({ id: batch.id, currentStatus: batch.status })}
                                        disabled={!canCreateBatches || isTimeLocked}
                                      >
                                        {(!canCreateBatches || isTimeLocked) ? <Lock className="w-4 h-4" /> : <ArrowUpCircle className="w-4 h-4" />}
                                      </Button>
                                    </span>
                                  </TooltipTrigger>
                                  {!canCreateBatches ? (
                                    <TooltipContent>
                                      <p>Available after Admin activation</p>
                                    </TooltipContent>
                                  ) : isTimeLocked ? (
                                    <TooltipContent>
                                      <p>{getTimeLockedTooltip()}</p>
                                    </TooltipContent>
                                  ) : (
                                    <TooltipContent>
                                      <p>Escalate to {nextStatus}</p>
                                    </TooltipContent>
                                  )}
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="inline-block">
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      className={`h-8 w-8 ${!canCreateBatches ? 'opacity-50 cursor-not-allowed' : 'text-destructive hover:text-destructive'}`}
                                      onClick={() => canCreateBatches && setWithdrawBatchId(batch.id)}
                                      disabled={!canCreateBatches}
                                    >
                                      {!canCreateBatches ? <Lock className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                                    </Button>
                                  </span>
                                </TooltipTrigger>
                                {!canCreateBatches && (
                                  <TooltipContent>
                                    <p>Available after Admin activation</p>
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </TooltipProvider>
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
                  {t('batches.keepDataUpdated')}
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <FileText className="w-10 h-10 text-muted-foreground/60" />
              </div>
              <p className="font-medium text-foreground mb-1">{t('batches.noBatches')}</p>
              <p className="text-sm text-muted-foreground max-w-sm mb-4">
                {isObserver 
                  ? 'Batch creation will be available after Admin activation.'
                  : t('batches.noBatchesDescription')
                }
              </p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-block">
                      <Button 
                        onClick={() => setNewBatchOpen(true)} 
                        disabled={!canCreateBatches}
                        className={!canCreateBatches ? 'opacity-50 cursor-not-allowed' : ''}
                      >
                        {!canCreateBatches && <Lock className="w-4 h-4 mr-2" />}
                        <Plus className="w-4 h-4 mr-2" />
                        {t('batches.declareFirstBatch')}
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {!canCreateBatches && (
                    <TooltipContent>
                      <p>Available after Admin activation</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Escalate Status Dialog */}
      <AlertDialog open={!!escalateBatch} onOpenChange={() => setEscalateBatch(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('batches.escalateStatus')}</AlertDialogTitle>
            <AlertDialogDescription>
              {escalateBatch && (
                <>
                  {t('batches.escalateConfirmation', {
                    from: escalateBatch.currentStatus === 'forecast' ? t('batches.forecast') : t('batches.softCommitted'),
                    to: getNextStatus(escalateBatch.currentStatus)
                  })}
                  <br /><br />
                  {t('batches.escalateNote')}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleEscalateStatus}>
              {t('batches.confirmEscalation')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Withdraw Dialog */}
      <AlertDialog open={!!withdrawBatchId} onOpenChange={() => setWithdrawBatchId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('batches.withdrawBatch')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('batches.withdrawConfirmation')}
              <br /><br />
              {t('batches.withdrawNote')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleWithdraw}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('batches.withdrawBatch')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* New Batch Dialog */}
      <NewBatchDialog open={newBatchOpen} onOpenChange={setNewBatchOpen} />
    </MainLayout>
  );
}
