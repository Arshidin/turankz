import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const marketData = {
  summary: {
    totalAvailable: 1256,
    gradeA: 487,
    gradeB: 512,
    gradeC: 257,
  },
  regions: [
    { name: 'Almaty Oblast', available: 345, gradeA: 142, gradeB: 134, gradeC: 69 },
    { name: 'Akmola Oblast', available: 289, gradeA: 98, gradeB: 127, gradeC: 64 },
    { name: 'East Kazakhstan', available: 267, gradeA: 112, gradeB: 102, gradeC: 53 },
    { name: 'Karaganda Oblast', available: 198, gradeA: 78, gradeB: 85, gradeC: 35 },
    { name: 'Kostanay Oblast', available: 157, gradeA: 57, gradeB: 64, gradeC: 36 },
  ],
  upcomingBatches: [
    { farmId: 'FRM-892', region: 'Almaty', heads: 45, grade: 'A', status: 'confirmed' as const, date: 'Dec 28' },
    { farmId: 'FRM-654', region: 'Akmola', heads: 38, grade: 'A', status: 'soft-committed' as const, date: 'Dec 30' },
    { farmId: 'FRM-321', region: 'Karaganda', heads: 52, grade: 'B', status: 'forecast' as const, date: 'Jan 2' },
    { farmId: 'FRM-445', region: 'East KZ', heads: 30, grade: 'A', status: 'forecast' as const, date: 'Jan 5' },
    { farmId: 'FRM-778', region: 'Almaty', heads: 28, grade: 'B', status: 'forecast' as const, date: 'Jan 8' },
  ]
};

export default function MarketOverview() {
  return (
    <MainLayout>
      <PageHeader 
        title="Market Overview" 
        description="View available livestock supply across regions and grades" 
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Available</p>
            <p className="text-2xl font-semibold text-foreground">{marketData.summary.totalAvailable}</p>
            <p className="text-xs text-muted-foreground">heads this period</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Grade A</p>
            <p className="text-2xl font-semibold text-foreground">{marketData.summary.gradeA}</p>
            <p className="text-xs text-accent">Premium quality</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Grade B</p>
            <p className="text-2xl font-semibold text-foreground">{marketData.summary.gradeB}</p>
            <p className="text-xs text-muted-foreground">Standard quality</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Grade C</p>
            <p className="text-2xl font-semibold text-foreground">{marketData.summary.gradeC}</p>
            <p className="text-xs text-muted-foreground">Economy quality</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">Supply by Region</CardTitle>
            <Select defaultValue="all">
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                <SelectItem value="a">Grade A</SelectItem>
                <SelectItem value="b">Grade B</SelectItem>
                <SelectItem value="c">Grade C</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {marketData.regions.map((region) => (
                <div key={region.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{region.name}</p>
                    <p className="text-xs text-muted-foreground">
                      A: {region.gradeA} • B: {region.gradeB} • C: {region.gradeC}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-foreground">{region.available}</p>
                    <p className="text-xs text-muted-foreground">heads</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Upcoming Batches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {marketData.upcomingBatches.map((batch, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <span className="text-sm font-medium text-foreground">{batch.grade}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{batch.farmId}</p>
                      <p className="text-xs text-muted-foreground">{batch.region} • {batch.heads} heads</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={batch.status} />
                    <p className="text-xs text-muted-foreground mt-1">{batch.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
