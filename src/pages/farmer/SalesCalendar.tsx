import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const calendarWeeks = [
  {
    week: 'Week 52',
    dates: 'Dec 23 - Dec 29',
    events: [
      { day: 'Mon', date: '23', batches: [] },
      { day: 'Tue', date: '24', batches: [] },
      { day: 'Wed', date: '25', batches: [] },
      { day: 'Thu', date: '26', batches: [] },
      { day: 'Fri', date: '27', batches: [] },
      { day: 'Sat', date: '28', batches: [{ id: 'B-2847', heads: 45, status: 'confirmed' as const }] },
      { day: 'Sun', date: '29', batches: [] },
    ]
  },
  {
    week: 'Week 1',
    dates: 'Dec 30 - Jan 5',
    events: [
      { day: 'Mon', date: '30', batches: [{ id: 'B-2845', heads: 32, status: 'soft-committed' as const }] },
      { day: 'Tue', date: '31', batches: [] },
      { day: 'Wed', date: '1', batches: [] },
      { day: 'Thu', date: '2', batches: [] },
      { day: 'Fri', date: '3', batches: [] },
      { day: 'Sat', date: '4', batches: [] },
      { day: 'Sun', date: '5', batches: [{ id: 'B-2843', heads: 28, status: 'forecast' as const }] },
    ]
  }
];

export default function SalesCalendar() {
  return (
    <MainLayout>
      <PageHeader 
        title="Sales Calendar" 
        description="View scheduled batch deliveries and market windows" 
      />

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-medium">December 2025 - January 2026</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {calendarWeeks.map((week) => (
              <div key={week.week}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium text-foreground">{week.week}</span>
                  <span className="text-xs text-muted-foreground">{week.dates}</span>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {week.events.map((event, idx) => (
                    <div 
                      key={idx} 
                      className="min-h-[100px] p-2 bg-secondary/50 rounded-md border border-border"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">{event.day}</span>
                        <span className="text-sm font-medium text-foreground">{event.date}</span>
                      </div>
                      {event.batches.map((batch) => (
                        <div 
                          key={batch.id} 
                          className="p-2 bg-card rounded border border-border text-xs"
                        >
                          <p className="font-medium text-foreground">{batch.id}</p>
                          <p className="text-muted-foreground">{batch.heads} heads</p>
                          <StatusBadge status={batch.status} className="mt-1 text-[10px] px-1.5" />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Upcoming Deliveries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">B-2847 → MPK-04</p>
                <p className="text-xs text-muted-foreground">45 heads • Dec 28, 2025</p>
              </div>
              <StatusBadge status="confirmed" />
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">B-2845 → MPK-02</p>
                <p className="text-xs text-muted-foreground">32 heads • Dec 30, 2025</p>
              </div>
              <StatusBadge status="soft-committed" />
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">B-2843 → Unassigned</p>
                <p className="text-xs text-muted-foreground">28 heads • Jan 5, 2026</p>
              </div>
              <StatusBadge status="forecast" />
            </div>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
