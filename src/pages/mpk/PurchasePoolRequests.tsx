import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Clock, CheckCircle2, AlertTriangle, Info, MapPin, Medal, CalendarClock } from 'lucide-react';

const requests = [
  { 
    id: 'REQ-2024-087', 
    headsRequested: 120, 
    headsMatched: 120,
    gradeRequired: 'A', 
    region: 'Almaty / Akmola',
    targetWeek: 'Week 52',
    targetDate: 'Dec 23–29',
    status: 'fulfilled' as const,
    createdAt: 'Dec 10, 2025',
    supply: { confirmed: 120, softCommitted: 0, forecast: 0 },
    atRisk: false,
  },
  { 
    id: 'REQ-2024-088', 
    headsRequested: 85, 
    headsMatched: 65,
    gradeRequired: 'A/B', 
    region: 'Any',
    targetWeek: 'Week 1',
    targetDate: 'Dec 30 – Jan 5',
    status: 'partial' as const,
    createdAt: 'Dec 12, 2025',
    supply: { confirmed: 45, softCommitted: 20, forecast: 35 },
    atRisk: false,
  },
  { 
    id: 'REQ-2024-089', 
    headsRequested: 50, 
    headsMatched: 12,
    gradeRequired: 'A', 
    region: 'East Kazakhstan',
    targetWeek: 'Week 2',
    targetDate: 'Jan 6–12',
    status: 'partial' as const,
    createdAt: 'Dec 15, 2025',
    supply: { confirmed: 8, softCommitted: 4, forecast: 18 },
    atRisk: true,
  },
  { 
    id: 'REQ-2024-090', 
    headsRequested: 40, 
    headsMatched: 0,
    gradeRequired: 'A', 
    region: 'Karaganda',
    targetWeek: 'Week 3',
    targetDate: 'Jan 13–19',
    status: 'pending' as const,
    createdAt: 'Dec 16, 2025',
    supply: { confirmed: 0, softCommitted: 0, forecast: 25 },
    atRisk: true,
  },
];

const statusConfig = {
  fulfilled: { 
    label: 'Fulfilled', 
    icon: CheckCircle2, 
    className: 'bg-status-confirmed/10 text-status-confirmed border-status-confirmed/30',
    description: 'Request fully matched. Awaiting delivery confirmation.'
  },
  partial: { 
    label: 'Partial', 
    icon: Clock, 
    className: 'bg-status-soft-committed/10 text-status-soft-committed border-status-soft-committed/30',
    description: 'Matching in progress. Additional supply being sourced.'
  },
  pending: { 
    label: 'Pending', 
    icon: Clock, 
    className: 'bg-status-forecast/10 text-status-forecast border-status-forecast/30',
    description: 'Request submitted. Awaiting initial matches.'
  },
};

export default function PurchasePoolRequests() {
  return (
    <MainLayout>
      <PageHeader 
        title="Purchase Pool Requests" 
        description="Monitor procurement progress and manage request parameters" 
      />

      {/* Timing Context */}
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-foreground font-medium">How Matching Works</p>
              <p className="text-sm text-muted-foreground mt-1">
                Matching continues until the start of the target week. Adjust request parameters to improve fill rates before the deadline.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
              const config = statusConfig[request.status];
              const StatusIcon = config.icon;
              const fillRate = Math.round((request.headsMatched / request.headsRequested) * 100);
              const isActionable = request.status === 'pending' || request.status === 'partial';
              
              return (
                <div 
                  key={request.id} 
                  className={`p-4 border rounded-lg transition-colors ${
                    request.atRisk 
                      ? 'border-amber-500/50 bg-amber-500/5' 
                      : 'border-border hover:bg-muted/30'
                  }`}
                >
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-foreground">{request.id}</p>
                        <Badge variant="outline" className={config.className}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                        {request.atRisk && (
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            At Risk
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div className="bg-secondary/30 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">Fill Rate</span>
                      <span className={`text-lg font-bold ${
                        fillRate >= 100 ? 'text-status-confirmed' : 
                        fillRate >= 50 ? 'text-foreground' : 'text-amber-600'
                      }`}>
                        {fillRate}%
                      </span>
                    </div>
                    <Progress 
                      value={fillRate} 
                      className={`h-3 ${request.atRisk ? '[&>div]:bg-amber-500' : ''}`}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">{request.headsMatched}</span> / {request.headsRequested} heads matched
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {request.headsRequested - request.headsMatched} remaining
                      </span>
                    </div>
                  </div>

                  {/* Supply Signals */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="p-2 bg-secondary/20 rounded">
                      <p className="text-xs text-status-confirmed font-medium">Confirmed</p>
                      <p className="text-sm font-semibold text-foreground">{request.supply.confirmed} heads</p>
                    </div>
                    <div className="p-2 bg-secondary/20 rounded">
                      <p className="text-xs text-status-soft-committed font-medium">Soft Committed</p>
                      <p className="text-sm font-semibold text-foreground">{request.supply.softCommitted} heads</p>
                    </div>
                    <div className="p-2 bg-secondary/20 rounded">
                      <p className="text-xs text-status-forecast font-medium">Forecast</p>
                      <p className="text-sm font-semibold text-foreground">{request.supply.forecast} heads</p>
                    </div>
                    <div className="p-2 bg-secondary/20 rounded">
                      <p className="text-xs text-muted-foreground font-medium">Potential Total</p>
                      <p className="text-sm font-semibold text-foreground">
                        {request.supply.confirmed + request.supply.softCommitted + request.supply.forecast} heads
                      </p>
                    </div>
                  </div>

                  {/* Request Parameters */}
                  <div className="grid grid-cols-3 gap-4 py-3 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Medal className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Grade</p>
                        <p className="text-sm font-medium text-foreground">{request.gradeRequired}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Region</p>
                        <p className="text-sm font-medium text-foreground">{request.region}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarClock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Target Week</p>
                        <p className="text-sm font-medium text-foreground">{request.targetWeek}</p>
                        <p className="text-xs text-muted-foreground">{request.targetDate}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions for Actionable Requests */}
                  {isActionable && (
                    <div className="pt-3 mt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">Optimization options:</p>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" className="text-xs">
                          <MapPin className="w-3 h-3 mr-1" />
                          Expand Regions
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs">
                          <Medal className="w-3 h-3 mr-1" />
                          Lower Grade Requirement
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs">
                          <CalendarClock className="w-3 h-3 mr-1" />
                          Extend Target Week
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Request Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 bg-secondary/50 rounded-lg text-center">
              <p className="text-2xl font-semibold text-foreground">{requests.length}</p>
              <p className="text-sm text-muted-foreground">Total Requests</p>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg text-center">
              <p className="text-2xl font-semibold text-foreground">
                {requests.reduce((sum, r) => sum + r.headsRequested, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Heads Requested</p>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg text-center">
              <p className="text-2xl font-semibold text-foreground">
                {requests.reduce((sum, r) => sum + r.headsMatched, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Heads Matched</p>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg text-center">
              <p className="text-2xl font-semibold text-accent">
                {Math.round((requests.reduce((sum, r) => sum + r.headsMatched, 0) / requests.reduce((sum, r) => sum + r.headsRequested, 0)) * 100)}%
              </p>
              <p className="text-sm text-muted-foreground">Overall Fill Rate</p>
            </div>
            <div className="p-4 bg-amber-500/10 rounded-lg text-center border border-amber-500/30">
              <p className="text-2xl font-semibold text-amber-600">
                {requests.filter(r => r.atRisk).length}
              </p>
              <p className="text-sm text-muted-foreground">At Risk</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
