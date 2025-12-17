import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRole } from '@/contexts/RoleContext';
import { Boxes, TrendingUp, Clock, CheckCircle2, AlertCircle, ArrowRight, Calendar, Shield, Info } from 'lucide-react';

const stats = {
  farmer: [
    { label: 'Active Batches', value: '12', icon: Boxes, description: 'Total batches in system' },
    { label: 'Batches Requiring Action', value: '2', icon: AlertCircle, highlight: true, description: 'Need your attention' },
    { label: 'Confirmed Commitments', value: '4', icon: CheckCircle2, description: 'Ready for delivery' },
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

const farmerStatus = {
  gradingLevel: 'Declared Supplier',
  gradingDescription: 'Your farm has been verified and you are eligible to participate in pool matching.',
  accessLevel: 'Eligible for Pool Invitations',
  nextAction: 'Confirm at least one batch to increase your matching priority.',
  gradingLevels: [
    { name: 'Observer', active: false },
    { name: 'Declared Supplier', active: true },
    { name: 'Standard Supplier', active: false },
  ],
};

const recentActivity = [
  { id: 1, description: 'Batch #2847 ready for confirmation', status: 'forecast' as const, time: '2 hours ago', action: 'confirm', actionLabel: 'Confirm', priority: 'high' },
  { id: 2, description: 'Pool invitation from MPK-04 awaiting response', status: 'soft-committed' as const, time: '4 hours ago', action: 'review', actionLabel: 'Review', priority: 'high' },
  { id: 3, description: 'Batch #2845 details incomplete', status: 'forecast' as const, time: '6 hours ago', action: 'update', actionLabel: 'Update batch', priority: 'medium' },
  { id: 4, description: 'Grading completed for Batch #2843', status: 'confirmed' as const, time: '1 day ago', action: null, actionLabel: null, priority: 'info' },
  { id: 5, description: 'Batch #2840 delivered successfully', status: 'confirmed' as const, time: '3 days ago', action: null, actionLabel: null, priority: 'info' },
];

const nextMatchingWindow = {
  date: 'Dec 20, 2025',
  daysRemaining: 3,
};

export default function Overview() {
  const { role, roleName } = useRole();
  const currentStats = stats[role];

  return (
    <MainLayout>
      <PageHeader 
        title="Overview" 
        description={`Welcome to Turan Standard Pool — ${roleName} Dashboard`} 
      />

      {/* Farmer Status Banner */}
      {role === 'farmer' && (
        <Card className="mb-6 border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="p-5">
            <div className="flex flex-col gap-4">
              {/* Status Header */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-muted-foreground">Your Grading Level:</span>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-semibold">
                        {farmerStatus.gradingLevel}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground max-w-md">
                      {farmerStatus.gradingDescription}
                    </p>
                  </div>
                </div>
                
                {/* Grading Progress */}
                <div className="flex items-center gap-1">
                  {farmerStatus.gradingLevels.map((level, idx) => (
                    <div key={level.name} className="flex items-center">
                      <div className={`px-3 py-1.5 rounded text-xs font-medium ${
                        level.active 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-secondary text-muted-foreground'
                      }`}>
                        {level.name}
                      </div>
                      {idx < farmerStatus.gradingLevels.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-muted-foreground mx-1" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Access & Next Action */}
              <div className="flex flex-col md:flex-row md:items-center gap-4 pt-3 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-confirmed" />
                  <span className="text-sm text-muted-foreground">Access:</span>
                  <span className="text-sm font-medium text-foreground">{farmerStatus.accessLevel}</span>
                </div>
                <div className="hidden md:block w-px h-4 bg-border" />
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Next Step:</span>
                  <span className="text-sm text-foreground">{farmerStatus.nextAction}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Matching Window Alert for Farmer */}
      {role === 'farmer' && (
        <Card className="mb-6 border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Next Matching Window</p>
                  <p className="text-lg font-bold text-amber-600">{nextMatchingWindow.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                  {nextMatchingWindow.daysRemaining} days remaining
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Complete pending actions before this date
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 ${role === 'farmer' ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
        {currentStats.map((stat, index) => (
          <Card key={index} className={stat.highlight ? 'border-amber-500/50 bg-amber-500/5' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={`text-2xl font-semibold mt-1 ${stat.highlight ? 'text-amber-600' : 'text-foreground'}`}>{stat.value}</p>
                  {stat.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{stat.description}</p>
                  )}
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
        {/* Action Feed */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">
              {role === 'farmer' ? 'Action Feed' : 'Recent Activity'}
            </CardTitle>
            {role === 'farmer' && (
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">
                {recentActivity.filter(a => a.action).length} pending
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div 
                  key={activity.id} 
                  className={`flex items-center justify-between py-3 px-3 rounded-lg border transition-colors ${
                    activity.priority === 'high' 
                      ? 'border-amber-500/40 bg-amber-500/5' 
                      : activity.priority === 'medium'
                      ? 'border-amber-500/20 bg-amber-500/[0.02]'
                      : 'border-border/50 bg-transparent'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {activity.priority === 'high' && (
                        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      )}
                      {activity.priority === 'info' && (
                        <Info className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <p className={`text-sm truncate ${
                        activity.action ? 'text-foreground font-medium' : 'text-muted-foreground'
                      }`}>
                        {activity.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                      <StatusBadge status={activity.status} />
                    </div>
                  </div>
                  {activity.action && (
                    <Button 
                      variant={activity.priority === 'high' ? 'default' : 'outline'} 
                      size="sm" 
                      className="ml-3 flex-shrink-0"
                    >
                      {activity.actionLabel}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Platform Status</span>
                <span className="text-sm font-medium text-status-confirmed">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Data Sync</span>
                <span className="text-sm text-foreground">Last updated 5 min ago</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current Pool Period</span>
                <span className="text-sm text-foreground">Week 51, 2025</span>
              </div>
              {role !== 'farmer' && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Next Matching Window</span>
                  <span className="text-sm text-foreground">Dec 20, 2025</span>
                </div>
              )}
            </div>
            
            {role === 'farmer' && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Your Batch Summary</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-status-confirmed/10 rounded text-center">
                    <p className="text-lg font-semibold text-status-confirmed">4</p>
                    <p className="text-xs text-muted-foreground">Confirmed</p>
                  </div>
                  <div className="p-2 bg-status-soft-committed/10 rounded text-center">
                    <p className="text-lg font-semibold text-status-soft-committed">5</p>
                    <p className="text-xs text-muted-foreground">Soft Comm.</p>
                  </div>
                  <div className="p-2 bg-status-forecast/10 rounded text-center">
                    <p className="text-lg font-semibold text-status-forecast">3</p>
                    <p className="text-xs text-muted-foreground">Forecast</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
