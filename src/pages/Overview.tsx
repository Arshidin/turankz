import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useRole } from '@/contexts/RoleContext';
import { Boxes, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';

const stats = {
  farmer: [
    { label: 'Active Batches', value: '12', icon: Boxes },
    { label: 'Confirmed Orders', value: '4', icon: CheckCircle2 },
    { label: 'Pending Requests', value: '3', icon: Clock },
    { label: 'Market Interest', value: '+8%', icon: TrendingUp },
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
  { id: 1, description: 'Batch #2847 status updated', status: 'confirmed' as const, time: '2 hours ago' },
  { id: 2, description: 'New pool request from MPK-04', status: 'soft-committed' as const, time: '4 hours ago' },
  { id: 3, description: 'Batch #2845 added to watchlist', status: 'forecast' as const, time: '6 hours ago' },
  { id: 4, description: 'Grading completed for Batch #2843', status: 'confirmed' as const, time: '1 day ago' },
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {currentStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-semibold text-foreground mt-1">{stat.value}</p>
                </div>
                <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
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
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                  </div>
                  <StatusBadge status={activity.status} />
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
