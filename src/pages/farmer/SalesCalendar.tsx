import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar as CalendarIcon, 
  List, 
  ChevronRight,
  Clock,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Eye,
  ArrowUpCircle,
  Edit,
  AlertCircle
} from 'lucide-react';
import { useBatches, useUpdateBatch, type Batch, type BatchStatus } from '@/hooks/useBatches';
import { format, parseISO, addMonths, startOfMonth, isSameMonth } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
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
import { toast } from '@/hooks/use-toast';

// Map database status to display status
const mapStatus = (status: BatchStatus): BatchStatus => {
  return status;
};

// Parse target week to get approximate month
// Supports formats: YYYY-WXX (e.g., 2025-W01) and WXX-YYYY (e.g., W01-2025)
function getMonthFromTargetWeek(targetWeek: string): Date {
  let year: number;
  let week: number;
  
  if (targetWeek.includes('-W')) {
    // Format: YYYY-WXX (e.g., 2025-W01)
    const [yearStr, weekStr] = targetWeek.split('-W');
    year = parseInt(yearStr);
    week = parseInt(weekStr);
  } else if (targetWeek.startsWith('W')) {
    // Format: WXX-YYYY (e.g., W01-2025)
    const parts = targetWeek.split('-');
    week = parseInt(parts[0].replace('W', ''));
    year = parseInt(parts[1]);
  } else {
    // Fallback: try to extract any numbers
    const matches = targetWeek.match(/\d+/g);
    if (matches && matches.length >= 2) {
      // Assume first is week, second is year if year > 100
      if (parseInt(matches[1]) > 100) {
        week = parseInt(matches[0]);
        year = parseInt(matches[1]);
      } else {
        year = parseInt(matches[0]);
        week = parseInt(matches[1]);
      }
    } else {
      return startOfMonth(new Date()); // Fallback to current month
    }
  }
  
  const date = new Date(year, 0, 1);
  date.setDate(date.getDate() + (week - 1) * 7);
  return startOfMonth(date);
}

// Get next matching window (example: first Monday of next month)
function getNextMatchingWindow(): Date {
  const now = new Date();
  const nextMonth = addMonths(now, 1);
  const firstDay = startOfMonth(nextMonth);
  // Find first Monday
  const dayOfWeek = firstDay.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek;
  return new Date(firstDay.getTime() + daysUntilMonday * 24 * 60 * 60 * 1000);
}

interface MonthData {
  month: Date;
  batches: Batch[];
  totals: {
    heads: number;
    forecast: number;
    softCommitted: number;
    confirmed: number;
    batchCount: number;
  };
}

