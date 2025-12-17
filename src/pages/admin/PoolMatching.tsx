import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { GitMerge, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

const pendingMatches = [
  {
    id: 'MATCH-001',
    request: { id: 'REQ-088', mpk: 'MPK-04', headsNeeded: 20, grade: 'A', region: 'Almaty' },
    batch: { id: 'B-2850', farm: 'Steppe Gold', heads: 42, grade: 'A (pending)', region: 'Akmola' },
    matchScore: 92,
    status: 'proposed'
  },
  {
    id: 'MATCH-002',
    request: { id: 'REQ-089', mpk: 'MPK-02', headsNeeded: 50, grade: 'A/B', region: 'Any' },
    batch: { id: 'B-2849', farm: 'Karaganda Cattle', heads: 35, grade: 'B (pending)', region: 'Karaganda' },
    matchScore: 78,
    status: 'proposed'
  },
];

const completedMatches = [
  { requestId: 'REQ-087', mpk: 'MPK-04', batchId: 'B-2847', farm: 'Alash Agro', heads: 45, matchedOn: 'Dec 14' },
  { requestId: 'REQ-086', mpk: 'MPK-02', batchId: 'B-2845', farm: 'Steppe Gold', heads: 32, matchedOn: 'Dec 13' },
  { requestId: 'REQ-085', mpk: 'MPK-01', batchId: 'B-2843', farm: 'Karaganda Cattle', heads: 28, matchedOn: 'Dec 12' },
];

export default function PoolMatching() {
  return (
    <MainLayout>
      <PageHeader 
        title="Pool Matching" 
        description="Match livestock batches with procurement requests" 
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <GitMerge className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">2</p>
              <p className="text-sm text-muted-foreground">Pending Matches</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-semibold text-foreground">18</p>
            <p className="text-sm text-muted-foreground">Open Requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-semibold text-foreground">156</p>
            <p className="text-sm text-muted-foreground">Available Batches</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-semibold text-accent">94%</p>
            <p className="text-sm text-muted-foreground">Match Success Rate</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base font-medium">Proposed Matches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingMatches.map((match) => (
              <div key={match.id} className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{match.id}</span>
                    <Badge variant="secondary" className="bg-status-forecast-bg text-status-forecast">
                      <Clock className="w-3 h-3 mr-1" />
                      Proposed
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Match Score:</span>
                    <span className={`text-sm font-semibold ${match.matchScore >= 80 ? 'text-accent' : 'text-status-forecast'}`}>
                      {match.matchScore}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <div className="p-3 bg-secondary/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Request</p>
                    <p className="text-sm font-medium text-foreground">{match.request.id}</p>
                    <p className="text-xs text-muted-foreground">{match.request.mpk}</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-xs"><span className="text-muted-foreground">Needs:</span> {match.request.headsNeeded} heads</p>
                      <p className="text-xs"><span className="text-muted-foreground">Grade:</span> {match.request.grade}</p>
                      <p className="text-xs"><span className="text-muted-foreground">Region:</span> {match.request.region}</p>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <ArrowRight className="w-5 h-5 text-primary" />
                    </div>
                  </div>

                  <div className="p-3 bg-secondary/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Batch</p>
                    <p className="text-sm font-medium text-foreground">{match.batch.id}</p>
                    <p className="text-xs text-muted-foreground">{match.batch.farm}</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-xs"><span className="text-muted-foreground">Available:</span> {match.batch.heads} heads</p>
                      <p className="text-xs"><span className="text-muted-foreground">Grade:</span> {match.batch.grade}</p>
                      <p className="text-xs"><span className="text-muted-foreground">Region:</span> {match.batch.region}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
                  <Button variant="outline" size="sm">Reject</Button>
                  <Button size="sm">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Confirm Match
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Recent Matches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {completedMatches.map((match, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-status-confirmed-bg rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-status-confirmed" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {match.requestId} → {match.batchId}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {match.mpk} ← {match.farm} • {match.heads} heads
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{match.matchedOn}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
