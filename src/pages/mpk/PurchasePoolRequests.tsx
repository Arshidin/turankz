import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, CheckCircle2, XCircle } from 'lucide-react';

const requests = [
  { 
    id: 'REQ-2024-087', 
    headsRequested: 120, 
    headsMatched: 120,
    gradeRequired: 'A', 
    region: 'Almaty / Akmola',
    targetWeek: 'Week 52',
    status: 'fulfilled',
    createdAt: 'Dec 10, 2025'
  },
  { 
    id: 'REQ-2024-088', 
    headsRequested: 85, 
    headsMatched: 65,
    gradeRequired: 'A/B', 
    region: 'Any',
    targetWeek: 'Week 1',
    status: 'partial',
    createdAt: 'Dec 12, 2025'
  },
  { 
    id: 'REQ-2024-089', 
    headsRequested: 50, 
    headsMatched: 0,
    gradeRequired: 'A', 
    region: 'East Kazakhstan',
    targetWeek: 'Week 2',
    status: 'pending',
    createdAt: 'Dec 15, 2025'
  },
];

const statusConfig = {
  fulfilled: { label: 'Fulfilled', icon: CheckCircle2, className: 'bg-status-confirmed-bg text-status-confirmed' },
  partial: { label: 'Partial', icon: Clock, className: 'bg-status-soft-committed-bg text-status-soft-committed' },
  pending: { label: 'Pending', icon: Clock, className: 'bg-status-forecast-bg text-status-forecast' },
  cancelled: { label: 'Cancelled', icon: XCircle, className: 'bg-muted text-muted-foreground' },
};

export default function PurchasePoolRequests() {
  return (
    <MainLayout>
      <PageHeader 
        title="Purchase Pool Requests" 
        description="Create and track procurement requests for livestock batches" 
      />

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-medium">Active Requests</CardTitle>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requests.map((request) => {
              const config = statusConfig[request.status as keyof typeof statusConfig];
              const StatusIcon = config.icon;
              
              return (
                <div key={request.id} className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{request.id}</p>
                        <Badge variant="secondary" className={config.className}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Created {request.createdAt}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-foreground">
                        {request.headsMatched}/{request.headsRequested}
                      </p>
                      <p className="text-xs text-muted-foreground">heads matched</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 pt-3 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">Grade Required</p>
                      <p className="text-sm font-medium text-foreground">{request.gradeRequired}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Region Preference</p>
                      <p className="text-sm font-medium text-foreground">{request.region}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Target Week</p>
                      <p className="text-sm font-medium text-foreground">{request.targetWeek}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Fill Rate</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-accent rounded-full transition-all"
                            style={{ width: `${(request.headsMatched / request.headsRequested) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {Math.round((request.headsMatched / request.headsRequested) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Request Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-secondary/50 rounded-lg text-center">
              <p className="text-2xl font-semibold text-foreground">3</p>
              <p className="text-sm text-muted-foreground">Total Requests</p>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg text-center">
              <p className="text-2xl font-semibold text-foreground">255</p>
              <p className="text-sm text-muted-foreground">Heads Requested</p>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg text-center">
              <p className="text-2xl font-semibold text-foreground">185</p>
              <p className="text-sm text-muted-foreground">Heads Matched</p>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg text-center">
              <p className="text-2xl font-semibold text-accent">73%</p>
              <p className="text-sm text-muted-foreground">Overall Fill Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