export default function SalesCalendar() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { data: batches, isLoading, error } = useBatches();
  const updateBatch = useUpdateBatch();
  
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
  const [escalateBatch, setEscalateBatch] = useState<{ id: string; currentStatus: BatchStatus } | null>(null);

  const nextMatchingWindow = getNextMatchingWindow();
  const dateLocale = i18n.language === 'ru' ? ru : undefined;

  // Filter to only active batches (exclude closed/delivered)
  const activeBatches = useMemo(() => {
    if (!batches) return [];
    return batches.filter(b => !['closed', 'delivered'].includes(b.status));
  }, [batches]);

  // Generate months based on actual batch data - show 6 months ahead from current or from earliest batch
  const months = useMemo(() => {
    const result: Date[] = [];
    const now = new Date();
    const currentMonth = startOfMonth(now);
    
    // Find the earliest batch month from active batches
    let startMonth = currentMonth;
    if (activeBatches.length > 0) {
      const batchMonths = activeBatches.map(b => getMonthFromTargetWeek(b.target_week));
      const earliestBatch = batchMonths.reduce((min, date) => date < min ? date : min, batchMonths[0]);
      // Use earlier of current month or earliest batch month
      startMonth = earliestBatch < currentMonth ? earliestBatch : currentMonth;
    }
    
    // Generate 6 months from start
    for (let i = 0; i < 6; i++) {
      result.push(startOfMonth(addMonths(startMonth, i)));
    }
    return result;
  }, [activeBatches]);

  // Organize batches by month
  const monthData = useMemo((): MonthData[] => {
    if (!activeBatches.length) return months.map(month => ({
      month,
      batches: [],
      totals: { heads: 0, forecast: 0, softCommitted: 0, confirmed: 0, batchCount: 0 }
    }));

    return months.map(month => {
      const monthBatches = activeBatches.filter(batch => {
        const batchMonth = getMonthFromTargetWeek(batch.target_week);
        return isSameMonth(batchMonth, month);
      });

      const forecast = monthBatches.filter(b => b.status === 'forecast' || b.status === 'draft');
      const softCommitted = monthBatches.filter(b => b.status === 'soft_committed');
      const confirmed = monthBatches.filter(b => b.status === 'confirmed' || b.status === 'matched');

      return {
        month,
        batches: monthBatches,
        totals: {
          heads: monthBatches.reduce((sum, b) => sum + b.heads, 0),
          forecast: forecast.reduce((sum, b) => sum + b.heads, 0),
          softCommitted: softCommitted.reduce((sum, b) => sum + b.heads, 0),
          confirmed: confirmed.reduce((sum, b) => sum + b.heads, 0),
          batchCount: monthBatches.length,
        }
      };
    });
  }, [activeBatches, months]);

  // Check if batch is approaching matching window
  const isApproachingWindow = (batch: Batch): boolean => {
    const batchMonth = getMonthFromTargetWeek(batch.target_week);
    return batchMonth <= nextMatchingWindow && batch.status === 'forecast';
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

  const getNextStatus = (status: BatchStatus): string | null => {
    if (status === 'forecast') return t('batches.softCommitted');
    if (status === 'soft_committed') return t('batches.confirmed');
    return null;
  };

  const handleViewBatch = (batchNumber: string) => {
    const id = batchNumber.replace('BTH-', '');
    navigate(`/farmer/batch/${id}`);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <PageHeader title={t('calendar.title')} description={t('common.loading')} />
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <PageHeader title={t('calendar.title')} description={t('calendar.description')} />
        <Card>
          <CardContent className="py-8 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{t('batches.failedToLoad')}</p>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader 
        title={t('calendar.title')} 
        description={t('calendar.description')} 
      />

      {/* Next Matching Window Banner */}
      <Card className="mb-6 border-primary/30 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <CalendarIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{t('calendar.nextMatchingWindow')}</p>
                <p className="text-lg font-semibold text-primary">
                  {format(nextMatchingWindow, 'd MMMM yyyy', { locale: dateLocale })}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground max-w-xs text-right">
              {t('calendar.matchingWindowNote')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* View Toggle */}
      <div className="flex items-center justify-between mb-6">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'calendar' | 'list')}>
          <TabsList>
            <TabsTrigger value="calendar" className="gap-2">
              <CalendarIcon className="h-4 w-4" />
              {t('calendar.monthView')}
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2">
              <List className="h-4 w-4" />
              {t('calendar.listView')}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {viewMode === 'calendar' ? (
        /* Calendar View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {monthData.map((data) => {
            const monthKey = format(data.month, 'yyyy-MM');
            const isExpanded = expandedMonth === monthKey;
            const hasConfirmed = data.totals.confirmed > 0;
            const isMatchingMonth = isSameMonth(data.month, nextMatchingWindow);

            return (
              <Collapsible
                key={monthKey}
                open={isExpanded}
                onOpenChange={() => setExpandedMonth(isExpanded ? null : monthKey)}
              >
                <Card className={`transition-all ${hasConfirmed ? 'border-emerald-500/30' : ''} ${isMatchingMonth ? 'ring-2 ring-primary/30' : ''}`}>
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base font-medium">
                            {format(data.month, 'LLLL yyyy', { locale: dateLocale })}
                          </CardTitle>
                          {isMatchingMonth && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              {t('calendar.matching')}
                            </span>
                          )}
                        </div>
                        <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {data.totals.batchCount === 0 ? (
                        <div className="text-center py-2">
                          <p className="text-sm text-muted-foreground">{t('calendar.noBatchesDeclared')}</p>
                          <p className="text-xs text-muted-foreground mt-1">{t('calendar.addBatchesToSee')}</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-semibold">{data.totals.heads}</span>
                            <span className="text-sm text-muted-foreground">{t('calendar.heads')} • {data.totals.batchCount} {t('calendar.batches')}</span>
                          </div>
                          
                          {/* Status Breakdown */}
                          <div className="flex gap-4 text-xs">
                            <div className="flex items-center gap-1.5">
                              <FileText className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">{data.totals.forecast}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3 w-3 text-amber-600" />
                              <span className="text-amber-600">{data.totals.softCommitted}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              <span className="text-emerald-600">{data.totals.confirmed}</span>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                            {data.totals.confirmed > 0 && (
                              <div 
                                className="bg-emerald-500 h-full" 
                                style={{ width: `${(data.totals.confirmed / data.totals.heads) * 100}%` }}
                              />
                            )}
                            {data.totals.softCommitted > 0 && (
                              <div 
                                className="bg-amber-500 h-full" 
                                style={{ width: `${(data.totals.softCommitted / data.totals.heads) * 100}%` }}
                              />
                            )}
                            {data.totals.forecast > 0 && (
                              <div 
                                className="bg-muted-foreground/30 h-full" 
                                style={{ width: `${(data.totals.forecast / data.totals.heads) * 100}%` }}
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="pt-0 border-t">
                      <div className="space-y-2 pt-4">
                        {data.batches.map((batch) => {
                          const approaching = isApproachingWindow(batch);
                          const nextStatus = getNextStatus(batch.status);
                          
                          return (
                            <div 
                              key={batch.id}
                              className={`p-3 rounded-lg border ${approaching ? 'border-amber-500/50 bg-amber-500/5' : 'bg-muted/50'}`}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium">{batch.batch_number}</p>
                                    {approaching && (
                                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {batch.heads} {t('calendar.heads')} • {batch.region} • {t('common.grade')} {batch.grade}
                                  </p>
                                  <StatusBadge status={mapStatus(batch.status)} className="mt-1.5" />
                                </div>
                                <div className="flex gap-1">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-7 w-7"
                                    onClick={() => handleViewBatch(batch.batch_number)}
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                  </Button>
                                  {nextStatus && (
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-7 w-7 text-primary hover:text-primary"
                                      onClick={() => setEscalateBatch({ id: batch.id, currentStatus: batch.status })}
                                      title={`Escalate to ${nextStatus}`}
                                    >
                                      <ArrowUpCircle className="h-3.5 w-3.5" />
                                    </Button>
                                  )}
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-7 w-7"
                                    onClick={() => handleViewBatch(batch.batch_number)}
                                    title="Edit batch"
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                              {approaching && (
                                <p className="text-xs text-amber-600 mt-2">
                                  {t('calendar.updateReadinessBeforeWindow')}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>
      ) : (
        /* List View */
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">{t('calendar.allPlannedBatches')}</CardTitle>
            <CardDescription>{t('calendar.sortedByTargetWeek')}</CardDescription>
          </CardHeader>
          <CardContent>
            {activeBatches.length > 0 ? (
              <div className="space-y-3">
                {activeBatches
                  .sort((a, b) => a.target_week.localeCompare(b.target_week))
                  .map((batch) => {
                    const approaching = isApproachingWindow(batch);
                    const nextStatus = getNextStatus(batch.status);
                    const batchMonth = getMonthFromTargetWeek(batch.target_week);

                    return (
                      <div 
                        key={batch.id}
                        className={`p-4 rounded-lg border ${approaching ? 'border-amber-500/50 bg-amber-500/5' : 'bg-muted/30'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{batch.batch_number}</p>
                                {approaching && (
                                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {batch.heads} {t('calendar.heads')} • {batch.region} • {t('common.grade')} {batch.grade}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm font-medium">{format(batchMonth, 'LLL yyyy', { locale: dateLocale })}</p>
                              <p className="text-xs text-muted-foreground">{batch.target_week}</p>
                            </div>
                            <StatusBadge status={mapStatus(batch.status)} />
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => handleViewBatch(batch.batch_number)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {nextStatus && (
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-primary hover:text-primary"
                                  onClick={() => setEscalateBatch({ id: batch.id, currentStatus: batch.status })}
                                >
                                  <ArrowUpCircle className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                        {approaching && (
                          <p className="text-xs text-amber-600 mt-2">
                            {t('calendar.updateReadinessForMatching')}
                          </p>
                        )}
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-muted-foreground/60" />
                </div>
                <p className="font-medium text-foreground mb-1">{t('calendar.noBatchesYet')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('calendar.addBatchesByMonth')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Discipline Helper */}
      <Card className="mt-6 border-muted">
        <CardContent className="py-3">
          <p className="text-xs text-muted-foreground">
            <AlertTriangle className="h-3 w-3 inline mr-1 text-amber-500" />
            {t('calendar.keepDataUpdated')}
          </p>
        </CardContent>
      </Card>

      {/* Escalate Status Dialog */}
      <AlertDialog open={!!escalateBatch} onOpenChange={() => setEscalateBatch(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('calendar.updateReadinessStatus')}</AlertDialogTitle>
            <AlertDialogDescription>
              {escalateBatch && (
                <>
                  {t('calendar.moveFromTo', {
                    from: escalateBatch.currentStatus === 'forecast' ? t('batches.forecast') : t('batches.softCommitted'),
                    to: getNextStatus(escalateBatch.currentStatus)
                  })}
                  <br /><br />
                  {t('calendar.higherReadinessNote')}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleEscalateStatus}>
              {t('common.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
