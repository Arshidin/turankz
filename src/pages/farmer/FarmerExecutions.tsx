import { useTranslation } from 'react-i18next';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useExecutions } from '@/hooks/useExecutions';
import { useAuthContext } from '@/contexts/AuthContext';
import { ClipboardList, Calendar, CheckCircle2, Clock, Truck } from 'lucide-react';
import { format } from 'date-fns';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive'; icon: React.ComponentType<{ className?: string }> }> = {
  matched: { label: 'Matched', variant: 'secondary', icon: Clock },
  scheduled: { label: 'Scheduled', variant: 'outline', icon: Calendar },
  delivered: { label: 'Delivered', variant: 'default', icon: Truck },
  confirmed: { label: 'Confirmed', variant: 'default', icon: CheckCircle2 },
  settled: { label: 'Settled', variant: 'default', icon: CheckCircle2 },
  closed: { label: 'Closed', variant: 'secondary', icon: CheckCircle2 },
};

export default function FarmerExecutions() {
  const { t } = useTranslation();
  const { user } = useAuthContext();
  const { data: allExecutions = [], isLoading } = useExecutions();

  // For now show all executions - in production filter by farmer's batches
  const farmerExecutions = allExecutions;

  if (isLoading) {
    return (
      <MainLayout>
        <PageHeader 
          title={t('nav.contractsExecution')} 
          description="View your matched contracts and delivery status"
        />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader 
        title={t('nav.contractsExecution')} 
        description="View your matched contracts and delivery status"
      />

      {farmerExecutions.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          message="No contracts yet"
          helperText="When your batches are matched with MPK requests, they will appear here."
        />
      ) : (
        <div className="space-y-4">
          {farmerExecutions.map(execution => {
            const config = statusConfig[execution.status] || statusConfig.matched;
            const StatusIcon = config.icon;
            
            return (
              <Card key={execution.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium">
                      Batch #{execution.batch?.batch_number}
                    </CardTitle>
                    <Badge variant={config.variant} className="gap-1">
                      <StatusIcon className="w-3 h-3" />
                      {config.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Volume</p>
                      <p className="font-medium">{execution.matched_volume} heads</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">MPK</p>
                      <p className="font-medium">{execution.request?.mpk_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Delivery Period</p>
                      <p className="font-medium capitalize">{execution.delivery_period?.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Created</p>
                      <p className="font-medium">{format(new Date(execution.created_at), 'dd MMM yyyy')}</p>
                    </div>
                  </div>
                  
                  {execution.expected_delivery_start && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Expected delivery: {format(new Date(execution.expected_delivery_start), 'dd MMM')}
                          {execution.expected_delivery_end && ` - ${format(new Date(execution.expected_delivery_end), 'dd MMM yyyy')}`}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </MainLayout>
  );
}
