import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, FileText, Calendar, AlertTriangle, TrendingUp, Info, Trash2 } from 'lucide-react';
import { useMyHerdSnapshots, useDeleteHerdSnapshot, LIVESTOCK_CATEGORIES, type HerdStructureSnapshot } from '@/hooks/useHerdStructure';
import { useFarmerForecast, useForecastCoefficients } from '@/hooks/useForecast';
import { ConfidenceBadge } from '@/components/data-integrity/ConfidenceBadge';
import { HerdSnapshotWizard } from '@/components/herd/HerdSnapshotWizard';
import { format, differenceInHours } from 'date-fns';
import { toast } from 'sonner';

function formatPeriod(snapshot: HerdStructureSnapshot): string {
  if (snapshot.reporting_period_type === 'annual') {
    return `${snapshot.reporting_year}`;
  }
  return `Q${snapshot.reporting_quarter} ${snapshot.reporting_year}`;
}

function groupSnapshotsByPeriod(snapshots: HerdStructureSnapshot[]) {
  const groups: Record<string, HerdStructureSnapshot[]> = {};
  
  snapshots.forEach(snapshot => {
    const key = `${snapshot.reporting_year}-${snapshot.reporting_quarter ?? 'annual'}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(snapshot);
  });
  
  return Object.entries(groups).map(([key, items]) => ({
    key,
    period: formatPeriod(items[0]),
    periodType: items[0].reporting_period_type,
    year: items[0].reporting_year,
    quarter: items[0].reporting_quarter,
    items,
    totalCount: items.reduce((sum, s) => sum + s.count, 0),
    createdAt: items[0].created_at,
  }));
}

export default function HerdStructure() {
  const { t } = useTranslation();
  const { data: snapshots, isLoading } = useMyHerdSnapshots();
  const { data: forecast, isLoading: forecastLoading } = useFarmerForecast();
  const { data: coefficients } = useForecastCoefficients();
  const deleteSnapshot = useDeleteHerdSnapshot();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const groupedSnapshots = snapshots ? groupSnapshotsByPeriod(snapshots) : [];
  const calvingRate = coefficients?.find(c => c.coefficient_type === 'calving_rate')?.coefficient_value || 0.85;

  // Calculate forecast summary
  const breedingCowsForecast = forecast?.filter(f => f.category === 'breeding_cows') || [];
  const totalBreedingCows = breedingCowsForecast.reduce((sum, f) => sum + f.current_count, 0);
  const estimatedCalves = Math.round(totalBreedingCows * calvingRate);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <PageHeader
            title={t('herdStructure.title', 'My Herd Structure')}
            description={t('herdStructure.description', 'Declare your herd composition by period. This data is used for national capacity planning.')}
          />
          <Button onClick={() => setWizardOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t('herdStructure.newSnapshot', 'New Snapshot')}
          </Button>
        </div>

        <Tabs defaultValue="snapshots" className="space-y-4">
          <TabsList>
            <TabsTrigger value="snapshots">Herd Snapshots</TabsTrigger>
            <TabsTrigger value="forecast">Indicative Outlook</TabsTrigger>
          </TabsList>

          <TabsContent value="snapshots" className="space-y-4">
            {/* System Guardrail: Data & Outlook section disclaimer */}
            <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/50">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  {t('herdStructure.disclaimer.title', 'Data & Outlook — Structural Data Only')}
                </p>
                <p className="text-amber-700 dark:text-amber-300 mt-0.5">
                  {t('herdStructure.disclaimer.text', 'Herd structure data does not create batches or market commitments. To participate in matching, create a batch in Market Operations → Livestock Batches.')}
                </p>
              </div>
            </div>

            {/* Info Banner */}
            <Card className="bg-muted/50 border-muted">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">
                      {t('herdStructure.aboutTitle', 'About Herd Structure Data')}
                    </p>
                    <p>
                      {t('herdStructure.aboutDescription', 'Herd structure represents your farm\'s livestock capacity, not market availability. Each snapshot captures your herd composition at a point in time. Historical snapshots cannot be modified.')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-48" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-24 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : groupedSnapshots.length === 0 ? (
              <EmptyState
                icon={Calendar}
                message={t('herdStructure.noSnapshots', 'No herd snapshots')}
                helperText={t('herdStructure.noSnapshotsDescription', 'Create your first herd structure snapshot to begin tracking your livestock capacity.')}
                actionLabel={t('herdStructure.createFirst', 'Create First Snapshot')}
                onAction={() => setWizardOpen(true)}
              />
            ) : (
              <div className="space-y-4">
                {groupedSnapshots.map(group => (
                  <Card key={group.key}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {group.period}
                            <Badge variant="outline" className="ml-2 text-xs">
                              {group.periodType === 'annual' ? 'Annual' : 'Quarterly'}
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            {t('herdStructure.submittedOn', 'Submitted on')} {format(new Date(group.createdAt), 'MMM d, yyyy')}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-semibold">{group.totalCount.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">{t('common.heads', 'heads')}</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {group.items.map(snapshot => {
                          const hoursSinceCreation = differenceInHours(new Date(), new Date(snapshot.created_at));
                          const canDelete = hoursSinceCreation <= 24;
                          const isDeleting = deletingId === snapshot.id;
                          
                          return (
                            <div key={snapshot.id} className="p-3 rounded-lg border bg-card relative">
                              {canDelete && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="absolute top-1 right-1 h-6 w-6 p-0 text-destructive hover:text-destructive"
                                  onClick={async () => {
                                    if (confirm('Are you sure you want to delete this snapshot? This action cannot be undone.')) {
                                      setDeletingId(snapshot.id);
                                      try {
                                        await deleteSnapshot.mutateAsync(snapshot.id);
                                        toast.success('Snapshot deleted successfully');
                                      } catch (error: any) {
                                        toast.error(error.message || 'Failed to delete snapshot');
                                      } finally {
                                        setDeletingId(null);
                                      }
                                    }
                                  }}
                                  disabled={isDeleting || deleteSnapshot.isPending}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">
                                  {LIVESTOCK_CATEGORIES[snapshot.category].label}
                                </span>
                                <ConfidenceBadge level={snapshot.data_confidence_level} />
                              </div>
                              <div className="text-xl font-semibold">{snapshot.count.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">{snapshot.breed}</div>
                              {canDelete && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  Can delete for {Math.max(0, 24 - hoursSinceCreation)}h
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="forecast" className="space-y-4">
            {/* Indicative Disclaimer */}
            <div className="flex items-start gap-3 p-4 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/50">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-800 dark:text-blue-200">
                  Indicative / Non-binding Forecast
                </p>
                <p className="text-blue-700 dark:text-blue-300 mt-0.5">
                  This forecast is based on your herd structure data and reference calving rates. It does not create any market commitments and is not linked to pricing or matching.
                </p>
              </div>
            </div>

            {forecastLoading ? (
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ) : breedingCowsForecast.length === 0 ? (
              <EmptyState
                icon={TrendingUp}
                message="No forecast data available"
                helperText="Submit herd structure snapshots with breeding cow data to see your indicative outlook."
              />
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      Indicative Herd Outlook
                    </CardTitle>
                    <CardDescription>
                      Estimated future supply based on your declared breeding stock
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg border bg-card">
                        <div className="text-sm text-muted-foreground mb-1">Breeding Cows</div>
                        <div className="text-2xl font-bold">{totalBreedingCows.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">declared stock</div>
                      </div>
                      <div className="p-4 rounded-lg border bg-card">
                        <div className="text-sm text-muted-foreground mb-1">Reference Rate</div>
                        <div className="text-2xl font-bold">{(calvingRate * 100).toFixed(0)}%</div>
                        <div className="text-xs text-muted-foreground">calving rate</div>
                      </div>
                      <div className="p-4 rounded-lg border bg-primary/5 border-primary/20">
                        <div className="text-sm text-muted-foreground mb-1">Estimated Calves</div>
                        <div className="text-2xl font-bold text-primary">{estimatedCalves.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">indicative estimate</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Forecast by Period</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {breedingCowsForecast.map((f, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                          <div>
                            <div className="font-medium">
                              {f.reporting_quarter ? `Q${f.reporting_quarter} ` : ''}{f.reporting_year}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {f.current_count.toLocaleString()} breeding cows
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-primary">
                              ~{Math.round(f.estimated_offspring).toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">est. calves</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>

        <HerdSnapshotWizard open={wizardOpen} onOpenChange={setWizardOpen} />
      </div>
    </MainLayout>
  );
}
