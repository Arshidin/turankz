import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, FileText, Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useMyHerdSnapshots, LIVESTOCK_CATEGORIES, CONFIDENCE_LEVELS, type HerdStructureSnapshot } from '@/hooks/useHerdStructure';
import { HerdSnapshotWizard } from '@/components/herd/HerdSnapshotWizard';
import { format } from 'date-fns';

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
  const [wizardOpen, setWizardOpen] = useState(false);

  const groupedSnapshots = snapshots ? groupSnapshotsByPeriod(snapshots) : [];

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
                    {group.items.map(snapshot => (
                      <div key={snapshot.id} className="p-3 rounded-lg border bg-card">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            {LIVESTOCK_CATEGORIES[snapshot.category].label}
                          </span>
                          <ConfidenceBadge level={snapshot.data_confidence_level} />
                        </div>
                        <div className="text-xl font-semibold">{snapshot.count.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">{snapshot.breed}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <HerdSnapshotWizard open={wizardOpen} onOpenChange={setWizardOpen} />
      </div>
    </MainLayout>
  );
}

function ConfidenceBadge({ level }: { level: string }) {
  const config = {
    self_declared: { icon: Clock, variant: 'secondary' as const, color: 'text-muted-foreground' },
    reviewed: { icon: AlertCircle, variant: 'outline' as const, color: 'text-amber-600' },
    verified: { icon: CheckCircle2, variant: 'default' as const, color: 'text-emerald-600' },
  };
  
  const { icon: Icon, variant, color } = config[level as keyof typeof config] || config.self_declared;
  
  return (
    <Badge variant={variant} className="text-[10px] px-1.5 py-0">
      <Icon className={`w-3 h-3 ${color}`} />
    </Badge>
  );
}
