import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { useRole } from '@/contexts/RoleContext';
import { Boxes, TrendingUp, Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

const stats = {
  farmer: [
    { label: 'Active Batches', value: '12', icon: Boxes },
    { label: 'Confirmed Orders', value: '4', icon: CheckCircle2 },
    { label: 'Pending Requests', value: '3', icon: Clock },
    { label: 'Batches Requiring Action', value: '2', icon: AlertCircle, highlight: true },
  ],
  mpk: [
    { label: 'Available Batches', value: '156', icon: Boxes },
    { label: 'In Watchlist', value: '23', icon: CheckCircle2 },
    { label: 'Active Requests', value: '7', icon: Clock },
    { label: 'Pool Fill Rate', value: '72%', icon: TrendingUp },
  ],
  admin: [
    { label: 'Registered Farmers', value: '89', icon: Boxes },
    { label: 'Active MPKs', value: '12', icon: CheckCircle2 },
    { label: 'Pending Matches', value: '18', icon: Clock },
    { label: 'Match Success', value: '94%', icon: TrendingUp },
  ],
};

const recentActivity = [
  { id: 1, description: 'Batch #2847 ready for confirmation', status: 'forecast' as const, time: '2 hours ago', action: 'confirm', actionLabel: 'Confirm' },
  { id: 2, description: 'Pool request from MPK-04 requires review', status: 'soft-committed' as const, time: '4 hours ago', action: 'review', actionLabel: 'Review' },
  { id: 3, description: 'Batch #2845 details need update', status: 'forecast' as const, time: '6 hours ago', action: 'update', actionLabel: 'Update batch' },
  { id: 4, description: 'Grading completed for Batch #2843', status: 'confirmed' as const, time: '1 day ago', action: null, actionLabel: null },
];

export default function Overview() {
  const { role, roleName } = useRole();
  const currentStats = stats[role];

  return (
    <MainLayout>
      <PageHeader 
        title="Overview" 
        description={`Welcome to Turan Standard Pool — ${roleName} Dashboard`} 
      />

      {role === 'farmer' && (
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Your Status:</span>
                  <span className="text-sm font-semibold text-primary">Declared Supplier</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Access:</span>
                  <span className="text-sm text-foreground">Eligible for Pool Invitations</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Next Step:</span>
                <span className="text-foreground">Confirm at least one batch to increase priority</span>
                <ArrowRight className="w-4 h-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {currentStats.map((stat, index) => (
          <Card key={index} className={stat.highlight ? 'border-amber-500/50 bg-amber-500/5' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={`text-2xl font-semibold mt-1 ${stat.highlight ? 'text-amber-600' : 'text-foreground'}`}>{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.highlight ? 'bg-amber-500/10' : 'bg-secondary'}`}>
                  <stat.icon className={`w-5 h-5 ${stat.highlight ? 'text-amber-600' : 'text-primary'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div 
                  key={activity.id} 
                  className={`flex items-center justify-between py-3 px-3 rounded-lg border ${
                    activity.action ? 'border-amber-500/30 bg-amber-500/5' : 'border-border bg-transparent'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {activity.action && <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />}
                      <p className="text-sm text-foreground truncate">{activity.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                      <StatusBadge status={activity.status} />
                    </div>
                  </div>
                  {activity.action && (
                    <Button variant="outline" size="sm" className="ml-3 flex-shrink-0">
                      {activity.actionLabel}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Platform Status</span>
                <span className="text-sm font-medium text-accent">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Data Sync</span>
                <span className="text-sm text-foreground">Last updated 5 min ago</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current Pool Period</span>
                <span className="text-sm text-foreground">Week 51, 2025</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Next Matching Window</span>
                <span className="text-sm text-foreground">Dec 20, 2025</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}